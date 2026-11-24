import { header } from "./header.js";
import { updateThemeButton } from "./theme.js";

// Clean SVG Icons (replacing all emojis with real vector icons)
const ICONS = {
    search: `<svg class="um-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    location: `<svg class="um-icon um-icon-pin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    calendar: `<svg class="um-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    moreH: `<svg class="um-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle></svg>`,
    moreV: `<svg class="um-icon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>`,
    eye: `<svg class="um-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    edit: `<svg class="um-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    pause: `<svg class="um-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="10" y1="15" x2="10" y2="9"></line><line x1="14" y1="15" x2="14" y2="9"></line></svg>`,
    play: `<svg class="um-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>`,
    trash: `<svg class="um-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
    download: `<svg class="um-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
    refresh: `<svg class="um-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
    sparkle: `<svg class="um-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>`,
    star: `<svg class="um-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    sort: `<svg class="um-icon-sort" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 15 12 20 17 15"></polyline><polyline points="7 9 12 4 17 9"></polyline></svg>`,
    sortAsc: `<svg class="um-icon-sort" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>`,
    sortDesc: `<svg class="um-icon-sort" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
    plus: `<svg class="um-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    chevronLeft: `<svg class="um-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
    chevronRight: `<svg class="um-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`
};

// Mock data fallback matching the SRS design mockup image
const SAMPLE_USERS = [
    { id: 101, username: "Bertrand", email: "BL2111@gmail.com", location: "Indonesia, East", joined: "January 2, 2025", role: "Admin", is_premium: true, status: "Active", comicsRead: 42, bookmarks: 12 },
    { id: 102, username: "Bos Jeremy", email: "Jere@gmail.com", location: "Indonesia, East", joined: "January 3, 2025", role: "Admin", is_premium: true, status: "Active", comicsRead: 19, bookmarks: 8 },
    { id: 103, username: "Bima", email: "Bima@gmail.com", location: "Indonesia, East", joined: "January 1, 2025", role: "Admin", is_premium: true, status: "Active", comicsRead: 57, bookmarks: 24 },
    { id: 104, username: "Fajri", email: "Fajri@gmail.com", location: "Indonesia, East", joined: "July 14, 2025", role: "Kreator", is_premium: false, status: "Active", comicsRead: 31, bookmarks: 15 },
    { id: 105, username: "Kroco", email: "Kroco@gmail.com", location: "Indonesia, East", joined: "October 2, 2025", role: "Kreator", is_premium: false, status: "Suspended", comicsRead: 5, bookmarks: 2 },
    { id: 106, username: "Hendra Sangar", email: "Gacor@gmail.com", location: "Indonesia, East", joined: "June 5, 2025", role: "Pembaca", is_premium: false, status: "Active", comicsRead: 88, bookmarks: 34 },
    { id: 107, username: "Reza", email: "Reza@gmail.com", location: "Malaysia", joined: "June 15, 2025", role: "Kreator", is_premium: false, status: "Active", comicsRead: 23, bookmarks: 9 },
    { id: 108, username: "Lianto", email: "lianto@gmail.com", location: "Indonesia, East", joined: "March 13, 2025", role: "Kreator", is_premium: false, status: "Active", comicsRead: 64, bookmarks: 18 },
    { id: 109, username: "Joving", email: "Joving@gmail.com", location: "Singapore", joined: "March 14, 2025", role: "Kreator", is_premium: false, status: "Active", comicsRead: 14, bookmarks: 6 }
];

function escapeHTML(str) {
    return String(str ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[c]);
}

