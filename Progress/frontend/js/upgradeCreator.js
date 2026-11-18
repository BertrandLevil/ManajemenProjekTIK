import { updateThemeButton } from "./theme.js";

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

const REQUEST_KEY = "comicid_creator_requests";

export function frontUpgradeCreator() {
    const app = document.getElementById("app");

    if (!app) return;

    const isLoggedIn =
        localStorage.getItem("comicid_logged_in") === "true";

    const email = localStorage.getItem("comicid_logged_in_email");
    const role = localStorage.getItem("comicid_logged_in_role");
    const userId = localStorage.getItem("comicid_user_id");
    const username =
        localStorage.getItem(`comicid_username_${email}`) ||
        "Pengguna ComicID";

    if (!isLoggedIn || !email) {
        window.location.href = "login.html";
        return;
    }

    if (role !== "Pembaca") {
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
                    <h1>Pengajuan Kreator</h1>
                    <p class="auth-description">
                        ${
                            role === "Kreator"
                                ? "Akun kamu sudah terdaftar sebagai Kreator."
                                : "Halaman ini hanya dapat digunakan oleh Pembaca."
                        }
                    </p>
                    <a class="signup-button auth-submit" href="home.html">
                        Kembali ke Beranda
                    </a>
                </section>
            </main>
        `;
        updateThemeButton();
        return;
    }

    function getRequests() {
        try {
            const data = JSON.parse(
                localStorage.getItem(REQUEST_KEY) || "[]"
            );

            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    }

    function getMyRequest() {
        return getRequests().find(request =>
            request.email === email
        );
    }

    const existingRequest = getMyRequest();

    if (existingRequest) {
        renderRequestStatus(existingRequest);
        return;
    }

    renderForm();

    function renderForm() {
        app.innerHTML = `
            <main class="profile-page">
                <section class="profile-card">

                    <a class="profile-back" href="home.html">
                        &larr; Kembali ke Beranda
                    </a>

                    <p class="section-eyebrow">
                        CREATOR PROGRAM
                    </p>

                    <h1>Upgrade Creator</h1>

                    <p class="auth-description">
                        Ajukan permohonan untuk menjadi kreator
                        dan mulai menerbitkan komik di ComicID.
                    </p>

                    <div class="profile-info">
                        <p><strong>Nama pengguna:</strong>
                            ${escapeHTML(username)}
                        </p>
                        <p><strong>Email:</strong>
                            ${escapeHTML(email)}
                        </p>
                        <p><strong>Role saat ini:</strong> Pembaca</p>
                    </div>

                    <form id="creator-request-form"
                            class="auth-form"
                            novalidate>

                        <label for="creator-reason">
                            Alasan ingin menjadi Kreator
                        </label>

                        <textarea
                            id="creator-reason"
                            rows="5"
                            maxlength="1000"
                            placeholder="Ceritakan alasan kamu ingin menjadi kreator..."
                            required
                        ></textarea>

                        <label for="creator-experience">
                            Pengalaman membuat komik
                            <span>(Opsional)</span>
                        </label>

                        <textarea
                            id="creator-experience"
                            rows="4"
                            maxlength="1000"
                            placeholder="Ceritakan pengalaman kamu..."
                        ></textarea>

                        <p id="creator-message"
                            class="auth-message"
                            role="alert"
                            hidden>
                        </p>

                        <button
                            type="submit"
                            class="signup-button auth-submit">
                            Kirim Pengajuan
                        </button>
                    </form>

                </section>
            </main>
        `;

        const form = document.getElementById(
            "creator-request-form"
        );

        const message = document.getElementById(
            "creator-message"
        );

        form.addEventListener("submit", event => {
            event.preventDefault();

            const reason = document
                .getElementById("creator-reason")
                .value.trim();

            const experience = document
                .getElementById("creator-experience")
                .value.trim();

            if (reason.length < 20) {
                showMessage(
                    "Alasan pengajuan minimal 20 karakter."
                );
                return;
            }

            const requests = getRequests();

            // Cegah pengajuan ganda.
            const alreadySubmitted = requests.some(request =>
                request.email === email
            );

            if (alreadySubmitted) {
                showMessage(
                    "Kamu sudah memiliki pengajuan Kreator."
                );
                return;
            }

            const newRequest = {
                id: Date.now(),
                userId: userId,
                username: username,
                email: email,
                reason: reason,
                experience: experience,
                status: "Pending",
                createdAt: new Date().toISOString()
            };

            requests.push(newRequest);

            try {
                localStorage.setItem(
                    REQUEST_KEY,
                    JSON.stringify(requests)
                );

                renderRequestStatus(newRequest);
            } catch {
                showMessage(
                    "Pengajuan gagal disimpan. Penyimpanan browser penuh."
                );
            }
        });

        function showMessage(text) {
            message.textContent = text;
            message.hidden = false;
        }
    }

    function renderRequestStatus(request) {
        let statusText = "";
        let statusColor = "";

        if (request.status === "Pending") {
            statusText = "Pengajuan sedang menunggu persetujuan Admin.";
            statusColor = "warning";
        } else if (request.status === "Approved") {
            statusText = "Selamat! Pengajuan Kreator kamu disetujui.";
            statusColor = "success";
        } else {
            statusText = "Pengajuan Kreator kamu ditolak oleh Admin.";
            statusColor = "danger";
        }

        app.innerHTML = `
            <main class="profile-page">
                <section class="profile-card">

                    <a class="profile-back" href="home.html">
                        &larr; Kembali ke Beranda
                    </a>

                    <p class="section-eyebrow">
                        CREATOR PROGRAM
                    </p>

                    <h1>Status Pengajuan</h1>

                    <p class="auth-description">
                        ${escapeHTML(statusText)}
                    </p>

                    <div class="profile-info">
                        <p>
                            <strong>Status:</strong>
                            ${escapeHTML(request.status)}
                        </p>

                        <p>
                            <strong>Nama:</strong>
                            ${escapeHTML(request.username)}
                        </p>

                        <p>
                            <strong>Alasan:</strong>
                            ${escapeHTML(request.reason)}
                        </p>
                    </div>

                    <a class="signup-button auth-submit"
                        href="home.html">
                        Kembali ke Beranda
                    </a>

                </section>
            </main>
        `;
    }
}
