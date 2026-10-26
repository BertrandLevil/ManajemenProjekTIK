export function frontRegister() {
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

                <p class="section-eyebrow">GABUNG DENGAN COMICID</p>
                <h1>Buat akun baru</h1>
                <p class="auth-description">
                    Daftar dan mulai jelajahi cerita favoritmu.
                </p>

                <form id="register-form" class="auth-form" novalidate>
                    <label for="register-username">
                        Nama pengguna
                    </label>
                    <input
                        id="register-username"
                        name="username"
                        type="text"
                        placeholder="Masukkan nama pengguna"
                        minlength="3"
                        maxlength="30"
                        autocomplete="username"
                        required
                    >

                    <label for="register-email">Email</label>
                    <input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="nama@email.com"
                        autocomplete="email"
                        required
                    >
                    
                    <label for="register-password">Password</label>
                    <input
                        id="register-password"
                        name="password"
                        type="password"
                        placeholder="Minimal 8 karakter"
                        minlength="8"
                        autocomplete="new-password"
                        required
                    >

                    <label for="register-confirm">
                        Konfirmasi password
                    </label>
                    <input
                        id="register-confirm"
                        name="confirmPassword"
                        type="password"
                        placeholder="Masukkan ulang password"
                        minlength="8"
                        autocomplete="new-password"
                        required
                    >

                    <p id="register-message"
                        class="auth-message"
                        role="alert"
                        hidden></p>

                    <button type="submit" class="signup-button auth-submit">
                        Daftar
                    </button>
                </form>

                <p class="auth-switch">
                    Sudah punya akun?
                    <a href="login.html">Masuk</a>
                </p>
            </section>
        </main>
    `;

    const form = document.getElementById("register-form");
    const message = document.getElementById("register-message");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const username = document.getElementById("register-username").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("register-confirm").value;

        function showMessage(text) {
            message.textContent = text;
            message.hidden = false;
        }

        if (username === "" && email === "" && password === "" && confirmPassword === "") {
            showMessage("Form registrasi wajib diisi.");
            return;
        }
        if (username.length < 3) {
            showMessage("Nama pengguna minimal 3 karakter.");
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

        if (password !== confirmPassword) {
            showMessage("Konfirmasi password tidak cocok.");
            return;
        }


        const accounts = JSON.parse(
            localStorage.getItem("comicid_accounts") || "[]"
        );

        const usernameExists = accounts.some(
            account => account.username.toLowerCase() === username.toLowerCase()
        );

        if (usernameExists) {
            showMessage("Nama pengguna sudah digunakan.");
            return;
        }

        const emailExists = accounts.some(
            account => account.email.toLowerCase() === email.toLowerCase()
        );

        if (emailExists) {
            showMessage("Email sudah terdaftar.");
            return;
        }

        accounts.push({
            username: username,
            email: email,
            password: password
        });

        localStorage.setItem("comicid_accounts", JSON.stringify(accounts));

        showMessage("Registrasi berhasil! Silakan login.");

        setTimeout(() => {window.location.href = "login.html";}, 1000);
    });
}