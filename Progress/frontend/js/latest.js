import { header } from "./header.js";
import { getAllComics } from "./comicData.js";
import { comicCard } from "./comicsCard.js";

export function frontLatest() {
    const app = document.getElementById("app");

    if (!app) return;

    const allComics = getAllComics();

    const latestComics = allComics
        .map((comic, index) => ({
            ...comic,
            originalIndex: index,
            sortDate: new Date(
                comic.updatedAt || comic.createdAt || 0
            ).getTime()
        }))
        .sort((a, b) => {
            return (
                (Number.isFinite(b.sortDate) ? b.sortDate : 0) -
                (Number.isFinite(a.sortDate) ? a.sortDate : 0)
            ) || a.originalIndex - b.originalIndex;
        });

    app.innerHTML = `
        ${header()}

        <main class="trending-main">
            <section aria-labelledby="latest-title">

                <div class="trending-heading">
                    <span class="trending-heading-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                            <path d="M12 8v4l3 2"></path>
                            <circle cx="12" cy="12" r="9"></circle>
                        </svg>
                    </span>

                    <div class="trending-heading-copy">
                        <h1 id="latest-title">Terbaru</h1>

                        <p class="trending-description">
                            Temukan komik dengan pembaruan chapter terbaru.
                        </p>
                    </div>
                </div>

                ${
                    latestComics.length
                        ? `
                            <div class="comic-grid">
                                ${latestComics
                                    .map(comic => comicCard(comic))
                                    .join("")}
                            </div>
                        `
                        : `
                            <p class="trending-empty">
                                Belum ada komik yang tersedia.
                            </p>
                        `
                }

            </section>
        </main>
    `;
}