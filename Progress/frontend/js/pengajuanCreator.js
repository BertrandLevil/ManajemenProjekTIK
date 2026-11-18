import { updateThemeButton } from "./theme.js";
const REQUEST_KEY = "comicid_creator_requests";

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

export function frontPengajuanCreator() {
    const app = document.getElementById("app");

    if (!app) return;

    const isLoggedIn =
        localStorage.getItem("comicid_logged_in") === "true";

    const role = localStorage.getItem("comicid_logged_in_role");

    if (!isLoggedIn || role !== "Admin") {
        app.innerHTML = `
            <main class="profile-page">
                <section class="profile-card">
                    <h1>Akses Ditolak</h1>
                    <p class="auth-description">
                        Halaman ini hanya dapat diakses oleh Admin.
                    </p>
                    <a href="home.html" class="profile-back">
                        Kembali ke Beranda
                    </a>
                </section>
            </main>
        `;
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

    function renderRequests() {
        const requests = getRequests();

        const pendingCount = requests.filter(
            request => request.status === "Pending"
        ).length;

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

                    <p class="section-eyebrow">
                        ADMIN PANEL
                    </p>

                    <h1>Pengajuan Kreator</h1>

                    <p class="auth-description">
                        Periksa dan kelola permohonan pengguna
                        yang ingin menjadi Kreator ComicID.
                    </p>

                    <div class="profile-info">
                        <p>
                            Total pengajuan:
                            <strong>${requests.length}</strong>
                        </p>
                        <p>
                            Menunggu persetujuan:
                            <strong>${pendingCount}</strong>
                        </p>
                    </div>

                    <div id="request-list">
                        ${
                            requests.length === 0
                                ? `
                                    <p class="auth-description">
                                        Belum ada pengajuan Kreator.
                                    </p>
                                `
                                : requests.map(request => `
                                    <article
                                        class="profile-info"
                                        style="margin-top: 20px; padding: 16px;"
                                    >
                                        <h3>
                                            ${escapeHTML(request.username)}
                                        </h3>

                                        <p>
                                            <strong>Email:</strong>
                                            ${escapeHTML(request.email)}
                                        </p>

                                        <p>
                                            <strong>Alasan:</strong>
                                            ${escapeHTML(request.reason)}
                                        </p>

                                        <p>
                                            <strong>Pengalaman:</strong>
                                            ${escapeHTML(
                                                request.experience || "Tidak diisi"
                                            )}
                                        </p>

                                        <p>
                                            <strong>Status:</strong>
                                            ${escapeHTML(request.status)}
                                        </p>

                                        ${
                                            request.status === "Pending"
                                                ? `
                                                    <div style="
                                                        display: flex;
                                                        gap: 10px;
                                                        flex-wrap: wrap;
                                                        margin-top: 15px;
                                                    ">
                                                        <button
                                                            type="button"
                                                            class="signup-button"
                                                            data-action="approve"
                                                            data-id="${request.id}"
                                                        >
                                                            Setujui
                                                        </button>

                                                        <button
                                                            type="button"
                                                            class="profile-logout"
                                                            data-action="reject"
                                                            data-id="${request.id}"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                `
                                                : ""
                                        }
                                    </article>
                                `).join("")
                        }
                    </div>
                </section>
            </main>
        `;
    
        updateThemeButton();
        attachRequestEvents();
    }

    function attachRequestEvents() {
        const buttons = app.querySelectorAll("[data-action]");

        buttons.forEach(button => {
            button.addEventListener("click", () => {
                const requestId = button.dataset.id;
                const action = button.dataset.action;

                if (action === "approve") {
                    approveRequest(requestId);
                } else if (action === "reject") {
                    rejectRequest(requestId);
                }
            });
        });
    }

    function approveRequest(requestId) {
        const requests = getRequests();

        const request = requests.find(
            item => String(item.id) === String(requestId)
        );

        if (!request || request.status !== "Pending") return;

        const confirmed = confirm(
            `Setujui ${request.username} sebagai Kreator?`
        );

        if (!confirmed) return;

        request.status = "Approved";

        try {
            localStorage.setItem(
                `comicid_role_${request.email}`,
                "Kreator"
            );

            localStorage.setItem(
                REQUEST_KEY,
                JSON.stringify(requests)
            );

            alert("Pengajuan berhasil disetujui.");
            renderRequests();
        } catch {
            alert("Gagal menyimpan perubahan.");
        }
    }

    function rejectRequest(requestId) {
        const requests = getRequests();

        const request = requests.find(
            item => String(item.id) === String(requestId)
        );

        if (!request || request.status !== "Pending") return;

        const confirmed = confirm(
            `Tolak pengajuan ${request.username}?`
        );

        if (!confirmed) return;

        request.status = "Rejected";

        try {
            localStorage.setItem(
                REQUEST_KEY,
                JSON.stringify(requests)
            );

            alert("Pengajuan berhasil ditolak.");
            renderRequests();
        } catch {
            alert("Gagal menyimpan perubahan.");
        }
    }
    renderRequests();
}