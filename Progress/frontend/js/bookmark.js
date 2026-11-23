
import { header } from "./header.js";
import { getAllComics } from "./comicData.js";
import { comicCard } from "./comicsCard.js";

export function frontBookmark() {
    const app = document.getElementById("app");

    if (!app) return;

    const isLoggedIn =
        localStorage.getItem("comicid_logged_in") === "true";

    const role = localStorage.getItem("comicid_logged_in_role");

    if (!isLoggedIn || !["Pembaca", "Kreator"].includes(role)) {
        window.location.href = "login.html";
        return;
    }

    const userId = localStorage.getItem("comicid_user_id");

    if (!userId) {
        window.location.href = "login.html";
        return;
    }

    const bookmarkKey = `comicid_bookmarks_${userId}`;

    let bookmarkIds = [];

    try {
        bookmarkIds = JSON.parse(
            localStorage.getItem(bookmarkKey) || "[]"
        );
    } catch (error) {
        console.error("Gagal membaca bookmark:", error);
    }

    const bookmarkedComics = getAllComics().filter(comic =>
        bookmarkIds.some(id => String(id) === String(comic.id))
    );

    app.innerHTML = `
        ${header()}

        <main class="trending-main">
            <section aria-labelledby="bookmark-title">

                <div class="trending-heading">
                    <span class="trending-heading-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24">
                            <path d="M6 3h12v18l-6-4-6 4z"></path>
                        </svg>
                    </span>

                    <div class="trending-heading-copy">
                        <h1 id="bookmark-title">Bookmark Saya</h1>

                        <p class="trending-description">
                            Kumpulan komik yang kamu simpan.
                        </p>
                    </div>
                </div>

                ${
                    bookmarkedComics.length
                        ? `
                            <div class="comic-grid">
                                ${bookmarkedComics
                                    .map(comic => comicCard(comic))
                                    .join("")}
                            </div>
                        `
                        : `
                            <p class="trending-empty">
                                Kamu belum menyimpan komik apa pun.
                                Yuk, cari komik dan tambahkan ke Bookmark!
                            </p>
                        `
                }

            </section>
        </main>
    `;
}