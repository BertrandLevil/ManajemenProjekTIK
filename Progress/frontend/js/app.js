import { frontHome } from "./home.js";
import { frontRegister } from "./register.js";
import { frontLogin } from "./login.js";
import { frontProfile } from "./profile.js";
import { setupSidebar } from "./header.js";
import { initTheme, updateThemeButton } from "./theme.js";
import { frontComicDetail } from "./comic.js";
import { frontReader } from "./reader.js";
import { frontPremium } from "./premium.js";

document.addEventListener("DOMContentLoaded", () => {
    const currentPage = document.body.dataset.page;

    switch (currentPage) {
        case "home":
            frontHome();
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
        case "premium":
            frontPremium();
            break;
        // case "comics":
        //     if (typeof frontComics === "function") {
        //         frontComics();
        //     }
        //     break;
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