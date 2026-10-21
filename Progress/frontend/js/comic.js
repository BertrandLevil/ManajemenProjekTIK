import { comics } from "./data.js";
import { header } from "./header.js";
import { renderReview } from "./review.js";

const escapeHTML = value =>
    String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

export function renderComicDetail() {
    const app = document.getElementById("app");
    if (!app) return;

    const params = new URLSearchParams(window.location.search);
    const comicId = params.get("id");

    const comic = comics.find(
        item => String(item.id) === String(comicId)
    );

    if (!comic) {
        app.innerHTML = `
            ${header()}
            <main class="comic-detail-container">
                <h1>Komik tidak ditemukan</h1>
                <a href="home.html">Kembali ke beranda</a>
            </main>
        `;
        return;
    }

    let currentPage = 1;

    const description = comic.description || comic.desc || "Belum ada deskripsi.";
    const genres = Array.isArray(comic.genre)
        ? comic.genre.join(", ")
        : comic.genre || "-";

    const totalChapters = Math.max(
        0,
        Number.parseInt(comic.chapter ?? comic.episodes ?? 0, 10) || 0
    );

    const chaptersPerPage = 24;
    const totalPages = Math.max(
        1,
        Math.ceil(totalChapters / chaptersPerPage)
    );

    function renderChapters() {
        const end = totalChapters - (currentPage - 1) * chaptersPerPage;
        const start = Math.max(1, end - chaptersPerPage + 1);

        const chapterItems = [];

        for (let chapter = end; chapter >= start; chapter--) {
            chapterItems.push(`
                <a class="detail-chapter-item"
                    href="reader.html?id=${encodeURIComponent(comic.id)}&ep=${chapter}">
                    <span>Chapter ${chapter}</span>
                    <span class="chapter-arrow">→</span>
                </a>
            `);
        }

        const pageButtons = [];

        for (let page = 1; page <= totalPages; page++) {
            pageButtons.push(`
                <button
                    type="button"
                    class="chapter-page ${page === currentPage ? "active" : ""}"
                    data-page="${page}"
                    aria-current="${page === currentPage ? "page" : "false"}">
                    ${page}
                </button>
            `);
        }

        return `
            <div class="detail-chapter-grid">
                ${chapterItems.length
                    ? chapterItems.join("")
                    : "<p>Belum ada chapter.</p>"}
            </div>

            <nav class="chapter-pagination" aria-label="Halaman chapter">
                <button type="button"
                    class="chapter-page"
                    data-page="${currentPage - 1}"
                    ${currentPage === 1 ? "disabled" : ""}>
                    ‹
                </button>

                ${pageButtons.join("")}

                <button type="button"
                    class="chapter-page"
                    data-page="${currentPage + 1}"
                    ${currentPage === totalPages ? "disabled" : ""}>
                    ›
                </button>
            </nav>
        `;
    }

    function bindPagination() {
        document.querySelectorAll(".chapter-page[data-page]").forEach(button => {
            button.onclick = () => {
                const page = Number(button.dataset.page);
                if (page < 1 || page > totalPages) return;

                currentPage = page;
                document.getElementById("detail-chapters").innerHTML =
                    renderChapters();

                bindPagination();
            };
        });
    }

    function renderPage() {
        app.innerHTML = `
            ${header()}

            <main class="comic-detail-container">
                <a href="home.html" class="detail-back">← Kembali ke beranda</a>

                <section class="comic-detail-hero">
                    <div class="detail-cover">
                        ${comic.cover
                            ? `<img src="${escapeHTML(comic.cover)}"
                                    alt="Cover ${escapeHTML(comic.title)}">`
                            : `<div class="detail-cover-placeholder">
                                    ${escapeHTML(comic.title?.charAt(0) || "?")}
                                </div>`}
                    </div>

                    <div class="detail-information">
                        <p class="detail-eyebrow">DETAIL KOMIK</p>
                        <h1>${escapeHTML(comic.title)}</h1>

                        <div class="detail-rating">
                            <span>★</span>
                            <strong>${(Number(comic.rating) || 0).toFixed(1)}</strong>
                        </div>

                        <div class="detail-metadata">
                            <p><strong>Author:</strong> ${escapeHTML(comic.author || "-")}</p>
                            <p><strong>Kategori:</strong> ${escapeHTML(comic.category || "-")}</p>
                            <p><strong>Genre:</strong> ${escapeHTML(genres)}</p>
                            <p><strong>Status:</strong> ${escapeHTML(comic.status || "-")}</p>
                            <p><strong>Jumlah chapter:</strong> ${totalChapters}</p>
                        </div>

                        <div class="detail-description">
                            <h2>Sinopsis</h2>
                            <p>${escapeHTML(description)}</p>
                        </div>
                    </div>
                </section>

                <section class="detail-section">
                    <div class="detail-section-heading">
                        <div>
                            <p class="detail-eyebrow">MULAI MEMBACA</p>
                            <h2>Daftar Chapter</h2>
                        </div>
                        <span>${totalChapters} chapter</span>
                    </div>
                    <div id="detail-chapters"></div>
                </section>

                <section class="detail-section">
                    <p class="detail-eyebrow">PENILAIAN PEMBACA</p>
                    <h2>Rating Komik</h2>
                    <div id="detail-ratings"></div>
                </section>

                <section class="detail-section">
                    <p class="detail-eyebrow">DISKUSI PEMBACA</p>
                    <h2>Komentar</h2>
                    <div id="detail-comments"></div>
                </section>
            </main>
        `;
        
        document.getElementById("detail-chapters").innerHTML =
            renderChapters();
        
        bindPagination();
        renderReview(comic);
    }
    renderPage();    
}