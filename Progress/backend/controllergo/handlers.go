package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

var emailRegex = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
}

func sendJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(data)
}

func sendJSONError(w http.ResponseWriter, statusCode int, message string) {
	sendJSON(w, statusCode, map[string]interface{}{
		"success": false,
		"message": message,
	})
}

// =========================================================
// 3. HTTP Handler untuk Login (/api/login)
// =========================================================
func LoginHttpHandler(controller *LoginController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method != http.MethodPost {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
			return
		}

		body, err := io.ReadAll(r.Body)
		if err != nil {
			sendJSONError(w, http.StatusBadRequest, "Gagal membaca body permintaan.")
			return
		}
		defer r.Body.Close()

		var req struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		if err := json.Unmarshal(body, &req); err != nil {
			sendJSONError(w, http.StatusBadRequest, "Format JSON tidak valid.")
			return
		}

		email := strings.TrimSpace(req.Email)
		password := req.Password

		if email == "" && password == "" {
			sendJSONError(w, http.StatusBadRequest, "Form login wajib diisi.")
			return
		}
		if email == "" {
			sendJSONError(w, http.StatusBadRequest, "Email/Username wajib diisi.")
			return
		}
		if password == "" {
			sendJSONError(w, http.StatusBadRequest, "Password wajib diisi.")
			return
		}

		user, err := controller.LoginWithQuery(email, password)
		if err != nil {
			if errorsIs(err, ErrInvalidPassword) {
				sendJSONError(w, http.StatusUnauthorized, "Password salah.")
				return
			}
			fmt.Printf("[LoginHandler] Error: %v\n", err)
			sendJSONError(w, http.StatusInternalServerError, fmt.Sprintf("Terjadi kesalahan koneksi database: %s", err.Error()))
			return
		}

		if user == nil {
			sendJSONError(w, http.StatusNotFound, "Email atau username tidak terdaftar.")
			return
		}

		sendJSON(w, http.StatusOK, map[string]interface{}{
			"success":  true,
			"message":  "Login berhasil!",
			"email":    user.GetEmail(),
			"username": user.GetUsername(),
			"role":     user.GetRole(),
		})
	}
}

// =========================================================
// 4. HTTP Handler untuk Register (/api/register)
// =========================================================
func RegisterHttpHandler(controller *LoginController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method != http.MethodPost {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
			return
		}

		body, err := io.ReadAll(r.Body)
		if err != nil {
			sendJSONError(w, http.StatusBadRequest, "Gagal membaca body permintaan.")
			return
		}
		defer r.Body.Close()

		var req struct {
			Username string `json:"username"`
			Email    string `json:"email"`
			Password string `json:"password"`
			Role     string `json:"role"`
		}

		if err := json.Unmarshal(body, &req); err != nil {
			sendJSONError(w, http.StatusBadRequest, "Format JSON tidak valid.")
			return
		}

		username := strings.TrimSpace(req.Username)
		email := strings.TrimSpace(req.Email)
		password := req.Password
		role := strings.TrimSpace(req.Role)

		if username == "" || email == "" || password == "" {
			sendJSONError(w, http.StatusBadRequest, "Semua field wajib diisi.")
			return
		}
		if len(username) < 3 {
			sendJSONError(w, http.StatusBadRequest, "Nama pengguna minimal 3 karakter.")
			return
		}
		if !emailRegex.MatchString(email) {
			sendJSONError(w, http.StatusBadRequest, "Format email tidak valid.")
			return
		}
		if len(password) < 8 {
			sendJSONError(w, http.StatusBadRequest, "Password minimal 8 karakter.")
			return
		}

		if role == "" {
			role = "Pembaca"
		}

		registered, err := controller.RegisterWithQuery(username, email, password, role)
		if err != nil {
			msg := err.Error()
			if msg == "Nama pengguna sudah digunakan." || msg == "Email sudah terdaftar." {
				sendJSONError(w, http.StatusBadRequest, msg)
				return
			}
			fmt.Printf("[RegisterHandler] Error: %v\n", err)
			sendJSONError(w, http.StatusInternalServerError, fmt.Sprintf("Kesalahan database: %s", msg))
			return
		}

		if registered {
			sendJSON(w, http.StatusCreated, map[string]interface{}{
				"success": true,
				"message": "Registrasi berhasil! Silakan login.",
			})
		} else {
			sendJSONError(w, http.StatusInternalServerError, "Gagal menyimpan data pengguna.")
		}
	}
}

