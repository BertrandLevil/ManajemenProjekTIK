import { header } from "./header.js";
import { comics as defaultComics, popularComics } from "./data.js";
import { getAllComics } from "./comicData.js";
import { comicSection } from "./comicsCard.js";
import { heroSlide, setupCarousel } from "./carousel.js";
import { setupSearch } from "./search.js";

export function frontHome() {
    const app = document.getElementById("app");

    if (!app) return;

    const allComics = getAllComics();

    const Heropopular = popularComics
        .map(id => allComics.find(comic => comic.id === id))
        .filter(Boolean);

    const trending = allComics.filter(
        comic => comic.isTrending === true
    );

    const popular = [...allComics]
        .filter(comic => comic.isPopular === true)
        .sort((a, b) => Number(b.rating) - Number(a.rating))
        .slice(0, 4);

    const latest = [...allComics]
        .sort((a, b) => Number(b.chapter) - Number(a.chapter))
        .slice(0, 4);

    const email = localStorage.getItem("comicid_logged_in_email");
    const role = localStorage.getItem("comicid_logged_in_role");

    const creatorId = Number(localStorage.getItem("comicid_user_id"));

    const isCreatorLoggedIn =
        localStorage.getItem("comicid_logged_in") === "true" &&
        role === "Kreator" &&
        email;

    const creatorComics = isCreatorLoggedIn
        ? allComics.filter(comic =>
            !defaultComics.some(
                defaultComic => Number(defaultComic.id) === Number(comic.id)
            ) &&
            Number(comic.creatorId) === creatorId
        )
        : [];

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
                            aria-label="Banner sebelumnya">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 12H5m0 0 7 7m-7-7 7-7"></path>
                        </svg>
                    </button>

                    <div class="carousel-dots" id="hero-dots">
                        ${Heropopular.map(
                            (comic, index) => `
                            <button class="carousel-dot ${index === 0 ? "active" : ""}"
                                    data-go-slide="${index}"
                                    aria-label="Banner ${index + 1}">
                            </button>
                        `,
                        ).join("")}
                    </div>

                    <button class="carousel-arrow"
                            id="hero-next"
                            aria-label="Banner berikutnya">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 12h14m0 0-7-7m7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            </section>

            <section class="search-section">
                <div>
                    <p class="section-eyebrow">TEMUKAN CERITAMU</p>
                    <h2>Komik untuk setiap dunia.</h2>
                </div>

                <label class="search-box">
                    <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="10.8" cy="10.8" r="6.3"></circle>
                        <path d="m15.5 15.5 4.2 4.2"></path>
                    </svg>
                    <input id="comic-search"
                        type="search"
                        placeholder="Cari judul atau genre komik"
                        autocomplete="off">
                    <kbd>⌕</kbd>
                </label>
            </section>

            <section class="category-section">
                <div class="category-list" id="category-list">
                    ${["All", "Komik", "Manga", "Manhwa", "Manhua", "Comic"]
                        .map(
                        (category, index) => `
                        <button class="category-chip ${index === 0 ? "active" : ""}"
                                data-category="${category}">
                            ${category}
                        </button>
                    `,
                        )
                        .join("")}
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
                        "Mystery",
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
                        "Supernatural",
                    ]
                        .map(
                        (genre, index) => `
                        <button class="genre-chip ${index === 0 ? "active" : ""}"
                                data-genre="${genre}">
                            ${genre}
                        </button>
                    `,
                        )
                        .join("")}
                </div>
            </section>

            <div id="search-results"
                class="search-results"
                hidden></div>

            ${comicSection(
                "Trending sekarang",
                "PALING DIBICARAKAN",
                trending,
                "trending",
            )}

            ${comicSection(
                "Update terbaru",
                "JANGAN LEWATKAN",
                latest,
                "latest",
            )}

            ${creatorComics.length > 0
                ? comicSection(
                    "Komik Kreator",
                    "KARYA KREATOR COMICID",
                    creatorComics,
                    "creator"
                )
                : ""
            }

            ${comicSection(
                "Komik Populer",
                "YANG PALING BANYAK DIBACA",
                popular,
                "popular",
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
                <span class="brand-icon" aria-label="Logo ComicID">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="32" rx="9" fill="url(#comicIdLogoFooterGrad)"/>
                        <path d="M 19.65 17.54 L 24.23 18.92 Q 23.76 20.85 22.77 22.14 Q 21.78 23.43 20.31 24.09 Q 18.84 24.75 16.57 24.75 Q 13.81 24.75 12.06 23.95 Q 10.31 23.15 9.04 21.13 Q 7.77 19.11 7.77 15.96 Q 7.77 11.76 10.01 9.51 Q 12.24 7.25 16.32 7.25 Q 19.52 7.25 21.35 8.54 Q 23.18 9.83 24.06 12.51 L 19.45 13.54 Q 19.21 12.76 18.94 12.41 Q 18.5 11.81 17.87 11.48 Q 17.23 11.16 16.45 11.16 Q 14.67 11.16 13.73 12.59 Q 13.01 13.65 13.01 15.93 Q 13.01 18.74 13.87 19.78 Q 14.72 20.83 16.27 20.83 Q 17.76 20.83 18.53 19.99 Q 19.3 19.14 19.65 17.54 Z" fill="#ffffff"/>
                        <defs>
                            <linearGradient id="comicIdLogoFooterGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#a78bfa"/>
                                <stop offset="1" stop-color="#6d28d9"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </span>
                <span>Comic<span class="brand-accent">ID</span></span>
            </a>

            <p>Tempat cerita menjadi hidup.</p>
            <p>© ${new Date().getFullYear()} ComicID</p>
        </footer>
    `;

    setupCarousel();
    setupSearch(allComics);
}