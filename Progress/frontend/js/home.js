import { header } from "./header.js";
import { comics, popularComics } from "./data.js";
import { comicSection } from "./comicsCard.js";
import { heroSlide, setupCarousel } from "./carousel.js";
import { setupSearch } from "./search.js";

export function renderHome() {
    const app = document.getElementById("app");

    if (!app) return;

    const Heropopular = popularComics
        .map(id => comics.find(comic => comic.id === id))
        .filter(Boolean);

    const trending = comics.filter(
        comic => comic.isTrending === true
    );

    const popular = [...comics]
        .filter(comic => comic.isPopular === true)
        .sort((a, b) => Number(b.rating) - Number(a.rating))
        .slice(0, 4);

    const latest = [...comics]
        .sort((a, b) => Number(b.chapter) - Number(a.chapter))
        .slice(0, 4);

    app.innerHTML = `
        ${header()}

        <main class="home-main">
            <section class="hero-section" aria-label="Komik unggulan">
                <div class="hero-carousel">
                    ${Heropopular.map(heroSlide).join("")}
                </div>

                <div class="hero-controls">
                    <button class="carousel-arrow"
                            id="hero-prev"
                            aria-label="Banner sebelumnya">←</button>

                    <div class="carousel-dots" id="hero-dots">
                        ${Heropopular.map((comic, index) => `
                            <button class="carousel-dot ${index === 0 ? "active" : ""}"
                                    data-go-slide="${index}"
                                    aria-label="Banner ${index + 1}">
                            </button>
                        `).join("")}
                    </div>

                    <button class="carousel-arrow"
                            id="hero-next"
                            aria-label="Banner berikutnya">→</button>
                </div>
            </section>

            <section class="search-section">
                <div>
                    <p class="section-eyebrow">TEMUKAN CERITAMU</p>
                    <h2>Komik untuk setiap dunia.</h2>
                </div>

                <label class="search-box">
                    <span>⌕</span>
                    <input id="comic-search"
                        type="search"
                        placeholder="Cari judul atau genre komik..."
                        autocomplete="off">
                    <kbd>⌕</kbd>
                </label>
            </section>

            <section class="cateogory-section">
                <div class="category-list" id="category-list">
                    ${[
                        "All",
                        "Komik",
                        "Manga",
                        "Manhwa",
                        "Manhua",
                        "Comic"
                    ].map((category, index) => `
                        <button class="category-chip ${index === 0 ? "active" : ""}"
                                data-category="${category}">
                            ${category}
                        </button>
                    `).join("")}
                </div>
            </section>

            <section class="genre-section">
                <div class="genre-list" id="genre-list">
                    ${[
                        "All",
                        "Action",
                        "Fantasy",
                        "Romance",
                        "Adventure",
                        "Sci-Fi",
                        "Slice of Life",
                        "Drama",
                        "Shoujo",
                        "Shounen",
                        "Seinin",
                        "Kingdom",
                        "Tragedy",
                        "Thriller",
                        "Comedy",
                        "Historical",
                        "Horror",
                        "Martial Arts",
                        "Mature",
                        "Murim",
                        "Violence",
                        "Xianxia",
                        "Wuxia",
                        "Xuanhuan",
                        "Cultivation",
                        "Harem",
                        "Reverse Harem",
                        "Reincarnation",
                        "Transmigration",
                        "Regression",
                        "Supernatural"
                    ].map((genre, index) => `
                        <button class="genre-chip ${index === 0 ? "active" : ""}"
                                data-genre="${genre}">
                            ${genre}
                        </button>
                    `).join("")}
                </div>
            </section>

            <div id="search-results"
                class="search-results"
                hidden></div>

            ${comicSection(
                "Trending sekarang",
                "PALING DIBICARAKAN",
                trending,
                "trending"
            )}

            ${comicSection(
                "Update terbaru",
                "JANGAN LEWATKAN",
                latest,
                "latest"
            )}

            ${comicSection(
                "Komik Populer",
                "YANG PALING BANYAK DIBACA",
                popular,
                "popular"
            )}

            <section class="bottom-cta">
                <div>
                    <p class="section-eyebrow">CERITAMU DIMULAI DI SINI</p>
                    <h2>Temukan dunia baru di setiap halaman.</h2>
                    <p>
                        Jelajahi cerita favoritmu dan temukan petualangan berikutnya.
                    </p>
                </div>

                <a class="button-primary" href="comics.html">
                    Jelajahi ComicID →
                </a>
            </section>
        </main>

        <footer class="site-footer">
            <a class="brand" href="home.html">
                <span class="brand-icon">C</span>
                <span>Comic<span class="brand-accent">ID</span></span>
            </a>

            <p>Tempat cerita menjadi hidup.</p>
            <p>© ${new Date().getFullYear()} ComicID</p>
        </footer>
    `;

    setupCarousel();
    setupSearch();
}