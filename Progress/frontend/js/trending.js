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
                    <p class="section-eyebrow">PALING DIBICARAKAN</p>
                    <h1 id="trending-title">Trending</h1>
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
