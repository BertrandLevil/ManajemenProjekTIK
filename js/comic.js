import { comics } from "./data.js";
import { header } from "./header.js";

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

    const ratingKey = `comicid_ratings_${comic.id}`;
    const commentKey = `comicid_comments_${comic.id}`;

    let currentPage = 1;
    let ratings = JSON.parse(localStorage.getItem(ratingKey) || "[]");
    let comments = JSON.parse(localStorage.getItem(commentKey) || "[]");

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

    function renderRatings() {
        const average = ratings.length
            ? ratings.reduce((sum, item) => sum + item.score, 0) / ratings.length
            : Number(comic.rating) || 0;

        return `
            <div class="rating-summary">
                <strong>${average.toFixed(1)}</strong>
                <span class="rating-stars">★</span>
                <span>${ratings.length
                    ? `${ratings.length} rating pembaca`
                    : "Rating awal komik"}</span>
            </div>

            <form id="comic-rating-form" class="rating-form">
                <label for="comic-rating">Beri rating komik ini</label>
                <select id="comic-rating" required>
                    <option value="">Pilih rating</option>
                    ${[5, 4, 3, 2, 1].map(score => `
                        <option value="${score}">${score} bintang</option>
                    `).join("")}
                </select>
                <button type="submit">Kirim Rating</button>
            </form>
        `;
    }

    function renderComments() {
        return `
            <form id="comic-comment-form" class="comment-form">
                <label for="comic-comment">Tulis komentar</label>
                <textarea id="comic-comment"
                    rows="4"
                    maxlength="1000"
                    placeholder="Bagaimana pendapatmu tentang komik ini?"
                    required></textarea>
                <button type="submit">Kirim Komentar</button>
            </form>

            <div class="comment-list">
                ${comments.length
                    ? comments.slice().reverse().map(comment => `
                        <article class="comment-item">
                            <strong>${escapeHTML(comment.username)}</strong>
                            <p>${escapeHTML(comment.text)}</p>
                            <small>${escapeHTML(comment.date)}</small>
                        </article>
                    `).join("")
                    : "<p class='empty-comments'>Belum ada komentar.</p>"}
            </div>
        `;
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

        document.getElementById("detail-ratings").innerHTML =
            renderRatings();

        document.getElementById("detail-comments").innerHTML =
            renderComments();

        bindPagination();

        const ratingForm = document.getElementById("comic-rating-form");
                                
        if (ratingForm) {
            ratingForm.addEventListener("submit", event => {
                event.preventDefault();
            
                const email = localStorage.getItem("comicid_logged_in_email");
            
                if (!email) {
                    alert("Silakan login terlebih dahulu untuk memberi rating.");
                    return;
                }
            
                const score = Number(
                    document.getElementById("comic-rating").value
                );
            
                if (score < 1 || score > 5) return;
            
                ratings = ratings.filter(
                    rating => rating.email !== email
                );
            
                ratings.push({
                    email: email,
                    score: score
                });
            
                localStorage.setItem(ratingKey, JSON.stringify(ratings));
            
                alert("Rating berhasil diperbarui!");
                renderPage();
            });
        }


        const commentForm = document.getElementById("comic-comment-form");

        if (commentForm) {
            commentForm.addEventListener("submit", (event) => {
                event.preventDefault();
            
                const commentInput = document.getElementById("comic-comment");
                const commentText = commentInput.value.trim();
            
                if (!commentText) return;
            
                const email = localStorage.getItem("comicid_logged_in_email");
                const username = email
                    ? localStorage.getItem(`comicid_username_${email}`) || "Pembaca"
                    : "Pembaca";
            
                comments.push({
                    username,
                    text: commentText,
                    date: new Date().toLocaleDateString("id-ID")
                });
            
                localStorage.setItem(commentKey, JSON.stringify(comments));
            
                renderPage();
            });
        }
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
    renderPage();    
}