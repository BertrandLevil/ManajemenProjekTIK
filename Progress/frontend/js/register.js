export function frontRegister() {
    const app = document.getElementById("app");

    if (!app) return;

    if (!document.getElementById("register-form")) {
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
    }

    const form = document.getElementById("register-form");
    const message = document.getElementById("register-message");

    if (!form || form.dataset.attached === "true") return;
    form.dataset.attached = "true";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("register-username").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("register-confirm").value;
        const submitBtn = form.querySelector("button[type='submit']");

        function showMessage(text, isError = true) {
            message.textContent = text;
            message.hidden = false;
            message.style.color = isError ? "var(--color-danger, #ef4444)" : "var(--color-success, #22c55e)";
        }

        message.hidden = true;

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

        // Memanggil API backend Java yang terhubung ke database MariaDB/MySQL (comicid)
        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Mendaftarkan...";
            }

            const response = await fetch("http://localhost:8080/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                    role: "Pembaca"
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                showMessage(result.message || "Registrasi gagal.");
                return;
            }

            // Simpan akun lokal untuk sinkronisasi fallback jika dibutuhkan
            try {
                const accounts = JSON.parse(localStorage.getItem("comicid_accounts") || "[]");
                if (!accounts.some(acc => acc.email.toLowerCase() === email.toLowerCase())) {
                    accounts.push({ username, email, password });
                    localStorage.setItem("comicid_accounts", JSON.stringify(accounts));
                }
            } catch (err) {
                // Abaikan jika localStorage dibatasi
            }

            showMessage("Registrasi berhasil! Mengalihkan ke login...", false);
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);

        } catch (error) {
            showMessage("Gagal terhubung ke server backend ComicID. Pastikan backend Java sudah berjalan.");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Daftar";
            }
        }
    });
}