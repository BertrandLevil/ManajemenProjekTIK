export function getTheme() {
    return localStorage.getItem("wc_theme") || "dark";
}

export function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("wc_theme", theme);
}

export function updateThemeButton() {
    const icon = document.querySelector(".theme-icon");

    if (icon) {
        icon.textContent = getTheme() === "light" ? "☀" : "☾";
    }
}

export function initTheme() {
    applyTheme(getTheme());

    document.addEventListener("click", function (event) {
        const button = event.target.closest("#theme-toggle");

        if (!button) return;

        const nextTheme =
            getTheme() === "dark" ? "light" : "dark";

        applyTheme(nextTheme);
        updateThemeButton();
    });
}