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

    const currentPage = document.body.dataset.page;
    const role = localStorage.getItem("comicid_logged_in_role");
    const isReader = isLoggedIn && role === "Pembaca";
    const isCreator = isLoggedIn && role === "Kreator";
    const isAdmin = isLoggedIn && role === "Admin";

    return `
        <header class="site-header">
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

            <a class="brand" href="home.html">
                <span class="brand-icon" aria-label="Logo ComicID">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="32" height="32" rx="9" fill="url(#comicIdLogoGrad)"/>
                        <path d="M 19.65 17.54 L 24.23 18.92 Q 23.76 20.85 22.77 22.14 Q 21.78 23.43 20.31 24.09 Q 18.84 24.75 16.57 24.75 Q 13.81 24.75 12.06 23.95 Q 10.31 23.15 9.04 21.13 Q 7.77 19.11 7.77 15.96 Q 7.77 11.76 10.01 9.51 Q 12.24 7.25 16.32 7.25 Q 19.52 7.25 21.35 8.54 Q 23.18 9.83 24.06 12.51 L 19.45 13.54 Q 19.21 12.76 18.94 12.41 Q 18.5 11.81 17.87 11.48 Q 17.23 11.16 16.45 11.16 Q 14.67 11.16 13.73 12.59 Q 13.01 13.65 13.01 15.93 Q 13.01 18.74 13.87 19.78 Q 14.72 20.83 16.27 20.83 Q 17.76 20.83 18.53 19.99 Q 19.3 19.14 19.65 17.54 Z" fill="#ffffff"/>
                        <defs>
                            <linearGradient id="comicIdLogoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#a78bfa"/>
                                <stop offset="1" stop-color="#6d28d9"/>
                            </linearGradient>
                        </defs>
                    </svg>
                </span>
                <span>Comic<span class="brand-accent">ID</span></span>
            </a>

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
                <a class="nav-link ${currentPage === "home" ? "active" : ""}" href="home.html">Beranda</a>
                <a class="nav-link ${currentPage === "trending" ? "active" : ""}" href="trending.html">Trending</a>
                <a class="nav-link ${currentPage === "latest" ? "active" : ""}" href="latest.html">Terbaru</a>

                ${isReader ? `
                    <a
                        class="nav-link ${currentPage === "upgrade-creator" ? "active" : ""}"
                        href="upgradeCreator.html"
                    >
                        Upgrade Creator
                    </a>
                ` : ""}

                ${isCreator ? `
                    <a
                        class="nav-link ${currentPage === "manajemen-data-komik" ? "active" : ""}"
                        href="manajemenDataKomik.html"
                    >
                            Manajemen Data Komik
                    </a>
                `: ""}

                ${isAdmin ? `
                    <a
                        class="nav-link ${currentPage === "manajemen-user" ? "active" : ""}"
                        href="manajemenUser.html"
                    >
                        Manajemen User
                    </a>
                    <a
                        class="nav-link ${currentPage === "pengajuan-creator" ? "active" : ""}"
                        href="pengajuanCreator.html"
                    >
                        Pengajuan Creator
                    </a>
                ` : ""}
                
                ${(isReader || isCreator) ? `
                    <a
                        class="nav-link ${currentPage === "premium" ? "active" : ""}"
                        href="premium.html"
                    >
                        Upgrade Premium
                    </a>

                    <a
                        class="nav-link ${currentPage === "bookmark" ? "active" : ""}"
                        href="bookmark.html"
                    >
                        Bookmark Saya
                    </a>
                ` : ""}
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