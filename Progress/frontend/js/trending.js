import { header } from "./header.js";
import { getAllComics } from "./comicData.js";
import { comicCard } from "./comicsCard.js";

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
                    <span class="trending-heading-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                            <path d="M3 17 9 11l4 4 8-9"></path>
                            <path d="M15 6h6v6"></path>
                        </svg>
                    </span>
                    <div class="trending-heading-copy">
                        <h1 id="trending-title">Trending</h1>
                        <p class="trending-description">
                            Pilihan komik yang sedang ramai dibicarakan.
                        </p>
                    </div>
                </div>
                ${trendingComics.length
                    ? `<div class="comic-grid">${trendingComics
                        .map((comic, index) =>
                            comicCard(comic, index === 0 ? "Hot" : `Top ${index + 1}`)
                        )
                        .join("")}</div>`
                    : `<p class="trending-empty">Belum ada komik trending saat ini.</p>`
                }
            </section>
        </main>
    `;
}
