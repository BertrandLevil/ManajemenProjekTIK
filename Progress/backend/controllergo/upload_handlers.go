package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
)

const (
	maxUploadSize = 250 << 20 // Maksimal total request: 250 MB
	maxImageSize  = 20 << 20  // Maksimal setiap gambar: 20 MB
	maxImageCount = 100
)

// Memeriksa signature file, bukan hanya nama ekstensinya.
func validImageFile(file io.ReadSeeker, ext string) bool {
	header := make([]byte, 12)

	if _, err := file.Read(header); err != nil {
		return false
	}

	_, _ = file.Seek(0, io.SeekStart)

	switch strings.ToLower(ext) {
	case ".jpg", ".jpeg":
		return header[0] == 0xFF &&
			header[1] == 0xD8 &&
			header[2] == 0xFF

	case ".png":
		return string(header[:8]) == "\x89PNG\r\n\x1a\n"

	case ".webp":
		return string(header[:4]) == "RIFF" &&
			string(header[8:12]) == "WEBP"

	case ".avif":
		return string(header[4:8]) == "ftyp" &&
			(string(header[8:12]) == "avif" ||
				string(header[8:12]) == "avis")
	}

	return false
}

func ChapterPagesUploadHttpHandler(storageDir string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method != http.MethodPost {
			sendJSONError(w, http.StatusMethodNotAllowed,
				"Method tidak diizinkan.")
			return
		}

		// Membatasi ukuran seluruh request.
		r.Body = http.MaxBytesReader(w, r.Body, maxUploadSize)

		if err := r.ParseMultipartForm(32 << 20); err != nil {
			sendJSONError(w, http.StatusBadRequest,
				"Data upload tidak valid atau terlalu besar.")
			return
		}

		if r.MultipartForm != nil {
			defer r.MultipartForm.RemoveAll()
		}

		userID, err := strconv.Atoi(r.FormValue("user_id"))
		if err != nil || userID <= 0 {
			sendJSONError(w, http.StatusBadRequest,
				"user_id tidak valid.")
			return
		}

		chapterID, err := strconv.Atoi(r.FormValue("chapter_id"))
		if err != nil || chapterID <= 0 {
			sendJSONError(w, http.StatusBadRequest,
				"chapter_id tidak valid.")
			return
		}

		files := r.MultipartForm.File["images"]

		if len(files) == 0 {
			sendJSONError(w, http.StatusBadRequest,
				"Minimal satu gambar harus dipilih.")
			return
		}

		if len(files) > maxImageCount {
			sendJSONError(w, http.StatusBadRequest,
				"Maksimal 100 gambar dalam satu upload.")
			return
		}

		// Urutkan berdasarkan nama file asli.
		sort.SliceStable(files, func(i, j int) bool {
			return strings.ToLower(files[i].Filename) <
				strings.ToLower(files[j].Filename)
		})

		// Ambil koneksi database.
		conn, err := GetConnection()
		if err != nil {
			sendJSONError(w, http.StatusInternalServerError,
				"Koneksi database gagal.")
			return
		}

		// Pastikan chapter ada dan pengguna merupakan pemilik komik.
		var comicID, chapterNumber, creatorID int

		err = conn.QueryRow(`
			SELECT k.id_komik, b.nomor_bab, k.id_kreator
			FROM bab b
			JOIN komik k ON b.id_komik = k.id_komik
			WHERE b.id_bab = ?
		`, chapterID).Scan(
			&comicID,
			&chapterNumber,
			&creatorID,
		)

		if err != nil {
			sendJSONError(w, http.StatusNotFound,
				"Chapter tidak ditemukan.")
			return
		}

		if creatorID != userID {
			sendJSONError(w, http.StatusForbidden,
				"Pengguna bukan pemilik komik ini.")
			return
		}

		// Tolak jika chapter sudah memiliki halaman.
		var totalPages int

		err = conn.QueryRow(`
			SELECT COUNT(*)
			FROM halaman_bab
			WHERE id_bab = ?
		`, chapterID).Scan(&totalPages)

		if err != nil {
			sendJSONError(w, http.StatusInternalServerError,
				"Gagal memeriksa halaman chapter.")
			return
		}

		if totalPages > 0 {
			sendJSONError(w, http.StatusConflict,
				"Chapter sudah memiliki halaman. Upload dibatalkan.")
			return
		}

		// Validasi ukuran dan format seluruh gambar sebelum menyimpan.
		extensions := make([]string, len(files))

		for i, fileHeader := range files {
			if fileHeader.Size <= 0 || fileHeader.Size > maxImageSize {
				sendJSONError(w, http.StatusBadRequest,
					"Ukuran setiap gambar harus maksimal 20 MB.")
				return
			}

			ext := strings.ToLower(filepath.Ext(fileHeader.Filename))

			switch ext {
			case ".webp", ".jpg", ".jpeg", ".png", ".avif":
			default:
				sendJSONError(w, http.StatusBadRequest,
					"Format gambar tidak didukung: "+ext)
				return
			}

			file, err := fileHeader.Open()
			if err != nil {
				sendJSONError(w, http.StatusBadRequest,
					"Gagal membaca file gambar.")
				return
			}

			valid := validImageFile(file, ext)
			_ = file.Close()

			if !valid {
				sendJSONError(w, http.StatusBadRequest,
					"Isi file tidak sesuai dengan format gambar.")
				return
			}

			extensions[i] = ext
		}

		// Folder menggunakan ID komik dan nomor chapter.
		folderName := fmt.Sprintf("chapter-%03d", chapterNumber)

		relativeDir := filepath.Join(
			"comics",
			strconv.Itoa(comicID),
			folderName,
		)

		destinationDir := filepath.Join(storageDir, relativeDir)

		if err := os.MkdirAll(destinationDir, 0755); err != nil {
			sendJSONError(w, http.StatusInternalServerError,
				"Gagal membuat folder penyimpanan.")
			return
		}

		// Catat file yang berhasil dibuat agar bisa dibersihkan
		// jika proses penyimpanan database gagal.
		var savedFiles []string

		cleanup := func() {
			for _, path := range savedFiles {
				_ = os.Remove(path)
			}
		}

		tx, err := conn.Begin()
		if err != nil {
			sendJSONError(w, http.StatusInternalServerError,
				"Gagal memulai transaksi database.")
			return
		}

		for i, fileHeader := range files {
			pageNumber := i + 1

			filename := fmt.Sprintf("%03d%s",
				pageNumber, extensions[i])

			destination := filepath.Join(
				destinationDir,
				filename,
			)

			// Jangan menimpa file yang sudah ada.
			output, err := os.OpenFile(
				destination,
				os.O_WRONLY|os.O_CREATE|os.O_EXCL,
				0644,
			)

			if err != nil {
				_ = tx.Rollback()
				cleanup()

				sendJSONError(w, http.StatusConflict,
					"File tujuan sudah ada atau gagal dibuat.")
				return
			}

			savedFiles = append(savedFiles, destination)

			input, err := fileHeader.Open()
			if err != nil {
				_ = output.Close()
				_ = tx.Rollback()
				cleanup()

				sendJSONError(w, http.StatusInternalServerError,
					"Gagal membuka gambar.")
				return
			}

			_, copyErr := io.Copy(output, input)
			_ = input.Close()
			closeErr := output.Close()

			if copyErr != nil || closeErr != nil {
				_ = tx.Rollback()
				cleanup()

				sendJSONError(w, http.StatusInternalServerError,
					"Gagal menyimpan gambar.")
				return
			}

			// Simpan URL yang dapat digunakan oleh frontend.
			filePath := "/" + filepath.ToSlash(
				filepath.Join("storage", relativeDir, filename),
			)

			_, err = tx.Exec(`
				INSERT INTO halaman_bab
					(id_bab, nomor_halaman, file_path)
				VALUES (?, ?, ?)
			`, chapterID, pageNumber, filePath)

			if err != nil {
				_ = tx.Rollback()
				cleanup()

				fmt.Printf("[UploadChapter] Error DB: %v\n", err)

				sendJSONError(w, http.StatusInternalServerError,
					"Gagal menyimpan data halaman.")
				return
			}
		}

		if err := tx.Commit(); err != nil {
			cleanup()

			sendJSONError(w, http.StatusInternalServerError,
				"Gagal menyelesaikan upload.")
			return
		}

		sendJSON(w, http.StatusCreated, map[string]interface{}{
			"success": true,
			"message": "Halaman chapter berhasil diunggah.",
			"total":   len(files),
		})
	}
}
