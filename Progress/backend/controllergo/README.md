# ComicID Backend (Golang)

Implementasi backend ComicID menggunakan bahasa pemrograman **Go (Golang)** yang menyediakan endpoint REST API untuk seluruh fitur aplikasi dan terhubung ke database MySQL `comicid`.

## Arsitektur Berkas
- **`database.go`**: Manajemen koneksi MySQL/MariaDB (Laragon) dengan database `comicid`.
- **`models.go` & `extra_models.go`**: Struktur entitas `User`, `Admin`, `Author`, `Pembaca`, `Komik`, `Bab`, `Kategori`, `Review`, `Bookmark`, `Histori`, dan `Transaksi`.
- **`controller.go` & `feature_controllers.go`**: Logika bisnis dan query MySQL untuk semua modul (Autentikasi, Komik, Bab, Kategori, Ulasan, Bookmark & Histori, Pembayaran, Profil & Admin User Management).
- **`handlers.go` & `feature_handlers.go`**: HTTP Handlers untuk seluruh endpoint REST API dan serving static web files.
- **`main.go`**: Entry point server backend di port 8080.
- **`run-backend.bat`**: Script runner backend.

## Endpoint API yang Disediakan
- **Autentikasi & Health**:
  - `POST /api/login`: Login akun pengguna (mengembalikan data role, email, username, dan id pengguna).
  - `POST /api/register`: Pendaftaran pengguna baru.
  - `GET /api/health`: Status backend dan konektivitas database MySQL.
- **Pengguna & Profil**:
  - `GET /api/user/profile`: Mengambil profil user berdasarkan email/id.
  - `PUT /api/user/profile`: Memperbarui data pengguna.
  - `GET /api/admin/users`: Daftar seluruh pengguna (Admin User Management).
  - `POST /api/admin/users`: Tambah akun pengguna baru oleh Admin.
  - `PUT /api/admin/users`: Update role / status premium akun oleh Admin.
  - `DELETE /api/admin/users`: Hapus akun oleh Admin.
- **Komik**:
  - `GET /api/comics`: List komik dengan fitur filter kategori, search query, dan sorting.
  - `GET /api/comics/detail`: Detail lengkap komik beserta bab dan kategorinya.
  - `POST /api/comics`: Tambah komik baru oleh Kreator/Author.
  - `PUT /api/comics/detail`: Update metadata komik.
  - `DELETE /api/comics/detail`: Hapus komik.
  - `POST /api/comics/verify`: Admin memverifikasi kelayakan komik.
  - `GET /api/comics/stats`: Statistik komik atau kreator.
- **Bab / Chapter**:
  - `GET /api/chapters`: Daftar bab per komik.
  - `GET /api/chapters/detail`: Detail dan konten bab komik.
  - `POST /api/chapters`: Tambah chapter baru.
  - `PUT /api/chapters/detail`: Update data bab.
  - `DELETE /api/chapters/detail`: Hapus bab.
- **Kategori**:
  - `GET /api/categories`: Daftar semua kategori.
  - `GET /api/categories/detail`: Detail satu kategori.
  - `POST /api/categories`: Tambah kategori baru.
  - `PUT /api/categories/detail`: Ubah nama kategori.
  - `DELETE /api/categories/detail`: Hapus kategori.
- **Ulasan & Rating**:
  - `GET /api/reviews`: Ulasan dan rating per komik.
  - `POST /api/reviews`: Kirim komentar dan rating (otomatis update rata-rata rating komik di database).
  - `DELETE /api/reviews/detail`: Hapus ulasan.
  - `GET /api/author/reviews`: Feedback pembaca untuk seluruh karya Author.
- **Bookmark & Histori**:
  - `GET /api/bookmarks`: Daftar bookmark pengguna.
  - `POST /api/bookmarks`: Tambah komik ke bookmark.
  - `DELETE /api/bookmarks`: Hapus dari bookmark.
  - `GET /api/history`: Riwayat membaca komik.
  - `POST /api/history`: Rekam bab yang sedang dibaca.
  - `DELETE /api/history`: Hapus riwayat baca.
- **Pembayaran & Premium**:
  - `POST /api/payment/checkout`: Checkout upgrade premium.
  - `POST /api/payment/process`: Konfirmasi pembayaran & upgrade akun ke `is_premium = 1`.
  - `GET /api/payment/history`: Riwayat transaksi user.
  - `GET /api/admin/transactions`: Admin kelola dan verifikasi semua transaksi.
- **Static Web**:
  - `GET /`: Melayani aplikasi frontend (akses via `http://localhost:8080/`).

## Cara Menjalankan
1. Pastikan **Laragon** (atau MySQL server) sudah dijalankan (*Start All*).
2. Jalankan berkas `run-backend.bat` di dalam folder ini, atau jalankan perintah:
   ```bash
   go run .
   ```
3. Buka browser pada `http://localhost:8080/`.
