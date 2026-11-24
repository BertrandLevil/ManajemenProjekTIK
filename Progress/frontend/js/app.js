import { frontHome } from "./home.js";
import { frontRegister } from "./register.js";
import { frontLogin } from "./login.js";
import { frontProfile } from "./profile.js";
import { frontUpgradeCreator } from "./upgradeCreator.js";
import { frontPengajuanCreator } from "./pengajuanCreator.js";
import { frontManajemenDataKomik } from "./manajemenDataKomik.js";
import { frontManajemenUser } from "./manajemenUser.js";
import { setupSidebar } from "./header.js";
import { initTheme, updateThemeButton } from "./theme.js";
import { frontComicDetail } from "./comic.js";
import { frontReader } from "./reader.js";
import { frontPremium } from "./premium.js";
import { frontTrending } from "./trending.js";
import { frontLatest } from "./latest.js";
import { frontBookmark } from "./bookmark.js";

function ensureFavicon() {
    if (!document.querySelector('link[rel="icon"]')) {
        const isPagesDir = window.location.pathname.includes("/pages/");
        const prefix = isPagesDir ? "../assets/favicon/" : "assets/favicon/";
        const link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/svg+xml";
        link.href = `${prefix}favicon.svg`;
        document.head.appendChild(link);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    ensureFavicon();
    const currentPage = document.body.dataset.page;

    switch (currentPage) {
        case "home":
            frontHome();
            break;
        case "trending":
            frontTrending();
            break;
        case "register":
            frontRegister();
            break;
        case "login":
            frontLogin();
            break;
        case "profile":
            frontProfile();
            break;
        case "latest":
            frontLatest();
            break;
        case "bookmark":
            frontBookmark();
            break;
        case "upgrade-creator":
            frontUpgradeCreator();
            break;
        case "pengajuan-creator":
            frontPengajuanCreator();
            break;
        case "manajemen-user":
            frontManajemenUser();
            break;
        case "manajemen-data-komik":
            frontManajemenDataKomik();
            break;
        case "premium":
            frontPremium();
            break;
        case "comic-detail":
        console.log("Halaman comic-detail terdeteksi");
        
        try {
            frontComicDetail();
            console.log("frontComicDetail berhasil dipanggil");
        } catch (error) {
            console.error("Gagal menampilkan detail komik:", error);
        }
        break;
        case "reader":
            frontReader();
            break;
    }
    setupSidebar();
    initTheme();
    updateThemeButton();
});