import { comics } from "./data.js";
import { comicCard } from "./comicsCard.js";

export function setupSearch() {
    const searchInput = document.getElementById("comic-search");
    const results = document.getElementById("search-results");
    const categoryButtons = document.querySelectorAll(".category-chip");
    const genreButtons = document.querySelectorAll(".genre-chip");

    if (!searchInput || !results) return;

    let selectedCategory = "All";
    let selectedGenre = "All";

    function filterComics() {
        const query = searchInput.value.trim().toLowerCase();

        const filtered = comics.filter(comic => {
            const category = comic.category || "";

            const genres = Array.isArray(comic.genre)
                ? comic.genre
                : comic.genre
                    ? [comic.genre]
                    : [];

            const searchableText = [
                comic.title,
                category,
                ...genres
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesQuery = searchableText.includes(query);

            const matchesCategory =
                selectedCategory === "All" ||
                category.toLowerCase() ===
                    selectedCategory.toLowerCase();

            const matchesGenre =
                selectedGenre === "All" ||
                genres.some(genre =>
                    genre.toLowerCase() ===
                    selectedGenre.toLowerCase()
                );

            return matchesQuery && matchesCategory && matchesGenre;
        });

        if (
            !query &&
            selectedCategory === "All" &&
            selectedGenre === "All"
        ) {
            results.hidden = true;
            results.innerHTML = "";
            return;
        }

        results.hidden = false;

        results.innerHTML = `
            <div class="section-heading">
                <div>
                    <p class="section-eyebrow">HASIL PENCARIAN</p>
                    <h2>${filtered.length} komik ditemukan</h2>
                </div>
            </div>

            ${
                filtered.length
                    ? `<div class="comic-grid">
                        ${filtered.map(comicCard).join("")}
                    </div>`
                    : `<p class="empty-results">
                        Tidak ada komik yang cocok. Coba kata kunci lain.
                    </p>`
            }
        `;
    }

    searchInput.addEventListener("input", filterComics);

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            selectedCategory = button.dataset.category;

            categoryButtons.forEach(item => {
                item.classList.toggle("active", item === button);
            });

            filterComics();

            if (selectedCategory !== "All") {
                results.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    genreButtons.forEach(button => {
        button.addEventListener("click", () => {
            selectedGenre = button.dataset.genre;

            genreButtons.forEach(item => {
                item.classList.toggle("active", item === button);
            });

            filterComics();

            if (selectedGenre !== "All") {
                results.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });
}