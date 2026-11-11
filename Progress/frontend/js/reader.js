import { comics } from "./data.js";
import { header } from "./header.js";
import { frontReview } from "./review.js";

export async function frontReader() {
    const app = document.getElementById("app");
    if (!app) return;

    const params = new URLSearchParams(window.location.search);
    const comicId = Number(params.get("id"));
    const chapterNumber = Number(params.get("ep"));

    const comic = comics.find(item => item.id === comicId);

    if (!comic || !Number.isInteger(chapterNumber) || chapterNumber < 1) {
        showError(app, "Chapter tidak ditemukan.");
        return;
    }

    try {
        // Ambil daftar chapter dari backend Go.
        const response = await fetch(
            `/api/chapters?comic_id=${comicId}`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
            throw new Error("Format data chapter tidak valid.");
        }

        const chapters = result.data.sort(
            (a, b) =>
                Number(a.chapter_number) - Number(b.chapter_number)
        );

        const totalChapters = Number(comic.chapter);

        if (
            !Number.isInteger(chapterNumber) ||
            chapterNumber < 1 ||
            chapterNumber > totalChapters
        ) {
            showError(app, "Chapter tidak ditemukan.");
            return;
        }

        // Cari chapter berdasarkan nomor chapter.
        const currentChapter = chapters.find(
            item => Number(item.chapter_number) === chapterNumber
        );

        // Ambil ID chapter dari database.
        const chapterId = currentChapter ? Number(currentChapter.id) : null;
        const previousChapter = chapterNumber > 1 ? { chapter_number: chapterNumber - 1 } : null;
        const nextChapter = chapterNumber < totalChapters ? { chapter_number: chapterNumber + 1 } : null;

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

        if (chapterId !== null && chapterId > 0) {
            await renderChapterImages(chapterId);
        } else {
            document.getElementById("reader-pdf-content").innerHTML = `
                <div class="reader-loading">
                    <h2>Chapter ${chapterNumber} belum tersedia.</h2>
                    <p>Silakan kembali lagi nanti.</p>
                </div>
            `;
        }

    } catch (error) {
        console.error("Reader error:", error);
        showError(app, "Gagal memuat chapter. Periksa koneksi backend.");
    }
}


// Membuat tombol navigasi chapter.
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

// Mengambil dan menampilkan gambar dari API.
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

    // Urutkan berdasarkan nomor halaman.
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

    pages.forEach((page, index) => {
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


// Mengubah file_path database menjadi URL gambar.
function normalizeImageUrl(filePath) {
    if (!filePath) {
        throw new Error("File path gambar kosong.");
    }

    let path = String(filePath).replace(/\\/g, "/");

    // Jika sudah berupa URL lengkap.
    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    // Jika path sudah dimulai dengan /storage/.
    if (path.startsWith("/storage/")) {
        return encodeURI(path);
    }

    // Jika path dimulai dengan storage/.
    if (path.startsWith("storage/")) {
        path = path.substring("storage/".length);
    }

    // Jika path masih berupa path fisik Windows.
    const storageIndex = path.lastIndexOf("/storage/");

    if (storageIndex !== -1) {
        path = path.substring(storageIndex + "/storage/".length);
    }

    // Jika path masih berupa comics/...
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