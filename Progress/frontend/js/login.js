export function frontLogin() {
    const app = document.getElementById("app");

    if (!app) return;

    if (!document.getElementById("login-form")) {
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
                        <label for="login-email">Email atau Username</label>
                        <input
                            id="login-email"
                            name="email"
                            type="text"
                            placeholder="nama@email.com atau username"
                            autocomplete="username"
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
    }

    const form = document.getElementById("login-form");
    const message = document.getElementById("login-message");

    if (!form || form.dataset.attached === "true") return;
    form.dataset.attached = "true";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document
            .getElementById("login-email")
            .value.trim();

        const password = document
            .getElementById("login-password")
            .value;
        const submitBtn = form.querySelector("button[type='submit']");

        function showMessage(text, isError = true) {
            message.textContent = text;
            message.hidden = false;
            message.style.color = isError ? "var(--color-danger, #ef4444)" : "var(--color-success, #22c55e)";
        }

        message.hidden = true;

        if (email === "" && password === "") {
            showMessage("Form login wajib diisi.");
            return;
        }

        if (!email) {
            showMessage("Email atau username wajib diisi.");
            return;
        }

        // Jika memasukkan format email, validasi polanya. Jika username, minimal 3 karakter.
        if (email.includes("@")) {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showMessage("Format email tidak valid.");
                return;
            }
        } else if (email.length < 3) {
            showMessage("Username minimal 3 karakter.");
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

        // Memanggil LoginController Java yang terhubung ke Database MySQL (comicid)
        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Memverifikasi...";
            }

            const response = await fetch("http://localhost:8080/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                // Menampilkan pesan error dari controller ("Email atau username tidak terdaftar." / "Password salah.")
                showMessage(result.message || "Gagal masuk ke akun.");
                return;
            }

            // Menyimpan sesi login ke localStorage agar kompatibel dengan halaman home.html Anda
            localStorage.setItem("comicid_logged_in_email", result.email);
            localStorage.setItem("comicid_logged_in", "true");
            localStorage.setItem("comicid_logged_in_role", result.role);
            localStorage.setItem(`comicid_username_${result.email}`, result.username);

            showMessage("Login berhasil! Mengalihkan ke beranda...", false);

            setTimeout(() => {
                window.location.href = "home.html";
            }, 800);
        } catch (error) {
            showMessage("Gagal terhubung ke server backend ComicID. Pastikan backend Java sudah berjalan.");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Masuk";
            }
        }
    });
}