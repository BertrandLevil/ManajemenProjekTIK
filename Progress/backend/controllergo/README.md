# ComicID Backend (Golang Version)

Folder `controllergo` ini merupakan hasil migrasi/salinan dari folder `controller` (Java) ke dalam bahasa pemrograman **Go (Golang)** dengan fungsi, API endpoint, validasi, dan perilaku yang 100% identik tanpa mengubah fungsi apapun.

## Arsitektur Berkas
- **`database.go`**: Manajemen koneksi MySQL/MariaDB (Laragon) dengan database `comicid` (ekivalen dengan `DatabaseConnection.java`).
- **`models.go`**: Struktur entitas OOP `User`, `Admin`, `Author`, dan `Pembaca` lengkap dengan method bisnis sesuai diagram kelas.
- **`controller.go`**: Logika query dan autentikasi untuk method `LoginWithQuery` dan `RegisterWithQuery`.
- **`handlers.go`**: HTTP Handler untuk endpoint `/api/login`, `/api/register`, `/api/health`, dan `StaticFileHandler` untuk melayani berkas web (HTML, CSS, JS, aset).
- **`main.go`**: Entry point server backend di port 8080 (menampilkan banner dan deteksi status koneksi database).
- **`run-backend.bat`**: Script sekali klik untuk menjalankan server Go (membebaskan port 8080 otomatis lalu menjalankan `go run .`).

## Endpoint API yang Disediakan
- `POST /api/login`: Autentikasi pembaca, kreator/author, dan admin via email atau username.
- `POST /api/register`: Pendaftaran pengguna baru.
- `GET /api/health`: Status backend dan konektivitas database MySQL.
- `GET /`: Melayani aplikasi frontend (akses via `http://localhost:8080/`).

## Cara Menjalankan
1. Pastikan **Laragon** (atau MySQL server) sudah dijalankan (*Start All*).
2. Jalankan berkas `run-backend.bat` di dalam folder ini, atau jalankan perintah:
   ```bash
   go run .
   ```
3. Buka browser pada `http://localhost:8080/`.
