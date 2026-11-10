
import { comics } from "./data.js";
import { header } from "./header.js";
import { frontReview } from "./review.js";

const PDFJS_WORKER =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

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

    // Ambil daftar chapter dari backend Go.
    try {
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
            (a, b) => Number(a.chapter_number) - Number(b.chapter_number)
        );


        // Ambil jumlah total chapter dari data komik
        const totalChapters = Number(comic.chapter);

        // Pastikan nomor chapter masih dalam rentang yang tersedia
        if (
            !Number.isInteger(chapterNumber) ||
            chapterNumber < 1 ||
            chapterNumber > totalChapters
        ) {
            showError(app, "Chapter tidak ditemukan.");
            return;
        }

        // Cari data chapter di database
        const currentChapter = chapters.find(
            item => Number(item.chapter_number) === chapterNumber
        );

        // Navigasi berdasarkan nomor chapter,
        // bukan berdasarkan data yang tersedia di database
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
                        Memuat chapter...
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
            
        // Jika chapter belum memiliki file PDF, tetap tampilkan halaman reader.
        if (currentChapter && currentChapter.file_path) {
            await renderPdf(currentChapter.file_path);
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
                    : ``
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
                    : ``
            }
        </nav>
    `;
}

// Merender PDF menjadi halaman canvas vertikal.
async function renderPdf(filePath) {
    const container = document.getElementById("reader-pdf-content");

    if (!container) return;

    if (!filePath) {
        throw new Error("File PDF belum memiliki file_path.");
    }

    const pdfjsLib = window.pdfjsLib;

    if (!pdfjsLib) {
        throw new Error("Library PDF.js tidak berhasil dimuat.");
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

    // Bentuk URL PDF dari file_path database.
    const cleanPath = filePath.replace(/^\/+/, "");

    const pdfUrl = "/storage/" +
        cleanPath.split("/").map(encodeURIComponent).join("/");

    const pdf = await pdfjsLib.getDocument({
        url: pdfUrl
    }).promise;

    container.innerHTML = "";

    // Simpan antrean agar proses render tidak berjalan bersamaan.
    let renderQueue = Promise.resolve();

    // Mengamati halaman yang mendekati area layar.
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const wrapper = entry.target;

            observer.unobserve(wrapper);

            renderQueue = renderQueue
                .then(() => renderPdfPage(
                    wrapper,
                    wrapper.pdfPage
                ))
                .catch(error => {
                    console.error("Gagal merender halaman:", error);
                    wrapper.innerHTML = `
                        <p class="reader-error">
                            Halaman gagal ditampilkan.
                        </p>
                    `;
                });
        });
    }, {
        rootMargin: "1000px 0px"
    });

    // Siapkan semua halaman PDF.
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        const page = await pdf.getPage(pageNumber);

        const baseViewport = page.getViewport({ scale: 1 });

        const wrapper = document.createElement("div");
        wrapper.className = "reader-pdf-page-wrap";

        wrapper.style.aspectRatio =
            `${baseViewport.width} / ${baseViewport.height}`;

        wrapper.pdfPage = page;

        const canvas = document.createElement("canvas");
        canvas.className = "reader-pdf-page";

        wrapper.appendChild(canvas);
        container.appendChild(wrapper);

        observer.observe(wrapper);
    }
}

// Merender satu halaman PDF ke canvas.
async function renderPdfPage(wrapper, page) {
    const canvas = wrapper.querySelector("canvas");
    const context = canvas.getContext("2d");

    const baseViewport = page.getViewport({ scale: 1 });

    const scale = wrapper.clientWidth / baseViewport.width;
    const viewport = page.getViewport({ scale });

    // Gunakan resolusi layar agar hasil gambar tetap tajam.
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(viewport.width * pixelRatio);
    canvas.height = Math.floor(viewport.height * pixelRatio);

    canvas.style.width = "100%";
    canvas.style.height = "100%";

    await page.render({
        canvasContext: context,
        viewport: viewport,
        transform: pixelRatio !== 1
            ? [pixelRatio, 0, 0, pixelRatio, 0, 0]
            : null
    }).promise;
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
