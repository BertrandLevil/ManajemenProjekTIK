import { comics } from "./data.js";
import { header } from "./header.js";
import { renderReview } from "./review.js";

export function renderReader() {
    const app = document.getElementById("app");
    if (!app) return;

    const params = new URLSearchParams(window.location.search);
    const comicId = Number(params.get("id"));
    const chapter = Number(params.get("ep"));

    const comic = comics.find(item => item.id === comicId);

    if (
        !comic ||
        !Number.isInteger(chapter) ||
        chapter < 1 ||
        chapter > Number(comic.chapter)
    ) {
        app.innerHTML = `
            ${header()}
            <main class="reader-page">
                <h1>Chapter tidak ditemukan</h1>
                <a href="home.html">Kembali ke beranda</a>
            </main>
        `;
        return;
    }

    const previousChapter = chapter - 1;
    const nextChapter = chapter + 1;

    app.innerHTML = `
        ${header()}

        <main class="reader-page">
            <nav class="reader-breadcrumb">
                <a href="home.html">Beranda</a>
                <span> / </span>
                <a href="comic.html?id=${comic.id}">
                    ${comic.title}
                </a>
            </nav>

            <section class="reader-heading">
                <h1>${comic.title}</h1>
                <h2>Chapter ${chapter}</h2>
            </section>

            <nav class="reader-navigation">
                ${
                    previousChapter >= 1
                        ? `<a class="reader-button"
                            href="reader.html?id=${comic.id}&ep=${previousChapter}">
                            ← Chapter Sebelumnya
                            </a>`
                        : `<button class="reader-button" disabled>
                            ← Chapter Sebelumnya
                            </button>`
                }

                <a class="reader-button"
                    href="comic.html?id=${comic.id}">
                    Daftar Chapter
                </a>

                ${
                    nextChapter <= Number(comic.chapter)
                        ? `<a class="reader-button"
                            href="reader.html?id=${comic.id}&ep=${nextChapter}">
                            Chapter Selanjutnya →
                            </a>`
                        : `<button class="reader-button" disabled>
                            Chapter Selanjutnya →
                            </button>`
                }
            </nav>

            <section class="reader-content">
                <p class="reader-placeholder">
                    Gambar untuk ${comic.title} — Chapter ${chapter}
                    belum ditambahkan.
                </p>
            </section>

            <nav class="reader-navigation reader-bottom-navigation">
                ${
                    previousChapter >= 1
                        ? `<a class="reader-button"
                            href="reader.html?id=${comic.id}&ep=${previousChapter}">
                            ← Sebelumnya
                            </a>`
                        : ""
                }

                ${
                    nextChapter <= Number(comic.chapter)
                        ? `<a class="reader-button"
                            href="reader.html?id=${comic.id}&ep=${nextChapter}">
                            Selanjutnya →
                            </a>`
                        : ""
                }
            </nav>

            <section class="reader-comments-section">
                <h2>Komentar Chapter ${chapter}</h2>
                <div id="reader-comments"></div>
            </section>

        </main>
    `;
    renderReview(comic, chapter);
    updateThemeButtonIfAvailable();
}

function updateThemeButtonIfAvailable() {
    const button = document.getElementById("theme-toggle");
    if (!button) return;

    button.setAttribute("aria-label", "Ganti tema");
}