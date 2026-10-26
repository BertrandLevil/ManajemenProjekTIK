export function frontLogin() {
    const app = document.getElementById("app");

    if (!app) return;

    app.innerHTML = `
        <main class="auth-page">
                <button
                    type="button"
                    class="theme-toggle"
                    id="theme-toggle"
                    aria-label="Ganti tema"
                    title="Ganti tema"
                >
                    <span class="theme-icon"></span>
                </button>

            <section class="auth-card">
                <a class="brand auth-brand" href="home.html">
                    <span class="brand-icon">C</span>
                    <span>Comic<span class="brand-accent">ID</span></span>
                </a>

                <p class="section-eyebrow">SELAMAT DATANG KEMBALI</p>
                <h1>Masuk ke akunmu</h1>
                <p class="auth-description">
                    Masuk dan lanjutkan membaca komik favoritmu.
                </p>

                <form id="login-form" class="auth-form" novalidate>
                    <label for="login-email">Email</label>
                    <input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="nama@email.com"
                        autocomplete="email"
                        required
                    >

                    <label for="login-password">Password</label>
                    <input
                        id="login-password"
                        name="password"
                        type="password"
                        placeholder="Masukkan password"
                        autocomplete="current-password"
                        required
                    >

                    <p
                        id="login-message"
                        class="auth-message"
                        role="alert"
                        hidden
                    ></p>

                    <button
                        type="submit"
                        class="signup-button auth-submit"
                    >
                        Masuk
                    </button>
                </form>

                <p class="auth-switch">
                    Belum punya akun?
                    <a href="register.html">Daftar</a>
                </p>
            </section>
        </main>
    `;

    const form = document.getElementById("login-form");
    const message = document.getElementById("login-message");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document
            .getElementById("login-email")
            .value.trim();

        const password = document
            .getElementById("login-password")
            .value;

        function showMessage(text) {
            message.textContent = text;
            message.hidden = false;
        }

        message.hidden = true;

        if (email === "" && password === "") {
            showMessage("Form login wajib diisi.");
            return;
        }

        if (!email) {
            showMessage("Email wajib diisi.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage("Format email tidak valid.");
            return;
        }
        if (!password) {
            showMessage("Password wajib diisi.");
            return;
        }
        
        if (password.length < 8) {
            showMessage("Password minimal 8 karakter.");
            return;
        }

        const accounts = JSON.parse(
            localStorage.getItem("comicid_accounts") || "[]"
        );

        const account = accounts.find(
            account => account.email.toLowerCase() === email.toLowerCase()
        );

        if (!account) {
            showMessage("Email tidak terdaftar.");
            return;
        }

        if (password !== account.password) {
            showMessage("Password salah.");
            return;
        }

        localStorage.setItem("comicid_logged_in_email", account.email);
        localStorage.setItem("comicid_logged_in", "true");

        if (!localStorage.getItem(`comicid_username_${account.email}`)) {
            localStorage.setItem(
                `comicid_username_${account.email}`,
                account.username
            );
        }
        window.location.href = "home.html";
    });
}