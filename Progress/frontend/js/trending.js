import { header } from "./header.js";
import { getAllComics } from "./comicData.js";

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function trendingCard(comic, index) {
    const comicId = encodeURIComponent(String(comic.id));
    const title = escapeHTML(comic.title);
    const rank = index === 0 ? "Hot" : `Top ${index + 1}`;
    const cover = comic.cover
        ? `<img class="trending-cover-image" src="${escapeHTML(comic.cover)}" alt="Cover ${title}" loading="lazy">`
        : `<span class="trending-cover-fallback" aria-hidden="true">${escapeHTML(comic.title?.charAt(0) || "?")}</span>`;

    return `
        <a class="trending-card" href="comic.html?id=${comicId}" aria-label="${rank}: ${title}">
            <span class="trending-card-cover">
                ${cover}
                <span class="trending-rank">${rank}</span>
            </span>
            <span class="trending-card-title">${title}</span>
        </a>
    `;
}

export function frontTrending() {
    const app = document.getElementById("app");

    if (!app) return;

    const trendingComics = getAllComics()
        .filter(comic => comic.isTrending === true)
        .sort((first, second) =>
            (Number(second.rating) || 0) - (Number(first.rating) || 0)
        );

    app.innerHTML = `
        ${header()}
        <main class="trending-main">
            <section aria-labelledby="trending-title">
                <div class="trending-heading">
                    <p class="section-eyebrow">PALING DIBICARAKAN</p>
                    <h1 id="trending-title">Trending</h1>
                </div>
                ${trendingComics.length
                    ? `<div class="trending-grid">${trendingComics
                        .map(trendingCard)
                        .join("")}</div>`
                    : `<p class="trending-empty">Belum ada komik trending saat ini.</p>`
                }
            </section>
        </main>
    `;
}