// =========================================================
// 5. HTTP Handler untuk Health Check & DB Status (/api/health)
// =========================================================
func HealthHttpHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		dbConnected := TestConnection()
		dbStatus := "connected"
		statusCode := http.StatusOK

		if !dbConnected {
			dbStatus = "disconnected (pastikan Laragon MySQL aktif)"
			statusCode = http.StatusServiceUnavailable
		}

		sendJSON(w, statusCode, map[string]interface{}{
			"status":   "running",
			"database": dbStatus,
		})
	}
}

// =========================================================
// 6. HTTP Handler untuk Static Web Files (HTML, CSS, JS)
// =========================================================
func StaticFileHandler(baseDir string) http.HandlerFunc {
	absBaseDir, err := filepath.Abs(baseDir)
	if err != nil {
		absBaseDir = baseDir
	}

	fmt.Printf("[StaticFileHandler] Folder frontend: %s\n", absBaseDir)

	homeFile := filepath.Join(absBaseDir, "pages", "home.html")
	if _, err := os.Stat(homeFile); os.IsNotExist(err) {
		fmt.Printf("[PERINGATAN] File login tidak ditemukan: %s\n", homeFile)
	}

	return func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path

		// API ditangani oleh handler masing-masing
		if strings.HasPrefix(path, "/api/") {
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(http.StatusNotFound)
			_, _ = w.Write([]byte(`{"error":"Not found"}`))
			return
		}

		// Homepage menjadi halaman awal
		if path == "/" || path == "" {
			path = "/pages/home.html"
		}

		relPath := strings.TrimPrefix(path, "/")
		relPath = filepath.Clean(relPath)

		targetPath := filepath.Join(absBaseDir, relPath)

		// Jika URL HTML tidak ditemukan, coba cari di dalam folder pages
		if _, err := os.Stat(targetPath); os.IsNotExist(err) && strings.HasSuffix(strings.ToLower(path), ".html") {
			fileName := filepath.Base(path)
			fallbackPath := filepath.Join(absBaseDir, "pages", fileName)
			if _, err2 := os.Stat(fallbackPath); err2 == nil {
				targetPath = fallbackPath
			}
		}

		// Security: Pastikan file tetap berada di dalam folder frontend
		relCheck, err := filepath.Rel(absBaseDir, targetPath)
		if err != nil || strings.HasPrefix(relCheck, "..") {
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(http.StatusNotFound)
			_, _ = w.Write([]byte(fmt.Sprintf(`{"error":"File tidak ditemukan: %s"}`, path)))
			return
		}

		info, err := os.Stat(targetPath)
		if err != nil || info.IsDir() {
			w.Header().Set("Content-Type", "application/json; charset=UTF-8")
			w.WriteHeader(http.StatusNotFound)
			_, _ = w.Write([]byte(fmt.Sprintf(`{"error":"File tidak ditemukan: %s"}`, path)))
			return
		}

		// Tentukan tipe konten berdasarkan ekstensi file
		lower := strings.ToLower(filepath.Ext(targetPath))
		contentType := "application/octet-stream"

		switch lower {
		case ".html":
			contentType = "text/html; charset=UTF-8"
		case ".css":
			contentType = "text/css; charset=UTF-8"
		case ".js":
			contentType = "application/javascript; charset=UTF-8"
		case ".json":
			contentType = "application/json; charset=UTF-8"
		case ".png":
			contentType = "image/png"
		case ".jpg", ".jpeg":
			contentType = "image/jpeg"
		case ".webp":
			contentType = "image/webp"
		case ".gif":
			contentType = "image/gif"
		case ".svg":
			contentType = "image/svg+xml"
		case ".ico":
			contentType = "image/x-icon"
		}

		w.Header().Set("Content-Type", contentType)
		w.Header().Set("X-Content-Type-Options", "nosniff")

		content, err := os.ReadFile(targetPath)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			_, _ = w.Write([]byte(`{"error":"Gagal membaca file"}`))
			return
		}

		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(content)
	}
}

func errorsIs(err, target error) bool {
	if err == nil {
		return target == nil
	}
	return err == target || err.Error() == target.Error()
}