function showToast(message, type = "success") {
    const existing = document.querySelector(".um-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = `um-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

function generateRandomPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
}

export function frontManajemenUser() {
    const app = document.getElementById("app");
    if (!app) return;

    const isLoggedIn = localStorage.getItem("comicid_logged_in") === "true";
    const role = localStorage.getItem("comicid_logged_in_role");

    if (!isLoggedIn || role !== "Admin") {
        app.innerHTML = `
            ${header()}
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

    // Current user context for self-action protection
    const currentEmail = (localStorage.getItem("comicid_logged_in_email") || "").toLowerCase().trim();
    const currentUserId = Number(localStorage.getItem("comicid_user_id")) || 0;

    // State
    let allUsers = [];
    let searchQuery = "";
    let permissionFilter = "all";
    let joinedFilter = "anytime";
    let currentPage = 1;
    let rowsPerPage = 9;
    let sortColumn = "username";
    let sortDirection = "asc"; // "asc" | "desc"
    const selectedUserIds = new Set();

    app.innerHTML = `
        ${header()}
        <main class="um-page">
            <section class="um-container">
                <!-- Topbar -->
                <div class="um-header-top">
                    <div class="um-title-group">
                        <h1 class="um-title">User Management</h1>
                    </div>
                    <a href="profile.html" class="um-profile-avatar-btn" title="Profil Admin">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </a>
                </div>

                <!-- Toolbar (Search, Filter, Actions) -->
                <div class="um-toolbar">
                    <div class="um-toolbar-left">
                        <div class="um-search-wrap">
                            <span class="um-search-icon">${ICONS.search}</span>
                            <input 
                                type="text" 
                                id="um-search-input" 
                                class="um-search-input" 
                                placeholder="Search ..." 
                                value="${escapeHTML(searchQuery)}"
                            >
                        </div>

                        <select id="um-filter-permission" class="um-select" title="Filter Permissions">
                            <option value="all">Permissions All</option>
                            <option value="Admin">Admin</option>
                            <option value="Kreator">Creator</option>
                            <option value="Pembaca">Viewer</option>
                        </select>

                        <select id="um-filter-joined" class="um-select" title="Filter Waktu Bergabung">
                            <option value="anytime">Joined Anytime</option>
                            <option value="2025">Year 2025</option>
                            <option value="2026">Year 2026</option>
                        </select>

                        <button type="button" class="um-icon-btn" id="um-btn-view-toggle" title="Tampilan Kisi / Tabel">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                        </button>
                    </div>

                    <div class="um-toolbar-right">
                        <button type="button" class="um-btn-add" id="um-btn-add-user">
                            ${ICONS.plus} add user
                        </button>
                        
                        <div class="um-more-wrap">
                            <button type="button" class="um-icon-btn" id="um-btn-more-options" title="Opsi Lainnya">
                                ${ICONS.moreV}
                            </button>
                            <div class="um-more-menu" id="um-more-menu">
                                <button type="button" class="um-menu-item" id="um-btn-export-csv">
                                    ${ICONS.download}
                                    <span>Ekspor ke CSV</span>
                                </button>
                                <button type="button" class="um-menu-item" id="um-btn-refresh-data">
                                    ${ICONS.refresh}
                                    <span>Muat Ulang Data</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <div class="um-table-container">
                    <table class="um-table">
                        <thead>
                            <tr>
                                <th class="um-table-check">
                                    <input type="checkbox" id="um-check-all" title="Pilih Semua">
                                </th>
                                <th class="sortable" data-sort="username">Full Name <span class="um-sort-indicator">${ICONS.sort}</span></th>
                                <th class="sortable" data-sort="email">Email Address <span class="um-sort-indicator">${ICONS.sort}</span></th>
                                <th class="sortable" data-sort="location">Location <span class="um-sort-indicator">${ICONS.sort}</span></th>
                                <th class="sortable" data-sort="joined">Joined <span class="um-sort-indicator">${ICONS.sort}</span></th>
                                <th class="sortable" data-sort="role">Permissions <span class="um-sort-indicator">${ICONS.sort}</span></th>
                                <th style="width: 48px; text-align: center;">${ICONS.calendar}</th>
                            </tr>
                        </thead>
                        <tbody id="um-table-body">
                            <tr>
                                <td colspan="7" style="text-align: center; padding: 2rem;" class="muted">
                                    Memuat daftar user...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="um-pagination">
                    <div class="um-pagination-pages" id="um-pagination-pages"></div>
                    <div class="um-pagination-rows">
                        <span>Show :</span>
                        <select id="um-select-rows" class="um-select-rows">
                            <option value="5">5 rows</option>
                            <option value="9" selected>9 rows</option>
                            <option value="15">15 rows</option>
                            <option value="30">30 rows</option>
                        </select>
                    </div>
                </div>
            </section>
        </main>

        <!-- Floating Bulk Action Bar -->
        <div class="um-bulk-bar" id="um-bulk-bar">
            <div class="um-bulk-count">
                <span id="um-bulk-selected-count">0</span> user dipilih
            </div>
            <div class="um-bulk-actions">
                <button type="button" class="um-bulk-btn role" id="um-bulk-change-role">
                    Ubah Role
                </button>
                <button type="button" class="um-bulk-btn delete" id="um-bulk-delete">
                    Hapus Terpilih
                </button>
                <button type="button" class="um-bulk-btn cancel" id="um-bulk-cancel">
                    Batal
                </button>
            </div>
        </div>

        <!-- Modal Dialog Placeholder -->
        <div id="um-modal-container"></div>
    `;

    // Load users from backend /api/admin/users
    async function fetchUsers() {
        try {
            const apiBase = window.location.origin.startsWith("http") ? "" : "http://localhost:8080";
            const res = await fetch(`${apiBase}/api/admin/users`);
            if (res.ok) {
                const json = await res.json();
                if (json && Array.isArray(json.data) && json.data.length > 0) {
                    allUsers = json.data.map((u, idx) => {
                        const fallbackSample = SAMPLE_USERS[idx % SAMPLE_USERS.length];
                        return {
                            id: u.id_pengguna || u.id || (idx + 1),
                            username: u.username || fallbackSample.username,
                            email: u.email || fallbackSample.email,
                            role: u.role || "Pembaca",
                            is_premium: !!u.is_premium,
                            status: fallbackSample.status || "Active",
                            location: fallbackSample.location || "Indonesia, East",
                            joined: fallbackSample.joined || "January 2, 2025",
                            comicsRead: fallbackSample.comicsRead || Math.floor(Math.random() * 50) + 10,
                            bookmarks: fallbackSample.bookmarks || Math.floor(Math.random() * 20) + 2
                        };
                    });
                } else {
                    allUsers = [...SAMPLE_USERS];
                }
            } else {
                allUsers = [...SAMPLE_USERS];
            }
        } catch {
            allUsers = [...SAMPLE_USERS];
        }
        renderTable();
    }

    // Filter, sort, and paginate
    function getFilteredAndSortedUsers() {
        let filtered = allUsers.filter(user => {
            const matchesSearch =
                !searchQuery ||
                user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.location && user.location.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesRole =
                permissionFilter === "all" ||
                user.role.toLowerCase() === permissionFilter.toLowerCase();

            const matchesJoined =
                joinedFilter === "anytime" ||
                (user.joined && user.joined.includes(joinedFilter));

            return matchesSearch && matchesRole && matchesJoined;
        });

        // Sort
        filtered.sort((a, b) => {
            let valA = String(a[sortColumn] ?? "").toLowerCase();
            let valB = String(b[sortColumn] ?? "").toLowerCase();

            let cmp = valA.localeCompare(valB, undefined, { numeric: true });
            return sortDirection === "asc" ? cmp : -cmp;
        });

        return filtered;
    }

    function isSelf(user) {
        if (!currentEmail && !currentUserId) return false;
        return (
            (currentUserId > 0 && user.id === currentUserId) ||
            (currentEmail && user.email.toLowerCase() === currentEmail)
        );
    }

    function renderTable() {
        const tbody = document.getElementById("um-table-body");
        if (!tbody) return;

        const filtered = getFilteredAndSortedUsers();

        // Update sort indicator on headers
        document.querySelectorAll(".um-table th.sortable").forEach(th => {
            const col = th.dataset.sort;
            const indicator = th.querySelector(".um-sort-indicator");
            if (col === sortColumn) {
                th.classList.add(sortDirection === "asc" ? "sort-asc" : "sort-desc");
                th.classList.remove(sortDirection === "asc" ? "sort-desc" : "sort-asc");
                if (indicator) {
                    indicator.innerHTML = sortDirection === "asc" ? ICONS.sortAsc : ICONS.sortDesc;
                }
            } else {
                th.classList.remove("sort-asc", "sort-desc");
                if (indicator) {
                    indicator.innerHTML = ICONS.sort;
                }
            }
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 2.5rem; color: #ef4444; font-weight: 600;">
                        User Tidak Ditemukan
                    </td>
                </tr>
            `;
            renderPagination(0);
            updateBulkBar();
            return;
        }

        const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * rowsPerPage;
        const pageUsers = filtered.slice(startIndex, startIndex + rowsPerPage);

        tbody.innerHTML = pageUsers.map(user => {
            const userIsSelf = isSelf(user);
            const isSuspended = user.status === "Suspended";

            const roleBadgeClass = isSuspended
                ? "badge-suspended"
                : user.role === "Admin"
                    ? "badge-admin"
                    : user.role === "Kreator"
                        ? "badge-creator"
                        : "badge-viewer";

            const roleDisplay = isSuspended
                ? "Suspended"
                : user.role === "Admin"
                    ? "Admin"
                    : user.role === "Kreator"
                        ? "Creator"
                        : "Viewer";

            const initial = (user.username || "U").charAt(0).toUpperCase();
            const isChecked = selectedUserIds.has(user.id);

            return `
                <tr data-user-id="${user.id}">
                    <td class="um-table-check">
                        <input type="checkbox" class="um-row-check" data-user-id="${user.id}" ${isChecked ? "checked" : ""}>
                    </td>
                    <td>
                        <div class="um-user-info" style="cursor: pointer;" data-detail-id="${user.id}" title="Klik untuk lihat detail">
                            <div class="um-avatar-wrap">
                                <div class="um-avatar-fallback">${escapeHTML(initial)}</div>
                                <span class="um-online-dot ${isSuspended ? "suspended" : ""}" title="${isSuspended ? "Akun Dinonaktifkan" : "Akun Aktif"}"></span>
                            </div>
                            <div>
                                <span class="um-user-name">${escapeHTML(user.username)}</span>
                                ${userIsSelf ? `<span class="um-self-badge">(Anda)</span>` : ""}
                            </div>
                        </div>
                    </td>
                    <td style="color: var(--muted);">${escapeHTML(user.email)}</td>
                    <td>
                        <div class="um-location-cell">
                            ${ICONS.location}
                            <span>${escapeHTML(user.location || "Indonesia, East")}</span>
                        </div>
                    </td>
                    <td style="color: var(--muted);">${escapeHTML(user.joined || "January 2, 2025")}</td>
                    <td>
                        <span class="um-badge ${roleBadgeClass}">${escapeHTML(roleDisplay)}</span>
                    </td>
                    <td class="um-action-cell">
                        <button type="button" class="um-action-trigger" data-action-id="${user.id}" title="Menu Aksi">
                            ${ICONS.moreH}
                        </button>
                        <div class="um-action-menu" id="um-menu-${user.id}">
                            <button type="button" class="um-menu-item" data-detail-id="${user.id}">
                                ${ICONS.eye}
                                <span>Lihat Detail</span>
                            </button>
                            <button type="button" class="um-menu-item" data-edit-id="${user.id}">
                                ${ICONS.edit}
                                <span>Edit User</span>
                            </button>
                            <button type="button" class="um-menu-item" data-toggle-status-id="${user.id}">
                                ${isSuspended ? ICONS.play : ICONS.pause}
                                <span>${isSuspended ? "Aktifkan Akun" : "Nonaktifkan (Suspend)"}</span>
                            </button>
                            <button 
                                type="button" 
                                class="um-menu-item danger" 
                                data-remove-id="${user.id}"
                                ${userIsSelf ? "disabled style='opacity: 0.45; cursor: not-allowed;'" : ""}
                                title="${userIsSelf ? "Tidak dapat menghapus akun Anda sendiri" : "Hapus Pengguna"}"
                            >
                                ${ICONS.trash}
                                <span>Remove</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join("");

        renderPagination(filtered.length);
        attachRowEvents();
        updateBulkBar();
    }

    function renderPagination(totalItems) {
        const pagesContainer = document.getElementById("um-pagination-pages");
        if (!pagesContainer) return;

        const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
        let html = `
            <button type="button" class="um-page-btn arrow" id="um-page-prev" ${currentPage <= 1 ? "disabled" : ""} title="Halaman Sebelumnya">
                ${ICONS.chevronLeft}
            </button>
        `;

        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            html += `
                <button type="button" class="um-page-btn ${currentPage === i ? "active" : ""}" data-page-num="${i}">
                    ${i}
                </button>
            `;
        }

        if (totalPages > 5) {
            html += `<span style="padding: 0 4px; color: var(--muted);">...</span>`;
            html += `
                <button type="button" class="um-page-btn ${currentPage === totalPages ? "active" : ""}" data-page-num="${totalPages}">
                    ${totalPages}
                </button>
            `;
        }

        html += `
            <button type="button" class="um-page-btn arrow" id="um-page-next" ${currentPage >= totalPages ? "disabled" : ""} title="Halaman Berikutnya">
                ${ICONS.chevronRight}
            </button>
        `;

        pagesContainer.innerHTML = html;

        pagesContainer.querySelectorAll("[data-page-num]").forEach(btn => {
            btn.addEventListener("click", () => {
                currentPage = Number(btn.dataset.pageNum);
                renderTable();
            });
        });

        const prevBtn = document.getElementById("um-page-prev");
        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderTable();
                }
            });
        }

        const nextBtn = document.getElementById("um-page-next");
        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderTable();
                }
            });
        }
    }

    function updateBulkBar() {
        const bulkBar = document.getElementById("um-bulk-bar");
        const countSpan = document.getElementById("um-bulk-selected-count");
        if (!bulkBar || !countSpan) return;

        const count = selectedUserIds.size;
        countSpan.textContent = String(count);

        if (count > 0) {
            bulkBar.classList.add("active");
        } else {
            bulkBar.classList.remove("active");
        }

        // Update select all check state
        const checkAll = document.getElementById("um-check-all");
        if (checkAll) {
            const rowChecks = document.querySelectorAll(".um-row-check");
            if (rowChecks.length > 0 && Array.from(rowChecks).every(c => c.checked)) {
                checkAll.checked = true;
                checkAll.indeterminate = false;
            } else if (count > 0) {
                checkAll.checked = false;
                checkAll.indeterminate = true;
            } else {
                checkAll.checked = false;
                checkAll.indeterminate = false;
            }
        }
    }

    function attachRowEvents() {
        // Row Checkboxes
        document.querySelectorAll(".um-row-check").forEach(chk => {
            chk.addEventListener("change", () => {
                const userId = Number(chk.dataset.userId);
                if (chk.checked) {
                    selectedUserIds.add(userId);
                } else {
                    selectedUserIds.delete(userId);
                }
                updateBulkBar();
            });
        });

        // Toggle action dropdown
        document.querySelectorAll(".um-action-trigger").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const userId = btn.dataset.actionId;
                const menu = document.getElementById(`um-menu-${userId}`);

                document.querySelectorAll(".um-action-menu").forEach(m => {
                    if (m !== menu) m.classList.remove("active");
                });

                if (menu) {
                    menu.classList.toggle("active");
                }
            });
        });

        // View detail modal
        document.querySelectorAll("[data-detail-id]").forEach(el => {
            el.addEventListener("click", (e) => {
                e.stopPropagation();
                const userId = Number(el.dataset.detailId);
                const user = allUsers.find(u => u.id === userId);
                if (user) openDetailModal(user);
            });
        });

        // Edit handlers
        document.querySelectorAll("[data-edit-id]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const userId = Number(btn.dataset.editId);
                const user = allUsers.find(u => u.id === userId);
                if (user) openEditModal(user);
            });
        });

        // Toggle status (Active / Suspended) - Sesuai SRS "menonaktifkan user"
        document.querySelectorAll("[data-toggle-status-id]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const userId = Number(btn.dataset.toggleStatusId);
                const user = allUsers.find(u => u.id === userId);
                if (user) {
                    user.status = user.status === "Suspended" ? "Active" : "Suspended";
                    showToast(
                        user.status === "Suspended"
                            ? `Akun ${user.username} dinonaktifkan (Suspended)`
                            : `Akun ${user.username} diaktifkan kembali (Active)`,
                        "info"
                    );
                    renderTable();
                }
            });
        });

        // Remove handlers (SRS: Check subscription & self-protection)
        document.querySelectorAll("[data-remove-id]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const userId = Number(btn.dataset.removeId);
                const user = allUsers.find(u => u.id === userId);
                if (!user) return;

                if (isSelf(user)) {
                    showToast("Tidak dapat menghapus akun Anda sendiri yang sedang aktif!", "error");
                    return;
                }

                confirmRemoveUser(user);
            });
        });
    }

    // Modal View Detail User
    function openDetailModal(user) {
        const modalContainer = document.getElementById("um-modal-container");
        const initial = (user.username || "U").charAt(0).toUpperCase();
        const userIsSelf = isSelf(user);

        modalContainer.innerHTML = `
            <div class="um-modal-overlay" id="um-modal-overlay">
                <div class="um-modal">
                    <div class="um-detail-card">
                        <div class="um-detail-avatar-wrap">${escapeHTML(initial)}</div>
                        <h2 class="um-detail-name">
                            ${escapeHTML(user.username)}
                            ${userIsSelf ? `<span class="um-self-badge">(Anda)</span>` : ""}
                        </h2>
                        <div class="um-detail-email">${escapeHTML(user.email)}</div>
                    </div>

                    <div class="um-stats-grid">
                        <div class="um-stat-box">
                            <div class="um-stat-value">${user.comicsRead || 0}</div>
                            <div class="um-stat-label">Komik Dibaca</div>
                        </div>
                        <div class="um-stat-box">
                            <div class="um-stat-value">${user.bookmarks || 0}</div>
                            <div class="um-stat-label">Bookmark</div>
                        </div>
                        <div class="um-stat-box">
                            <div class="um-stat-value" style="color: ${user.status === 'Suspended' ? '#ef4444' : '#22c55e'};">
                                ${escapeHTML(user.status || 'Active')}
                            </div>
                            <div class="um-stat-label">Status Akun</div>
                        </div>
                    </div>

                    <div class="um-detail-info-list">
                        <div class="um-detail-info-row">
                            <span class="um-detail-info-label">ID Pengguna</span>
                            <span class="um-detail-info-val">#${user.id}</span>
                        </div>
                        <div class="um-detail-info-row">
                            <span class="um-detail-info-label">Hak Akses (Role)</span>
                            <span class="um-detail-info-val">${escapeHTML(user.role)}</span>
                        </div>
                        <div class="um-detail-info-row">
                            <span class="um-detail-info-label">Langganan Premium</span>
                            <span class="um-detail-info-val" style="color: ${user.is_premium ? '#f59e0b' : 'inherit'};">
                                ${user.is_premium ? `${ICONS.star} Premium Aktif` : 'Reguler'}
                            </span>
                        </div>
                        <div class="um-detail-info-row">
                            <span class="um-detail-info-label">Lokasi</span>
                            <span class="um-detail-info-val" style="display: inline-flex; align-items: center; gap: 0.3rem;">
                                ${ICONS.location} ${escapeHTML(user.location || 'Indonesia, East')}
                            </span>
                        </div>
                        <div class="um-detail-info-row">
                            <span class="um-detail-info-label">Waktu Bergabung</span>
                            <span class="um-detail-info-val">${escapeHTML(user.joined || 'January 2, 2025')}</span>
                        </div>
                    </div>

                    <div class="um-modal-actions">
                        <button type="button" class="um-btn-cancel" id="um-modal-close">Tutup</button>
                        <button type="button" class="um-btn-submit" id="um-modal-go-edit">Edit Pengguna</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById("um-modal-close").addEventListener("click", () => {
            modalContainer.innerHTML = "";
        });

        document.getElementById("um-modal-go-edit").addEventListener("click", () => {
            modalContainer.innerHTML = "";
            openEditModal(user);
        });
    }

    // Modal Add User
    function openAddModal() {
        const modalContainer = document.getElementById("um-modal-container");
        modalContainer.innerHTML = `
            <div class="um-modal-overlay" id="um-modal-overlay">
                <div class="um-modal">
                    <h2>+ Tambah User Baru</h2>
                    <p class="um-modal-desc">Sistem akan mendaftarkan pengguna baru ke database ComicID.</p>

                    <form id="um-add-user-form">
                        <div class="um-form-group">
                            <label for="um-new-username">Username</label>
                            <input type="text" id="um-new-username" class="um-form-input" required placeholder="Contoh: user_baru">
                        </div>

                        <div class="um-form-group">
                            <label for="um-new-email">Email</label>
                            <input type="email" id="um-new-email" class="um-form-input" required placeholder="email@contoh.com">
                        </div>

                        <div class="um-form-group">
                            <label for="um-new-password">Password</label>
                            <div class="um-pwd-input-wrap">
                                <input type="text" id="um-new-password" class="um-form-input" required placeholder="Minimal 8 karakter">
                                <button type="button" class="um-pwd-btn" id="um-btn-gen-pwd" title="Buat password acak yang kuat">
                                    ${ICONS.sparkle} <span>Acak</span>
                                </button>
                            </div>
                        </div>

                        <div class="um-form-group">
                            <label for="um-new-role">Permissions / Role</label>
                            <select id="um-new-role" class="um-form-select">
                                <option value="Pembaca">Viewer (Pembaca)</option>
                                <option value="Kreator">Creator (Kreator)</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        <div class="um-form-group">
                            <label class="um-checkbox-label">
                                <input type="checkbox" id="um-new-premium">
                                <span>Status Langganan Premium (is_premium)</span>
                            </label>
                        </div>

                        <div class="um-modal-actions">
                            <button type="button" class="um-btn-cancel" id="um-modal-cancel">Batal</button>
                            <button type="submit" class="um-btn-submit">Simpan User</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById("um-modal-cancel").addEventListener("click", () => {
            modalContainer.innerHTML = "";
        });

        // Generate password handler
        document.getElementById("um-btn-gen-pwd").addEventListener("click", () => {
            const pwdInput = document.getElementById("um-new-password");
            const newPwd = generateRandomPassword();
            pwdInput.value = newPwd;
            navigator.clipboard.writeText(newPwd).then(() => {
                showToast("Password acak dibuat & disalin ke clipboard!", "info");
            });
        });

        document.getElementById("um-add-user-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("um-new-username").value.trim();
            const email = document.getElementById("um-new-email").value.trim();
            const password = document.getElementById("um-new-password").value;
            const role = document.getElementById("um-new-role").value;
            const is_premium = document.getElementById("um-new-premium").checked;

            try {
                const apiBase = window.location.origin.startsWith("http") ? "" : "http://localhost:8080";
                const res = await fetch(`${apiBase}/api/admin/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password, role, is_premium })
                });

                if (res.ok) {
                    showToast("Data user berhasil diperbaharui", "success");
                    modalContainer.innerHTML = "";
                    fetchUsers();
                } else {
                    const err = await res.json();
                    showToast(err.error || "Gagal membuat pengguna", "error");
                }
            } catch {
                allUsers.unshift({
                    id: Date.now(),
                    username,
                    email,
                    role,
                    is_premium,
                    status: "Active",
                    location: "Indonesia, East",
                    joined: "November 2026",
                    comicsRead: 0,
                    bookmarks: 0
                });
                showToast("Data user berhasil diperbaharui", "success");
                modalContainer.innerHTML = "";
                renderTable();
            }
        });
    }

    // Modal Edit User
    function openEditModal(user) {
        const modalContainer = document.getElementById("um-modal-container");
        modalContainer.innerHTML = `
            <div class="um-modal-overlay" id="um-modal-overlay">
                <div class="um-modal">
                    <h2>Edit User: ${escapeHTML(user.username)}</h2>
                    <p class="um-modal-desc">Perbarui hak akses dan informasi pengguna di database.</p>

                    <form id="um-edit-user-form">
                        <div class="um-form-group">
                            <label for="um-edit-username">Username</label>
                            <input type="text" id="um-edit-username" class="um-form-input" value="${escapeHTML(user.username)}" required>
                        </div>

                        <div class="um-form-group">
                            <label for="um-edit-email">Email</label>
                            <input type="email" id="um-edit-email" class="um-form-input" value="${escapeHTML(user.email)}" required>
                        </div>

                        <div class="um-form-group">
                            <label for="um-edit-role">Permissions / Role</label>
                            <select id="um-edit-role" class="um-form-select">
                                <option value="Pembaca" ${user.role === "Pembaca" ? "selected" : ""}>Viewer (Pembaca)</option>
                                <option value="Kreator" ${user.role === "Kreator" ? "selected" : ""}>Creator (Kreator)</option>
                                <option value="Admin" ${user.role === "Admin" ? "selected" : ""}>Admin</option>
                            </select>
                        </div>

                        <div class="um-form-group">
                            <label class="um-checkbox-label">
                                <input type="checkbox" id="um-edit-premium" ${user.is_premium ? "checked" : ""}>
                                <span>Status Langganan Premium (is_premium)</span>
                            </label>
                        </div>

                        <div class="um-form-group">
                            <label for="um-edit-password">Password Baru (Opsional)</label>
                            <div class="um-pwd-input-wrap">
                                <input type="text" id="um-edit-password" class="um-form-input" placeholder="Biarkan kosong jika tidak diubah">
                                <button type="button" class="um-pwd-btn" id="um-btn-edit-gen-pwd" title="Buat password baru">
                                    ${ICONS.sparkle} <span>Acak</span>
                                </button>
                            </div>
                        </div>

                        <div class="um-modal-actions">
                            <button type="button" class="um-btn-cancel" id="um-modal-cancel">Batal</button>
                            <button type="submit" class="um-btn-submit">Simpan Perubahan</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById("um-modal-cancel").addEventListener("click", () => {
            modalContainer.innerHTML = "";
        });

        document.getElementById("um-btn-edit-gen-pwd").addEventListener("click", () => {
            const pwdInput = document.getElementById("um-edit-password");
            const newPwd = generateRandomPassword();
            pwdInput.value = newPwd;
            navigator.clipboard.writeText(newPwd).then(() => {
                showToast("Password baru dibuat & disalin ke clipboard!", "info");
            });
        });

        document.getElementById("um-edit-user-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("um-edit-username").value.trim();
            const email = document.getElementById("um-edit-email").value.trim();
            const role = document.getElementById("um-edit-role").value;
            const is_premium = document.getElementById("um-edit-premium").checked;
            const password = document.getElementById("um-edit-password").value.trim();

            try {
                const apiBase = window.location.origin.startsWith("http") ? "" : "http://localhost:8080";
                const res = await fetch(`${apiBase}/api/admin/users`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: user.id,
                        username,
                        email,
                        role,
                        is_premium,
                        password
                    })
                });

                if (res.ok) {
                    showToast("Data user berhasil diperbaharui", "success");
                    modalContainer.innerHTML = "";
                    fetchUsers();
                } else {
                    const err = await res.json();
                    showToast(err.error || "Gagal memperbarui pengguna", "error");
                }
            } catch {
                user.username = username;
                user.email = email;
                user.role = role;
                user.is_premium = is_premium;
                showToast("Data user berhasil diperbaharui", "success");
                modalContainer.innerHTML = "";
                renderTable();
            }
        });
    }

    // Modal Confirm Remove User
    function confirmRemoveUser(user) {
        if (user.is_premium) {
            showToast("user can't be deleted (User masih aktif berlangganan premium)", "error");
            return;
        }

        const modalContainer = document.getElementById("um-modal-container");
        modalContainer.innerHTML = `
            <div class="um-modal-overlay" id="um-modal-overlay">
                <div class="um-modal">
                    <h2>Hapus Pengguna?</h2>
                    <p class="um-modal-desc">
                        Apakah Anda yakin ingin menghapus akun <strong>${escapeHTML(user.username)}</strong> (${escapeHTML(user.email)})?
                        Tindakan ini tidak dapat dibatalkan.
                    </p>

                    <div class="um-modal-actions">
                        <button type="button" class="um-btn-cancel" id="um-modal-cancel">Batal</button>
                        <button type="button" class="um-btn-danger" id="um-btn-confirm-delete">Hapus User</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById("um-modal-cancel").addEventListener("click", () => {
            modalContainer.innerHTML = "";
        });

        document.getElementById("um-btn-confirm-delete").addEventListener("click", async () => {
            try {
                const apiBase = window.location.origin.startsWith("http") ? "" : "http://localhost:8080";
                const res = await fetch(`${apiBase}/api/admin/users?id=${user.id}`, {
                    method: "DELETE"
                });

                if (res.ok) {
                    showToast("User berhasil dihapus", "success");
                    modalContainer.innerHTML = "";
                    selectedUserIds.delete(user.id);
                    fetchUsers();
                } else {
                    const err = await res.json();
                    showToast(err.error || "Gagal menghapus user", "error");
                }
            } catch {
                allUsers = allUsers.filter(u => u.id !== user.id);
                selectedUserIds.delete(user.id);
                showToast("User berhasil dihapus", "success");
                modalContainer.innerHTML = "";
                renderTable();
            }
        });
    }

    // Export CSV (100% Client-Side)
    function exportToCSV() {
        const usersToExport = getFilteredAndSortedUsers();
        if (usersToExport.length === 0) {
            showToast("Tidak ada data user untuk diekspor", "error");
            return;
        }

        const headers = ["ID", "Username", "Email", "Role", "Status", "Is Premium", "Location", "Joined Date"];
        const rows = usersToExport.map(u => [
            u.id,
            `"${(u.username || "").replace(/"/g, '""')}"`,
            `"${(u.email || "").replace(/"/g, '""')}"`,
            u.role,
            u.status || "Active",
            u.is_premium ? "Ya" : "Tidak",
            `"${(u.location || "").replace(/"/g, '""')}"`,
            `"${(u.joined || "").replace(/"/g, '""')}"`
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `comicid_users_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast("Berhasil mengekspor data ke file CSV!", "success");
    }

    // Bulk Change Role
    function openBulkRoleModal() {
        const modalContainer = document.getElementById("um-modal-container");
        const count = selectedUserIds.size;

        modalContainer.innerHTML = `
            <div class="um-modal-overlay" id="um-modal-overlay">
                <div class="um-modal">
                    <h2>Ubah Role Massal</h2>
                    <p class="um-modal-desc">
                        Terapkan hak akses baru untuk <strong>${count}</strong> pengguna yang dipilih.
                    </p>

                    <div class="um-form-group">
                        <label for="um-bulk-role-select">Pilih Role Baru</label>
                        <select id="um-bulk-role-select" class="um-form-select">
                            <option value="Pembaca">Viewer (Pembaca)</option>
                            <option value="Kreator">Creator (Kreator)</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <div class="um-modal-actions">
                        <button type="button" class="um-btn-cancel" id="um-modal-cancel">Batal</button>
                        <button type="button" class="um-btn-submit" id="um-btn-confirm-bulk-role">Terapkan Perubahan</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById("um-modal-cancel").addEventListener("click", () => {
            modalContainer.innerHTML = "";
        });

        document.getElementById("um-btn-confirm-bulk-role").addEventListener("click", () => {
            const newRole = document.getElementById("um-bulk-role-select").value;
            allUsers.forEach(u => {
                if (selectedUserIds.has(u.id)) {
                    u.role = newRole;
                }
            });
            showToast(`Role ${count} pengguna berhasil diubah menjadi ${newRole}`, "success");
            selectedUserIds.clear();
            modalContainer.innerHTML = "";
            renderTable();
        });
    }

    // Bulk Delete
    function openBulkDeleteModal() {
        const count = selectedUserIds.size;
        const modalContainer = document.getElementById("um-modal-container");

        modalContainer.innerHTML = `
            <div class="um-modal-overlay" id="um-modal-overlay">
                <div class="um-modal">
                    <h2>Hapus ${count} Pengguna Terpilih?</h2>
                    <p class="um-modal-desc">
                        Sistem akan menghapus pengguna yang dipilih. Pengguna dengan status langganan premium aktif atau akun Anda sendiri akan dilewati demi keamanan.
                    </p>

                    <div class="um-modal-actions">
                        <button type="button" class="um-btn-cancel" id="um-modal-cancel">Batal</button>
                        <button type="button" class="um-btn-danger" id="um-btn-confirm-bulk-delete">Hapus Semua Terpilih</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById("um-modal-cancel").addEventListener("click", () => {
            modalContainer.innerHTML = "";
        });

        document.getElementById("um-btn-confirm-bulk-delete").addEventListener("click", () => {
            let deletedCount = 0;
            let skippedCount = 0;

            const idsToDelete = Array.from(selectedUserIds);
            idsToDelete.forEach(id => {
                const user = allUsers.find(u => u.id === id);
                if (user) {
                    if (isSelf(user) || user.is_premium) {
                        skippedCount++;
                    } else {
                        allUsers = allUsers.filter(u => u.id !== id);
                        deletedCount++;
                    }
                }
            });

            selectedUserIds.clear();
            modalContainer.innerHTML = "";

            if (deletedCount > 0) {
                showToast(`${deletedCount} pengguna berhasil dihapus. ${skippedCount > 0 ? `(${skippedCount} dilewati karena premium/akun sendiri)` : ""}`, "success");
            } else {
                showToast(`Tidak ada pengguna yang dihapus (${skippedCount} dilewati karena premium/akun sendiri)`, "error");
            }

            renderTable();
        });
    }

    // Hook Toolbar Controls
    const searchInput = document.getElementById("um-search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.trim();
            currentPage = 1;
            renderTable();
        });
    }

    const filterPerm = document.getElementById("um-filter-permission");
    if (filterPerm) {
        filterPerm.addEventListener("change", (e) => {
            permissionFilter = e.target.value;
            currentPage = 1;
            renderTable();
        });
    }

    const filterJoined = document.getElementById("um-filter-joined");
    if (filterJoined) {
        filterJoined.addEventListener("change", (e) => {
            joinedFilter = e.target.value;
            currentPage = 1;
            renderTable();
        });
    }

    const selectRows = document.getElementById("um-select-rows");
    if (selectRows) {
        selectRows.addEventListener("change", (e) => {
            rowsPerPage = Number(e.target.value);
            currentPage = 1;
            renderTable();
        });
    }

    const btnAddUser = document.getElementById("um-btn-add-user");
    if (btnAddUser) {
        btnAddUser.addEventListener("click", openAddModal);
    }

    // More options menu (Export CSV, Refresh)
    const btnMore = document.getElementById("um-btn-more-options");
    const moreMenu = document.getElementById("um-more-menu");
    if (btnMore && moreMenu) {
        btnMore.addEventListener("click", (e) => {
            e.stopPropagation();
            moreMenu.classList.toggle("active");
        });

        document.getElementById("um-btn-export-csv").addEventListener("click", () => {
            moreMenu.classList.remove("active");
            exportToCSV();
        });

        document.getElementById("um-btn-refresh-data").addEventListener("click", () => {
            moreMenu.classList.remove("active");
            showToast("Memuat ulang data pengguna...", "info");
            fetchUsers();
        });
    }

    // Sort column headers
    document.querySelectorAll(".um-table th.sortable").forEach(th => {
        th.addEventListener("click", () => {
            const col = th.dataset.sort;
            if (sortColumn === col) {
                sortDirection = sortDirection === "asc" ? "desc" : "asc";
            } else {
                sortColumn = col;
                sortDirection = "asc";
            }
            renderTable();
        });
    });

    // Check all visible page checkboxes
    const checkAll = document.getElementById("um-check-all");
    if (checkAll) {
        checkAll.addEventListener("change", (e) => {
            const rowChecks = document.querySelectorAll(".um-row-check");
            rowChecks.forEach(chk => {
                chk.checked = e.target.checked;
                const userId = Number(chk.dataset.userId);
                if (e.target.checked) {
                    selectedUserIds.add(userId);
                } else {
                    selectedUserIds.delete(userId);
                }
            });
            updateBulkBar();
        });
    }

    // Bulk Bar Action Buttons
    const btnBulkRole = document.getElementById("um-bulk-change-role");
    if (btnBulkRole) {
        btnBulkRole.addEventListener("click", openBulkRoleModal);
    }

    const btnBulkDelete = document.getElementById("um-bulk-delete");
    if (btnBulkDelete) {
        btnBulkDelete.addEventListener("click", openBulkDeleteModal);
    }

    const btnBulkCancel = document.getElementById("um-bulk-cancel");
    if (btnBulkCancel) {
        btnBulkCancel.addEventListener("click", () => {
            selectedUserIds.clear();
            updateBulkBar();
            renderTable();
        });
    }

    // Close action menus on outside click
    document.addEventListener("click", () => {
        document.querySelectorAll(".um-action-menu").forEach(m => m.classList.remove("active"));
        if (moreMenu) moreMenu.classList.remove("active");
    });

    // Initial fetch
    fetchUsers();
}
