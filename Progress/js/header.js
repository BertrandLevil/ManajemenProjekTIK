import { getTheme } from "./theme.js";

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

export function header() {
    const isLoggedIn =
        localStorage.getItem("comicid_logged_in") === "true";

    return `
        <header class="site-header">
            <a class="brand" href="home.html">
                <span class="brand-icon">C</span>
                <span>Comic<span class="brand-accent">ID</span></span>
            </a>

            <button
                type="button"
                class="menu-toggle"
                id="menu-toggle"
                aria-label="Buka menu"
                aria-expanded="false"
                aria-controls="sidebar"
            >
                ☰
            </button>

            <button
                type="button"
                class="theme-toggle"
                id="theme-toggle"
                aria-label="Ganti tema"
                title="Ganti tema"
            >
                <span class="theme-icon">
                    ${getTheme() === "light" ? "☀" : "☾"}
                </span>
            </button>
        </header>

        <div class="sidebar-overlay" id="sidebar-overlay"></div>

        <aside class="sidebar" id="sidebar" aria-hidden="true">
            <button
                type="button"
                class="sidebar-close"
                id="sidebar-close"
                aria-label="Tutup menu"
            >
                ✕
            </button>

            <nav class="sidebar-nav">
                <a class="nav-link active" href="home.html">Beranda</a>
                <a class="nav-link" href="trending.html">Trending</a>
                <a class="nav-link" href="latest.html">Terbaru</a>
                <a class="nav-link" href="bookmark.html">Bookmark</a>
                <a class="nav-link" href="premium.html">Upgrade Premium</a>
            </nav>

            <div class="sidebar-actions">
                ${
                    isLoggedIn
                        ? `
                            <div class="sidebar-profile">
                                <a class="profile-link" href="profile.html" title="Profil">
                                    <img
                                        class="profile-avatar"
                                        src="${localStorage.getItem(
                                            `comicid_profile_photo_${localStorage.getItem("comicid_logged_in_email")}`
                                        ) || "../assets/default-avatar.png"}"
                                        alt="Foto profil"
                                    >
                                </a>
                                    
                                <span class="sidebar-username">
                                    ${escapeHTML(
                                        localStorage.getItem(
                                            `comicid_username_${localStorage.getItem("comicid_logged_in_email")}`
                                        ) || "Pengguna ComicID"
                                    )}
                                </span>
                            </div>
                        `
                        : `
                            <a class="login-link" href="login.html">Masuk</a>
                            <a class="signup-button" href="register.html">Daftar</a>
                        `
                }
            </div>
        </aside>
    `;
}


export function setupSidebar() {
    const menuToggle = document.getElementById("menu-toggle");
    const sidebar = document.getElementById("sidebar");
    const sidebarClose = document.getElementById("sidebar-close");
    const overlay = document.getElementById("sidebar-overlay");

    if (!menuToggle || !sidebar || !sidebarClose || !overlay) {
        return;
    }

    if (menuToggle.dataset.sidebarReady === "true") {
        return;
    }

    menuToggle.dataset.sidebarReady = "true";

    function openSidebar() {
        sidebar.classList.add("open");
        overlay.classList.add("show");
        sidebar.setAttribute("aria-hidden", "false");
        menuToggle.setAttribute("aria-expanded", "true");
    }

    function closeSidebar() {
        if (sidebar.contains(document.activeElement)) {
            menuToggle.focus();
        }
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
        sidebar.setAttribute("aria-hidden", "true");
        menuToggle.setAttribute("aria-expanded", "false");
    }

    menuToggle.addEventListener("click", openSidebar);
    sidebarClose.addEventListener("click", closeSidebar);
    overlay.addEventListener("click", closeSidebar);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });
}