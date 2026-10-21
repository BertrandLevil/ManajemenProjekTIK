import {renderHome} from "./home.js";
import { renderRegister } from "./register.js";
import { renderLogin } from "./login.js";
import { renderProfile } from "./profile.js";
import { setupSidebar } from "./header.js";
import { initTheme, updateThemeButton } from "./theme.js";
import { renderComicDetail } from "./comic.js";
import { renderReader } from "./reader.js";
import { renderPremium } from "./premium.js";

document.addEventListener("DOMContentLoaded", () => {
    const currentPage = document.body.dataset.page;

    switch (currentPage) {
        case "home":
            renderHome();
            break;
        case "register":
            renderRegister();
            break;
        case "login":
            renderLogin();
            break;
        case "profile":
            renderProfile();
            break;
        case "premium":
            renderPremium();
            break;
        case "comics":
            renderComics();
            break;
        case "comic-detail":
            renderComicDetail();
            break;
        case "reader":
            renderReader();
            break;
        case "premium":
            renderPremium();
            break;
    }
    setupSidebar();
    initTheme();
    updateThemeButton();
});