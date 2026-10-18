function escapeProfileValue(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

export function renderProfile() {
    const app = document.getElementById("app");
    if (!app) return;

    const email = localStorage.getItem("comicid_logged_in_email");
    const username = localStorage.getItem(`comicid_username_${email}`) || "Pengguna ComicID";
    const photo = localStorage.getItem(`comicid_profile_photo_${email}`
        ) || "../assets/default-avatar.png";

    app.innerHTML = `
        <main class="profile-page">
            <button
                type="button"
                class="theme-toggle"
                id="theme-toggle"
                aria-label="Ganti tema"
                title="Ganti tema"
            >
                    <span class="theme-icon"></span>
            </button>

            <section class="profile-card">
                <a class="profile-back" href="home.html">
                    &larr; Kembali ke Beranda
                </a>

                <h1>Profil Saya</h1>
                <p class="auth-description">
                    Kelola foto profil dan nama pengguna kamu.
                </p>

                <div class="profile-photo-section">
                    <img
                        id="profile-preview"
                        class="profile-page-avatar"
                        src="${photo}"
                        alt="Foto profil"
                    >

                    <label
                        for="profile-photo-input"
                        class="profile-photo-label"
                    >
                        Ganti Foto Profil
                    </label>

                    <button
                        type="button"
                        id="remove-profile-photo"
                        class="profile-logout"
                    >
                        Hapus Foto Profil
                    </button>

                    <input
                        id="profile-photo-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        hidden
                    >

                    <p class="profile-hint">
                        Format JPG, PNG, atau WEBP. Maksimal 1 MB.
                    </p>
                </div>

                <form id="profile-form" class="auth-form" novalidate>
                    <label for="profile-username">
                        Nama pengguna
                    </label>

                    <input
                        id="profile-username"
                        type="text"
                        value="${escapeProfileValue(username)}"
                        minlength="3"
                        maxlength="30"
                        placeholder="Masukkan nama pengguna"
                        required
                    >

                    <p
                        id="profile-message"
                        class="auth-message"
                        role="alert"
                        hidden
                    ></p>

                    <button
                        type="submit"
                        class="signup-button auth-submit"
                    >
                        Simpan Perubahan
                    </button>

                    <button
                        type="button"
                        id="profile-logout"
                        class="profile-logout"
                    >
                        Logout
                    </button>
                </form>
            </section>
        </main>
    `;

    const form = document.getElementById("profile-form");
    const message = document.getElementById("profile-message");
    const photoInput = document.getElementById("profile-photo-input");
    const preview = document.getElementById("profile-preview");
    const removePhotoButton = document.getElementById("remove-profile-photo");

    removePhotoButton.addEventListener("click", () => {
        const email = localStorage.getItem("comicid_logged_in_email");

        localStorage.removeItem(`comicid_profile_photo_${email}`);
        preview.src = "../assets/default-avatar.png";
        photoInput.value = "";

        showMessage("Foto profil dikembalikan ke foto default.");
    });

    function showMessage(text) {
        message.textContent = text;
        message.hidden = false;
    }

    photoInput.addEventListener("change", () => {
        const file = photoInput.files[0];
        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            showMessage("Format foto harus JPG, PNG, atau WEBP.");
            photoInput.value = "";
            return;
        }

        if (file.size > 1024 * 1024) {
            showMessage("Ukuran foto maksimal 1 MB.");
            photoInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            try {
                const email = localStorage.getItem("comicid_logged_in_email");
                localStorage.setItem(`comicid_profile_photo_${email}`,reader.result);

                preview.src = reader.result;
                showMessage("Foto profil berhasil diganti.");
            } catch {
                showMessage(
                    "Foto gagal disimpan. Coba gambar yang lebih kecil."
                );
            }
        };

        reader.readAsDataURL(file);
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        message.hidden = true;

        const newUsername = document
            .getElementById("profile-username")
            .value.trim();

        if (newUsername.length < 3) {
            showMessage("Username minimal 3 karakter.");
            return;
        }

        if (newUsername.length > 30) {
            showMessage("Username maksimal 30 karakter.");
            return;
        }

        const email = localStorage.getItem("comicid_logged_in_email");
        localStorage.setItem(`comicid_username_${email}`, newUsername);
        showMessage("Username berhasil diperbarui.");
    });

    document
        .getElementById("profile-logout")
        .addEventListener("click", () => {
            localStorage.removeItem("comicid_logged_in");
            localStorage.removeItem("comicid_logged_in_email");
            window.location.href = "home.html";
        });
}