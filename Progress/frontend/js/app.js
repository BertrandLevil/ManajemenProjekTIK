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
        case "comics":
            frontComics();
            break;
        case "comic-detail":
            frontComicDetail();
            break;
        case "reader":
            frontReader();
            break;
    }
    setupSidebar();
    initTheme();
    updateThemeButton();
});