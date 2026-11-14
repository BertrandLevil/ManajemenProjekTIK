import { comics } from "./data.js";

export function frontManajemenDataKomik() {
    const app = document.getElementById("app");

    if (!app) return;

    const isLoggedIn =
        localStorage.getItem("comicid_logged_in") === "true";

    const role = localStorage.getItem("comicid_logged_in_role");

    if (!isLoggedIn || role !== "Kreator") {
        app.innerHTML = `
            <main class="management-page">
                <section class="management-access-denied">
                    <h1>Akses Ditolak</h1>
                    <p>Halaman ini hanya dapat diakses oleh kreator.</p>
                    <a href="home.html">Kembali ke Beranda</a>
                </section>
            </main>
        `;
        return;
    }

    const creatorId = Number(
        localStorage.getItem("comicid_user_id")
    );

    if (!Number.isFinite(creatorId) || creatorId <= 0) {
        app.innerHTML = `
            <main class="management-page">
                <section class="management-access-denied">
                    <h1>ID Kreator Tidak Ditemukan</h1>
                    <p>Silakan login kembali.</p>
                    <a href="login.html">Login</a>
                </section>
            </main>
        `;
        return;
    }

    const STORAGE_KEY = "comicid_creator_comics";
    const CHAPTER_STORAGE_KEY = "comicid_creator_chapters";
    const DB_NAME = "ComicIDDB";
    const DB_VERSION = 1;
    const STORE_NAME = "chapter_pages";

    function openChapterDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = event => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, {
                        keyPath: "id"
                    });
                }
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    function saveChapterImages(images) {
        return new Promise(async (resolve, reject) => {
            let db;

            try {
                db = await openChapterDB();

                const transaction = db.transaction(
                    STORE_NAME,
                    "readwrite"
                );

                const store = transaction.objectStore(STORE_NAME);

                images.forEach(image => {
                    store.put(image);
                });

                transaction.oncomplete = () => {
                    db.close();
                    resolve();
                };

                transaction.onerror = () => {
                    db.close();
                    reject(transaction.error);
                };

                transaction.onabort = () => {
                    db.close();
                    reject(transaction.error);
                };

            } catch (error) {
                if (db) db.close();
                reject(error);
            }
        });
    }

    function deleteChapterImages(imageIds) {
        return new Promise(async (resolve, reject) => {
            let db;

            try {
                db = await openChapterDB();

                const transaction = db.transaction(
                    STORE_NAME,
                    "readwrite"
                );

                const store = transaction.objectStore(STORE_NAME);

                imageIds.forEach(id => {
                    store.delete(id);
                });

                transaction.oncomplete = () => {
                    db.close();
                    resolve();
                };

                transaction.onerror = () => {
                    db.close();
                    reject(transaction.error);
                };

                transaction.onabort = () => {
                    db.close();
                    reject(transaction.error);
                };

            } catch (error) {
                if (db) db.close();
                reject(error);
            }
        });
    }

    let allChapters = [];

    try {
        allChapters = JSON.parse(
            localStorage.getItem(CHAPTER_STORAGE_KEY) || "[]"
        );
    } catch (error) {
        console.error("Gagal membaca data chapter:", error);
    }

    function saveChapters() {
        try {
        const chapterData = JSON.stringify(allChapters);

        localStorage.setItem(
            CHAPTER_STORAGE_KEY,
            chapterData
        );
            return true;
        } catch (error) {
            console.error("Nama error:", error.name);
            console.error("Pesan error:", error.message);
            console.error("Detail error:", error);

            alert(
                `Gagal menyimpan chapter!\n\n` +
                `Jenis error: ${error.name}\n` +
                `Pesan: ${error.message}`
            );

            return false;
        }
    }

    async function migrateLegacyChapterImages() {
        const legacyImages = [];

        allChapters.forEach(chapter => {
            chapter.pages.forEach((page, index) => {
                if (page.dataUrl && !page.imageId) {
                    const imageId =
                        `legacy_${chapter.id}_${index + 1}`;

                    legacyImages.push({
                        chapter: chapter,
                        page: page,
                        originalDataUrl: page.dataUrl,
                        image: {
                            id: imageId,
                            name: page.name,
                            blob: null
                        }
                    });
                }
            });
        });

        if (legacyImages.length === 0) {
            return true;
        }

        try {
            for (const item of legacyImages) {
                const response = await fetch(item.page.dataUrl);

                item.image.blob = await response.blob();
            }

            await saveChapterImages(
                legacyImages.map(item => item.image)
            );

            legacyImages.forEach(item => {
                delete item.page.dataUrl;
                item.page.imageId = item.image.id;
            });

            if (!saveChapters()) {
                throw new Error("Metadata chapter gagal diperbarui.");
            }

            console.log("Migrasi gambar chapter lama berhasil.");
            return true;

        } catch (error) {
            console.error("Migrasi gambar chapter gagal:", error);

            for (const item of legacyImages) {
                delete item.page.imageId;
                item.page.dataUrl = await new Promise(resolve => {
                    resolve(item.originalDataUrl);
                });
            }

            await deleteChapterImages(
                legacyImages.map(item => item.image.id)
            ).catch(console.error);

            alert("Gagal memindahkan gambar chapter lama ke IndexedDB.");
            return false;
        }
    }

    let savedComics = [];

    try {
        savedComics = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
        );
    } catch (error) {
        console.error("Gagal membaca data komik:", error);
    }

    const savedMap = new Map(
        savedComics.map(comic => [Number(comic.id), comic])
    );

    const allComics = comics.map(comic => {
        return savedMap.get(Number(comic.id)) || { ...comic };
    });

    savedComics.forEach(savedComic => {
        const alreadyExists = allComics.some(
            comic => Number(comic.id) === Number(savedComic.id)
        );

        if (!alreadyExists) {
            allComics.push(savedComic);
        }
    });

    let myComics = allComics.filter(
        comic => Number(comic.creatorId) === creatorId
    );

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function saveComics() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(myComics)
            );

            return true;
        } catch (error) {
            console.error("Gagal menyimpan komik:", error);
            alert("Penyimpanan gagal. Kapasitas penyimpanan browser mungkin tidak mencukupi.");
            return false;
        }
    }

    app.innerHTML = `
        <main class="management-page">

            <section class="management-header">
                <div>
                    <p class="management-eyebrow">AREA KREATOR</p>
                    <h1>Manajemen Data Komik</h1>
                    <p>
                        Kelola komik dan chapter yang kamu publikasikan
                        di ComicID.
                    </p>
                </div>

                <div class="management-header-actions">
                
                    <a
                        href="home.html"
                        class="management-back-button"
                    >
                        ← Kembali ke Home
                    </a>
                
                    <button
                        type="button"
                        id="theme-toggle"
                        class="theme-toggle"
                        aria-label="Ganti tema"
                    >
                        <span class="theme-icon">☾</span>
                    </button>
                
                    <button
                        type="button"
                        class="management-add-button"
                        id="add-comic-button"
                    >
                        <span>+</span>
                        Tambah Komik
                    </button>
                
                </div>
            </section>

            <section class="management-statistics">
                <div class="management-stat-card">
                    <span>Total Komik</span>
                    <strong id="total-comics">${myComics.length}</strong>
                </div>
            </section>

            <section class="management-content">

                <div class="management-content-header">
                    <div>
                        <h2>Komik Saya</h2>
                        <p>Daftar komik yang kamu miliki.</p>
                    </div>

                    <span
                        class="management-comic-count"
                        id="comic-count"
                    >
                        ${myComics.length} Komik
                    </span>
                </div>

                <div class="management-toolbar">
                    <input
                        type="search"
                        id="comic-search"
                        placeholder="Cari judul komik..."
                        aria-label="Cari komik"
                    >

                    <select
                        id="comic-status-filter"
                        aria-label="Filter status komik"
                    >
                        <option value="all">Semua Status</option>
                        <option value="new">New</option>
                        <option value="on-going">On-going</option>
                        <option value="end">End</option>
                        <option value="hiatus">Hiatus</option>
                    </select>
                </div>

                <div
                    class="management-comic-grid"
                    id="management-comic-grid"
                ></div>

            </section>

            <!-- Modal Form Komik -->
            <div
                class="comic-form-overlay"
                id="comic-form-overlay"
                hidden
            >
                <section
                    class="comic-form-modal"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="comic-form-title"
                >
                    <div class="comic-form-header">
                        <div>
                            <p class="management-eyebrow">AREA KREATOR</p>
                            <h2 id="comic-form-title">Tambah Komik</h2>
                        </div>

                        <button
                            type="button"
                            id="close-comic-form"
                            class="comic-form-close"
                            aria-label="Tutup form"
                        >
                            &times;
                        </button>
                    </div>

                    <form id="comic-form">

                        <div class="comic-form-body">

                            <div class="comic-form-group">
                                <label for="comic-title">
                                    Judul Komik
                                </label>
                                <input
                                    type="text"
                                    id="comic-title"
                                    name="title"
                                    placeholder="Masukkan judul komik"
                                    required
                                >
                            </div>

                            <div class="comic-form-row">
                                <div class="comic-form-group">
                                    <label for="comic-author">
                                        Penulis
                                    </label>
                                    <input
                                        type="text"
                                        id="comic-author"
                                        name="author"
                                        placeholder="Nama penulis"
                                        required
                                    >
                                </div>

                                <div class="comic-form-group">
                                    <label for="comic-studio">
                                        Studio
                                    </label>
                                    <input
                                        type="text"
                                        id="comic-studio"
                                        name="studio"
                                        placeholder="Pisahkan dengan koma"
                                        required
                                    >
                                </div>
                            </div>

                            <div class="comic-form-row">
                                <div class="comic-form-group">
                                    <label for="comic-category">
                                        Kategori
                                    </label>
                                    <input
                                        type="text"
                                        id="comic-category"
                                        name="category"
                                        placeholder="Contoh: Comic"
                                        required
                                    >
                                </div>

                                <div class="comic-form-group">
                                    <label for="comic-status">
                                        Status
                                    </label>
                                    <select
                                        id="comic-status"
                                        name="status"
                                        required
                                    >
                                        <option value="New">New</option>
                                        <option value="On-going">On-going</option>
                                        <option value="End">End</option>
                                        <option value="Hiatus">Hiatus</option>
                                    </select>
                                </div>
                            </div>

                            <div class="comic-form-group">
                                <label for="comic-genre">
                                    Genre
                                </label>
                                <input
                                    type="text"
                                    id="comic-genre"
                                    name="genre"
                                    placeholder="Action, Adventure, Fantasy"
                                    required
                                >
                                <small>Pisahkan setiap genre dengan koma.</small>
                            </div>

                            <div class="comic-form-group">
                                <label for="comic-description">
                                    Deskripsi
                                </label>
                                <textarea
                                    id="comic-description"
                                    name="description"
                                    rows="5"
                                    placeholder="Tuliskan deskripsi komik..."
                                    required
                                ></textarea>
                            </div>

                            <div class="comic-form-row">
                                <div class="comic-form-group">
                                    <label for="comic-color">
                                        Warna Identitas
                                    </label>
                                    <input
                                        type="color"
                                        id="comic-color"
                                        name="color"
                                        value="#8b5cf6"
                                    >
                                </div>

                                <div class="comic-form-group">
                                    <label for="comic-cover">
                                        Cover Komik
                                    </label>
                                    <input
                                        type="file"
                                        id="comic-cover"
                                        name="cover"
                                        accept="image/png,image/jpeg,image/webp,image/avif"
                                    >
                                </div>
                            </div>

                            <div class="comic-cover-preview">
                                <img
                                    id="comic-cover-preview"
                                    alt="Preview cover komik"
                                    hidden
                                >
                                <p id="comic-cover-placeholder">
                                    Preview cover akan ditampilkan di sini.
                                </p>
                            </div>

                        </div>

                        <div class="comic-form-footer">
                            <button
                                type="button"
                                id="cancel-comic-form"
                                class="comic-cancel-button"
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                class="management-add-button"
                            >
                                Simpan Komik
                            </button>
                        </div>

                    </form>
                </section>
            </div>

            <div
                class="chapter-manager-overlay"
                id="chapter-manager-overlay"
                hidden
            >
                <section class="chapter-manager-modal">

                    <div class="chapter-manager-header">
                        <div>
                            <p class="management-eyebrow">AREA KREATOR</p>
                            <h2 id="chapter-manager-title">Manajemen Chapter</h2>
                        </div>

                        <button
                            type="button"
                            id="close-chapter-manager"
                            class="comic-form-close"
                        >
                            &times;
                        </button>
                    </div>

                    <div class="chapter-manager-body">

                        <section class="chapter-list-section">
                            <h3>Daftar Chapter</h3>
                            <div id="chapter-list"></div>
                        </section>

                        <div class="chapter-form-divider"></div>

                        <form id="chapter-form">

                            <h3 id="chapter-form-title">Tambah Chapter</h3>

                            <div class="comic-form-group">
                                <label for="chapter-number">Nomor Chapter</label>
                                <input
                                    type="text"
                                    id="chapter-number"
                                    readonly
                                    value="Chapter 1"
                                >
                            </div>

                            <div class="comic-form-group">
                                <label for="chapter-pages">
                                    Halaman Komik
                                </label>

                                <input
                                    type="file"
                                    id="chapter-pages"
                                    accept="image/png,image/jpeg,image/webp,image/avif"
                                    multiple
                                    required
                                >

                                <small>
                                    Pilih beberapa gambar sekaligus.
                                    Urutan awal mengikuti urutan file yang dipilih.
                                </small>
                            </div>

                            <div id="chapter-page-preview"></div>

                            <div class="comic-form-footer">
                                <button
                                    type="button"
                                    id="cancel-chapter-form"
                                    class="comic-cancel-button"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    class="management-add-button"
                                >
                                    Simpan Chapter
                                </button>
                            </div>

                        </form>

                    </div>
                </section>
            </div>

        </main>
    `;

    const comicGrid = document.getElementById(
        "management-comic-grid"
    );

    const searchInput = document.getElementById("comic-search");
    const statusFilter = document.getElementById("comic-status-filter");

    const formOverlay = document.getElementById("comic-form-overlay");
    const comicForm = document.getElementById("comic-form");

    const coverInput = document.getElementById("comic-cover");
    const coverPreview = document.getElementById("comic-cover-preview");
    const coverPlaceholder = document.getElementById("comic-cover-placeholder");
    const chapterOverlay = document.getElementById("chapter-manager-overlay");
    const chapterList = document.getElementById("chapter-list");
    const chapterForm = document.getElementById("chapter-form");
    const chapterNumberInput = document.getElementById("chapter-number");
    const chapterPagesInput = document.getElementById("chapter-pages");
    const chapterPagePreview = document.getElementById("chapter-page-preview");

    let selectedComicId = null;
    let pendingPages = [];
    let editingComicId = null;
    let selectedCover = "";

    function parseList(value) {
        return String(value || "")
            .split(",")
            .map(item => item.trim())
            .filter(item => item !== "");
    }

    function renderComics(comicList) {
        document.getElementById("total-comics").textContent =
            myComics.length;

        document.getElementById("comic-count").textContent =
            `${comicList.length} Komik`;

        if (comicList.length === 0) {
            comicGrid.innerHTML = `
                <div class="management-empty">
                    <div class="management-empty-icon">📚</div>
                    <h3>Belum ada komik</h3>
                    <p>
                        Komik yang kamu buat akan ditampilkan
                        di halaman ini.
                    </p>
                </div>
            `;
            return;
        }

        comicGrid.innerHTML = comicList.map(comic => {
            const genres = Array.isArray(comic.genre)
                ? comic.genre.join(", ")
                : comic.genre || "-";

            return `
                <article class="management-comic-card">

                    <div class="management-comic-cover">
                        <img
                            src="${escapeHTML(comic.cover)}"
                            alt="Cover ${escapeHTML(comic.title)}"
                            onerror="this.style.display='none'"
                        >
                    </div>

                    <div class="management-comic-info">

                        <div class="management-comic-heading">
                            <span class="management-category">
                                ${escapeHTML(comic.category)}
                            </span>

                            <span class="management-status">
                                ${escapeHTML(comic.status)}
                            </span>
                        </div>

                        <h3>${escapeHTML(comic.title)}</h3>

                        <p class="management-comic-author">
                            ${escapeHTML(comic.author)}
                        </p>

                        <p class="management-comic-genre">
                            ${escapeHTML(genres)}
                        </p>

                        <div class="management-comic-meta">
                            <span>
                                ${Number(comic.chapter) || 0} Chapter
                            </span>

                            <span>
                                Rating ${escapeHTML(comic.rating ?? 0)}
                            </span>
                        </div>

                        <div class="management-comic-actions">
                            <button
                                type="button"
                                class="management-edit-button"
                                data-action="edit"
                                data-comic-id="${escapeHTML(comic.id)}"
                            >
                                Edit Komik
                            </button>

                            <button
                                type="button"
                                class="management-chapter-button"
                                data-action="chapter"
                                data-comic-id="${escapeHTML(comic.id)}"
                            >
                                Kelola Chapter
                            </button>
                        </div>

                    </div>
                </article>
            `;
        }).join("");
    }

    function filterComics() {
        const keyword = searchInput.value.toLowerCase().trim();
        const selectedStatus = statusFilter.value;

        const filteredComics = myComics.filter(comic => {
            const title = String(comic.title || "").toLowerCase();

            const status = String(comic.status || "")
                .toLowerCase()
                .replaceAll(" ", "-");

            const matchesSearch = title.includes(keyword);

            const matchesStatus =
                selectedStatus === "all" ||
                status === selectedStatus;

            return matchesSearch && matchesStatus;
        });

        renderComics(filteredComics);
    }

    function openAddForm() {
        editingComicId = null;
        selectedCover = "";

        comicForm.reset();

        document.getElementById("comic-form-title").textContent =
            "Tambah Komik";

        document.getElementById("comic-color").value = "#8b5cf6";

        coverPreview.src = "";
        coverPreview.hidden = true;
        coverPlaceholder.hidden = false;

        formOverlay.hidden = false;
    }

    function openEditForm(comicId) {
        const comic = myComics.find(
            item => Number(item.id) === Number(comicId)
        );

        if (!comic) return;

        editingComicId = Number(comic.id);
        selectedCover = comic.cover || "";

        document.getElementById("comic-form-title").textContent =
            "Edit Komik";

        document.getElementById("comic-title").value =
            comic.title || "";

        document.getElementById("comic-author").value =
            comic.author || "";

        document.getElementById("comic-studio").value =
            Array.isArray(comic.studio)
                ? comic.studio.join(", ")
                : comic.studio || "";

        document.getElementById("comic-category").value =
            comic.category || "";

        document.getElementById("comic-status").value =
            comic.status || "New";

        document.getElementById("comic-genre").value =
            Array.isArray(comic.genre)
                ? comic.genre.join(", ")
                : comic.genre || "";

        document.getElementById("comic-description").value =
            comic.description || "";

        document.getElementById("comic-color").value =
            comic.color || "#8b5cf6";

        if (selectedCover) {
            coverPreview.src = selectedCover;
            coverPreview.hidden = false;
            coverPlaceholder.hidden = true;
        } else {
            coverPreview.hidden = true;
            coverPlaceholder.hidden = false;
        }

        coverInput.value = "";
        formOverlay.hidden = false;
    }

    function closeForm() {
        formOverlay.hidden = true;
        comicForm.reset();

        editingComicId = null;
        selectedCover = "";

        coverPreview.src = "";
        coverPreview.hidden = true;
        coverPlaceholder.hidden = false;
    }

    function fileToDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);

            reader.readAsDataURL(file);
        });
    }

    function openChapterManager(comicId) {
        const comic = myComics.find(item => Number(item.id) === Number(comicId));

        if (!comic) return;

        selectedComicId = Number(comic.id);

        document.getElementById("chapter-manager-title").textContent = `Chapter - ${comic.title}`;

        chapterOverlay.hidden = false;

        resetChapterForm();
        renderChapterList();
    }

    function renderChapterList() {
        const chapters = allChapters
            .filter(chapter =>
                Number(chapter.comicId) === selectedComicId &&
                Number(chapter.creatorId) === creatorId
            )
            .sort((a, b) => Number(a.number) - Number(b.number));

        if (chapters.length === 0) {
            chapterList.innerHTML = `
                <div class="chapter-empty">
                    <p>Belum ada chapter.</p>
                </div>
            `;
            return;
        }

        chapterList.innerHTML = chapters.map(chapter => `
            <article class="chapter-list-item">
                <div>
                    <strong>Chapter ${escapeHTML(chapter.number)}</strong>
                    <span>${chapter.pages.length} Halaman</span>
                </div>
            </article>
        `).join("");
    }

    function resetChapterForm() {
        chapterForm.reset();

        pendingPages.forEach(page => {
            URL.revokeObjectURL(page.previewUrl);
        });

        pendingPages = [];

        chapterPagesInput.value = "";
        chapterPagePreview.innerHTML = "";

        document.getElementById("chapter-form-title").textContent =
            "Tambah Chapter";

        const existingChapters = allChapters.filter(chapter =>
            Number(chapter.comicId) === selectedComicId &&
            Number(chapter.creatorId) === creatorId
        );
        const nextChapterNumber = existingChapters.length + 1;
        chapterNumberInput.value = `Chapter ${nextChapterNumber}`;
    }

    function closeChapterManager() {
        chapterOverlay.hidden = true;
        selectedComicId = null;
        resetChapterForm();
    }

    function renderPagePreview() {
        if (pendingPages.length === 0) {
            chapterPagePreview.innerHTML = "";
            return;
        }

        chapterPagePreview.innerHTML = pendingPages.map((page, index) => `
            <div class="chapter-page-item">

                <img
                    src="${page.previewUrl}"
                    alt="Halaman ${index + 1}"
                >

                <div class="chapter-page-info">
                    <strong>Halaman ${index + 1}</strong>
                    <span>${escapeHTML(page.name)}</span>
                </div>

                <div class="chapter-page-actions">
                    <button
                        type="button"
                        data-page-action="up"
                        data-index="${index}"
                        ${index === 0 ? "disabled" : ""}
                    >
                        ↑
                    </button>

                    <button
                        type="button"
                        data-page-action="down"
                        data-index="${index}"
                        ${index === pendingPages.length - 1 ? "disabled" : ""}
                    >
                        ↓
                    </button>

                    <button
                        type="button"
                        data-page-action="remove"
                        data-index="${index}"
                    >
                        Hapus
                    </button>
                </div>

            </div>
        `).join("");
    }

    chapterPagesInput.addEventListener("change", () => {
        const files = Array.from(chapterPagesInput.files);

        if (files.length === 0) return;

        const invalidFile = files.find(
            file => !file.type.startsWith("image/")
        );

        if (invalidFile) {
            alert("Semua file harus berupa gambar.");
            chapterPagesInput.value = "";
            return;
        }

        pendingPages.forEach(page => {
            URL.revokeObjectURL(page.previewUrl);
        });

        pendingPages = files.map(file => ({
            name: file.name,
            file: file,
            previewUrl: URL.createObjectURL(file)
        }));

        renderPagePreview();
    });

    chapterForm.addEventListener("submit", async event => {
        event.preventDefault();

        if (selectedComicId === null) return;

        if (pendingPages.length === 0) {
            alert("Pilih minimal satu gambar halaman.");
            return;
        }

        try {
            const migrationSuccess = await migrateLegacyChapterImages();

            if (!migrationSuccess) return;

            const existingChapters = allChapters.filter(chapter =>
                Number(chapter.comicId) === selectedComicId &&
                Number(chapter.creatorId) === creatorId
            );

            const chapterNumber = existingChapters.length + 1;

            if (!Number.isInteger(chapterNumber) || chapterNumber < 1) {
                alert("Nomor chapter harus berupa bilangan bulat positif.");
                return;
            }

            const duplicate = allChapters.some(chapter =>
                Number(chapter.comicId) === selectedComicId &&
                Number(chapter.creatorId) === creatorId &&
                Number(chapter.number) === chapterNumber
            );

            if (duplicate) {
                alert("Nomor chapter tersebut sudah digunakan.");
                return;
            }

            const chapterId = Math.max(
                0,
                ...allChapters.map(chapter => Number(chapter.id) || 0)
            ) + 1;

            const imagesToSave = pendingPages.map((page, index) => ({
                id: `${creatorId}_${selectedComicId}_${chapterId}_${index + 1}`,
                name: page.name,
                blob: page.file
            }));

            await saveChapterImages(imagesToSave);

            const newChapter = {
                id: chapterId,
                comicId: selectedComicId,
                creatorId: creatorId,
                number: chapterNumber,

                pages: imagesToSave.map((image, index) => ({
                    pageNumber: index + 1,
                    name: image.name,
                    imageId: image.id
                })),

                createdAt: new Date().toISOString()
            };

            allChapters.push(newChapter);

            if (!saveChapters()) {
                allChapters.pop();

                await deleteChapterImages(
                    imagesToSave.map(image => image.id)
                );

                return;
            }

            const comic = myComics.find(
                item => Number(item.id) === selectedComicId
            );

            if (comic) {
                comic.chapter = allChapters.filter(chapter =>
                    Number(chapter.comicId) === selectedComicId &&
                    Number(chapter.creatorId) === creatorId
                ).length;

                saveComics();
            }

            resetChapterForm();
            renderChapterList();
            renderComics(myComics);

            alert("Chapter berhasil ditambahkan.");

        } catch (error) {
            console.error("Gagal menyimpan chapter:", error);

            alert(
                "Gagal menyimpan chapter ke IndexedDB.\n\n" +
                "Jenis error: " + error.name + "\n" +
                "Pesan: " + error.message
            );
        }
    });

    document.getElementById("close-chapter-manager")
        .addEventListener("click", closeChapterManager);

    document.getElementById("cancel-chapter-form")
        .addEventListener("click", resetChapterForm);

    chapterOverlay.addEventListener("click", event => {
        if (event.target === chapterOverlay) {
            closeChapterManager();
        }
    });

    coverInput.addEventListener("change", async () => {
        const file = coverInput.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("File harus berupa gambar.");
            coverInput.value = "";
            return;
        }

        try {
            selectedCover = await fileToDataURL(file);

            coverPreview.src = selectedCover;
            coverPreview.hidden = false;
            coverPlaceholder.hidden = true;
        } catch (error) {
            console.error("Gagal membaca gambar:", error);
            alert("Gambar gagal dibaca.");
        }
    });

    comicForm.addEventListener("submit", event => {
        event.preventDefault();

        const title = document.getElementById("comic-title").value.trim();
        const author = document.getElementById("comic-author").value.trim();
        const studio = document.getElementById("comic-studio").value;
        const category = document.getElementById("comic-category").value.trim();
        const status = document.getElementById("comic-status").value;
        const genre = document.getElementById("comic-genre").value;
        const description = document.getElementById("comic-description").value.trim();
        const color = document.getElementById("comic-color").value;

        if (!title || !author || !category || !description) {
            alert("Mohon lengkapi semua field yang wajib diisi.");
            return;
        }

        const existingComic = editingComicId !== null
            ? myComics.find(
                comic => Number(comic.id) === editingComicId
            )
            : null;

        const comicData = {
            ...(existingComic || {}),

            id: editingComicId !== null
                ? editingComicId
                : Math.max(0, ...allComics.map(comic => Number(comic.id) || 0)) + 1,

            creatorId: creatorId,
            title: title,
            author: author,
            studio: parseList(studio),
            category: category,
            status: status,
            genre: parseList(genre),
            description: description,
            color: color,
            cover: selectedCover,

            chapter: existingComic?.chapter || 0,
            rating: existingComic?.rating || 0
        };

        if (editingComicId !== null) {
            const index = myComics.findIndex(
                comic => Number(comic.id) === editingComicId
            );

            if (index === -1) return;

            myComics[index] = comicData;
        } else {
            myComics.push(comicData);
        }

        if (!saveComics()) return;

        closeForm();
        filterComics();

        alert(
            editingComicId === null
                ? "Komik berhasil ditambahkan."
                : "Data komik berhasil diperbarui."
        );
    });

    document.getElementById("add-comic-button")
        .addEventListener("click", openAddForm);

    document.getElementById("close-comic-form")
        .addEventListener("click", closeForm);

    document.getElementById("cancel-comic-form")
        .addEventListener("click", closeForm);

    formOverlay.addEventListener("click", event => {
        if (event.target === formOverlay) {
            closeForm();
        }
    });

    comicGrid.addEventListener("click", event => {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const comicId = Number(button.dataset.comicId);

        if (button.dataset.action === "edit") {
            openEditForm(comicId);
        }

        if (button.dataset.action === "chapter") {
            openChapterManager(comicId);
        }
    });

    searchInput.addEventListener("input", filterComics);
    statusFilter.addEventListener("change", filterComics);

    renderComics(myComics);
}