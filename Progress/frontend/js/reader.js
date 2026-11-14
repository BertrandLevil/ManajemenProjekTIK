import { comics as defaultComics } from "./data.js";
import { header } from "./header.js";
import { frontReview } from "./review.js";

function getAllComics() {
    let savedComics = [];

    try {
        savedComics = JSON.parse(
            localStorage.getItem("comicid_creator_comics") || "[]"
        );

        if (!Array.isArray(savedComics)) {
            savedComics = [];
        }
    } catch (error) {
        console.error("Gagal membaca komik kreator:", error);
    }

    const savedMap = new Map(
        savedComics.map(comic => [Number(comic.id), comic])
    );

    const allComics = defaultComics.map(comic => {
        return savedMap.get(Number(comic.id)) || { ...comic };
    });

    savedComics.forEach(savedComic => {
        const alreadyExists = allComics.some(
            comic => Number(comic.id) === Number(savedComic.id)
        );

        if (!alreadyExists) {
            allComics.push(savedComic);
        }
    });

    return allComics;
}

export async function frontReader() {
    const app = document.getElementById("app");
    if (!app) return;

    const params = new URLSearchParams(window.location.search);
    const comicId = Number(params.get("id"));
    const chapterNumber = Number(params.get("ep"));

    const allComics = getAllComics();

    const comic = allComics.find(
        item => Number(item.id) === comicId
    );

    if (!comic || !Number.isInteger(chapterNumber) || chapterNumber < 1) {
        showError(app, "Komik atau nomor chapter tidak valid.");
        return;
    }

    try {
        const localChapters = getLocalChapters();

        const localComicChapters = localChapters.filter(
            chapter => Number(chapter.comicId) === comicId
        );

        const localChapter = localComicChapters.find(
            chapter => Number(chapter.number) === chapterNumber
        );

        let backendChapters = [];
        let currentChapter = null;
        let chapterSource = null;

        if (localChapter) {
            currentChapter = localChapter;
            chapterSource = "local";
        } else {
            try {
                const response = await fetch(
                    `/api/chapters?comic_id=${comicId}`
                );

                if (response.ok) {
                    const result = await response.json();

                    if (result.success && Array.isArray(result.data)) {
                        backendChapters = result.data;

                        currentChapter = backendChapters.find(
                            chapter =>
                                Number(chapter.chapter_number) === chapterNumber
                        );

                        if (currentChapter) {
                            chapterSource = "backend";
                        }
                    }
                }
            } catch (error) {
                console.warn("Chapter backend tidak dapat diakses:", error);
            }
        }

        const highestLocalChapter = Math.max(
            0,
            ...localComicChapters.map(
                chapter => Number(chapter.number) || 0
            )
        );

        const highestBackendChapter = Math.max(
            0,
            ...backendChapters.map(
                chapter => Number(chapter.chapter_number) || 0
            )
        );

        const totalChapters = Math.max(
            Number(comic.chapter) || 0,
            Number(comic.episodes) || 0,
            highestLocalChapter,
            highestBackendChapter
        );

        if (chapterNumber > totalChapters) {
            showError(app, "Nomor chapter tidak tersedia.");
            return;
        }

        const previousChapter = chapterNumber > 1
            ? { chapter_number: chapterNumber - 1 }
            : null;

        const nextChapter = chapterNumber < totalChapters
            ? { chapter_number: chapterNumber + 1 }
            : null;

        app.innerHTML = `
            ${header()}

            <main class="reader-page">

                <nav class="reader-breadcrumb">
                    <a href="home.html">Beranda</a>
                    <span>/</span>
                    <a href="comic.html?id=${comic.id}">
                        ${comic.title}
                    </a>
                </nav>

                <section class="reader-heading">
                    <h1>${comic.title}</h1>
                    <h2>Chapter ${chapterNumber}</h2>
                </section>

                ${createNavigation(
                    comic.id,
                    previousChapter,
                    nextChapter
                )}

                <section class="reader-content" id="reader-pdf-content">
                    <p class="reader-loading">
                        Memuat halaman chapter...
                    </p>
                </section>

                ${createNavigation(
                    comic.id,
                    previousChapter,
                    nextChapter
                )}

                <section class="reader-comments-section">
                    <h2>Komentar Chapter ${chapterNumber}</h2>
                    <div id="reader-comments"></div>
                </section>

            </main>
        `;

        frontReview(comic, chapterNumber);
        updateThemeButtonIfAvailable();

        const readerContent = document.getElementById(
            "reader-pdf-content"
        );

        if (!currentChapter) {
            readerContent.innerHTML = `
                <div class="reader-loading">
                    <h2>Chapter ${chapterNumber} belum memiliki konten.</h2>
                    <p>Halaman chapter belum tersedia.</p>
                </div>
            `;
            return;
        }

        if (chapterSource === "local") {
            await renderLocalChapterImages(currentChapter);
        } else if (chapterSource === "backend") {
            const chapterId = Number(currentChapter.id);

            if (chapterId > 0) {
                await renderChapterImages(chapterId);
            } else {
                readerContent.innerHTML = `
                    <div class="reader-loading">
                        <h2>Chapter belum memiliki halaman.</h2>
                    </div>
                `;
            }
        }

    } catch (error) {
        console.error("Reader error:", error);
        showError(
            app,
            "Gagal memuat chapter. Periksa data chapter dan penyimpanan gambar."
        );
    }
}

