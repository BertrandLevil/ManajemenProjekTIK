# ComicID Backend (Golang)

Implementasi backend ComicID menggunakan bahasa pemrograman **Go (Golang)** yang menyediakan endpoint REST API untuk seluruh fitur aplikasi dan terhubung ke database MySQL `comicid`.

## Arsitektur Berkas
- **`database.go`**: Manajemen koneksi MySQL/MariaDB (Laragon) dengan database `comicid`.
- **`models.go` & `extra_models.go`**: Struktur entitas `User`, `Admin`, `Author`, `Pembaca`, `Komik`, `Bab`, `Kategori`, `Review`, `Bookmark`, `Histori`, dan `Transaksi`.
- **`controller.go` & `feature_controllers.go`**: Controller fitur ComicID. Nama controller utama diselaraskan dengan participant pada sequence diagram SRS.
- **`sequence_handlers.go`**: Handler untuk analisis, rekomendasi, dan logout; alur analisis/logout dipasang melalui `AnalisisController` dan `UserController`.
- **`handlers.go` & `feature_handlers.go`**: HTTP Handlers untuk seluruh endpoint REST API dan serving static web files.
- **`main.go`**: Entry point server backend di port 8080.
- **`run-backend.bat`**: Script runner backend.

## Pemetaan Controller terhadap Sequence Diagram SRS (Bagian 3.2.3)

| Sequence diagram | Nama participant controller di SRS | Struct Go yang digunakan |
|---|---|---|
| Register User | `RegisterController` | `RegisterController` |
| Login User | `UserController` | `UserController` |
| Mengelola Pembayaran | `ProsesPembayaranController` | `ProsesPembayaranController` |
| Manajemen Data Komik | `KomikController` | `KomikController` |
| Manajemen Kategori | `KategoriController` | `KategoriController` |
| Manajemen Rate/Komentar | `KomentarController` | `KomentarController` |
| Manajemen User | `UserController` | `UserController` |
| Manajemen Analisis | `AnalisisController` | `AnalisisController` |
| LogOut | `UserController` | `UserController` |

`UserController` dipakai bersama untuk login, manajemen user, dan logout, sesuai nama participant yang berulang di diagram. Nama lama `LoginController`, `KomentarRatingController`, dan `PembayaranController` hanya dipertahankan sebagai compatibility facade/alias untuk kode atau test lama; wiring aplikasi utama menggunakan nama sesuai SRS.

**Catatan arsitektur:** penyelarasan ini memastikan nama controller dan wiring HTTP sesuai participant controller pada diagram. Sebagian method controller yang sudah ada masih menjalankan query database secara langsung; pemisahan penuh `Controller → Service → Database` seperti lifeline pada diagram belum selesai pada perubahan ini.

## Endpoint API yang Disediakan
- **Autentikasi & Health**:
  - `POST /api/login`: Login akun pengguna (mengembalikan data role, email, username, dan id pengguna).
  - `POST /api/register`: Pendaftaran pengguna baru.
  - `GET /api/health`: Status backend dan konektivitas database MySQL.
  - `POST /api/logout`: Mengakhiri alur logout sisi API (status login frontend saat ini disimpan di localStorage).
  - `GET /api/recommendations?user_id=1&limit=8`: Rekomendasi berdasarkan kategori dari histori baca; fallback ke rating tertinggi.
  - `GET /api/admin/analysis?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`: Ringkasan laporan untuk dashboard Admin.
  - `GET /api/admin/analysis?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&format=csv`: Ekspor ringkasan laporan CSV.
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


## Catatan kesesuaian SRS dan batas implementasi
- Endpoint analisis memakai rentang tanggal untuk ulasan dan transaksi. Total pengguna dan komik adalah total keseluruhan karena skema SQL saat ini belum memiliki kolom tanggal pendaftaran/pembuatan.
- Rekomendasi memakai kesamaan kategori dari histori baca; jika pengguna belum memiliki histori, sistem mengurutkan berdasarkan rating.
- Alur logout frontend saat ini memakai `localStorage`, bukan session/token server. Endpoint logout melengkapi kontrak API tetapi belum mencabut token server.
- Pembayaran saat ini masih berupa pencatatan/status transaksi internal. Integrasi payment gateway eksternal sungguhan memerlukan kredensial dan callback/webhook dari penyedia pembayaran.
- Proteksi role Admin/Kreator/Pembaca belum diterapkan secara konsisten pada seluruh endpoint. Jangan deploy backend ini ke internet atau gunakan untuk transaksi sungguhan sebelum autentikasi sesi dan otorisasi server-side ditambahkan.