function getLocalChapters() {
    try {
        const data = localStorage.getItem("comicid_creator_chapters");
        const chapters = JSON.parse(data || "[]");

        return Array.isArray(chapters) ? chapters : [];

    } catch (error) {
        console.error("Gagal membaca chapter lokal:", error);
        return [];
    }
}


const DB_NAME = "ComicIDDB";
const DB_VERSION = 1;
const STORE_NAME = "chapter_pages";

function openChapterDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
}

async function getChapterImage(imageId) {
    const db = await openChapterDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(imageId);

        request.onsuccess = () => {
            db.close();
            resolve(request.result);
        };

        request.onerror = () => {
            db.close();
            reject(request.error);
        };
    });
}

async function renderLocalChapterImages(chapter) {
    const container = document.getElementById("reader-pdf-content");

    if (!container) return;

    if (!Array.isArray(chapter.pages) || chapter.pages.length === 0) {
        container.innerHTML = `
            <div class="reader-loading">
                <h2>Chapter belum memiliki halaman.</h2>
            </div>
        `;
        return;
    }

    const pages = [...chapter.pages].sort(
        (a, b) => Number(a.pageNumber) - Number(b.pageNumber)
    );

    container.innerHTML = "";

    for (const page of pages) {
        const wrapper = document.createElement("div");
        wrapper.className = "reader-image-page-wrap";

        try {
            const imageData = await getChapterImage(page.imageId);

            if (!imageData || !imageData.blob) {
                throw new Error(`Gambar ${page.name} tidak ditemukan di IndexedDB.`);
            }

            const imageUrl = URL.createObjectURL(imageData.blob);

            const image = document.createElement("img");
            image.className = "reader-image-page";
            image.src = imageUrl;
            image.alt = `Halaman ${page.pageNumber}`;
            image.loading = "lazy";
            image.decoding = "async";

            image.onerror = () => {
                URL.revokeObjectURL(imageUrl);
                wrapper.innerHTML = `
                    <p class="reader-error">
                        Gambar halaman ${page.pageNumber} gagal dimuat.
                    </p>
                `;
            };

            wrapper.appendChild(image);

        } catch (error) {
            console.error("Gagal memuat gambar lokal:", error);

            wrapper.innerHTML = `
                <p class="reader-error">
                    Gambar halaman ${page.pageNumber} tidak dapat ditemukan.
                </p>
            `;
        }
        container.appendChild(wrapper);
    }
}

function createNavigation(comicId, previous, next) {
    return `
        <nav class="reader-navigation">

            ${
                previous
                    ? `<a class="reader-button"
                            href="reader.html?id=${comicId}&ep=${previous.chapter_number}">
                            ← Chapter Sebelumnya
                        </a>`
                    : ""
            }

            <a class="reader-button"
                href="comic.html?id=${comicId}">
                Daftar Chapter
            </a>

            ${
                next
                    ? `<a class="reader-button"
                            href="reader.html?id=${comicId}&ep=${next.chapter_number}">
                            Chapter Selanjutnya →
                        </a>`
                    : ""
            }

        </nav>
    `;
}

async function renderChapterImages(chapterId) {
    const container = document.getElementById("reader-pdf-content");

    if (!container) return;

    const response = await fetch(
        `/api/chapter-pages?chapter_id=${chapterId}`
    );

    if (!response.ok) {
        throw new Error(`Gagal mengambil halaman: HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
        throw new Error("Format data halaman tidak valid.");
    }

    const pages = result.data.sort(
        (a, b) => Number(a.page_number) - Number(b.page_number)
    );

    if (pages.length === 0) {
        container.innerHTML = `
            <div class="reader-loading">
                <h2>Chapter belum memiliki halaman.</h2>
                <p>Silakan kembali lagi nanti.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = "";

    pages.forEach((page) => {
        const imageUrl = normalizeImageUrl(page.file_path);

        const wrapper = document.createElement("div");
        wrapper.className = "reader-image-page-wrap";

        const image = document.createElement("img");
        image.className = "reader-image-page";
        image.src = imageUrl;
        image.alt = `Halaman ${page.page_number}`;
        image.loading = "lazy";
        image.decoding = "async";

        image.onerror = () => {
            wrapper.innerHTML = `
                <p class="reader-error">
                    Gambar halaman ${page.page_number} gagal dimuat.
                </p>
            `;
        };

        wrapper.appendChild(image);
        container.appendChild(wrapper);
    });
}

function normalizeImageUrl(filePath) {
    if (!filePath) {
        throw new Error("File path gambar kosong.");
    }

    let path = String(filePath).replace(/\\/g, "/");

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    if (path.startsWith("/storage/")) {
        return encodeURI(path);
    }

    if (path.startsWith("storage/")) {
        path = path.substring("storage/".length);
    }

    const storageIndex = path.lastIndexOf("/storage/");

    if (storageIndex !== -1) {
        path = path.substring(storageIndex + "/storage/".length);
    }

    path = path.replace(/^\/+/, "");

    return "/storage/" +
        path.split("/").map(segment => encodeURIComponent(segment)).join("/");
}

function showError(app, message) {
    app.innerHTML = `
        ${header()}

        <main class="reader-page">
            <section class="reader-error">
                <h2>${message}</h2>
                <a href="home.html">Kembali ke beranda</a>
            </section>
        </main>
    `;
}

function updateThemeButtonIfAvailable() {
    const button = document.getElementById("theme-toggle");

    if (!button) return;

    button.setAttribute("aria-label", "Ganti tema");
}