package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
)

// resolveFrontendDir mencari lokasi folder Progress/frontend secara dinamis
func resolveFrontendDir() string {
	cwd, _ := os.Getwd()
	exePath, _ := os.Executable()
	exeDir := filepath.Dir(exePath)

	candidates := []string{
		filepath.Join(cwd, "..", "frontend"),
		filepath.Join(cwd, "..", "..", "frontend"),
		filepath.Join(cwd, "..", "..", "..", "Progress", "frontend"),
		filepath.Join(cwd, "Progress", "frontend"),
		filepath.Join(cwd, "frontend"),
		filepath.Join(exeDir, "..", "frontend"),
		filepath.Join(exeDir, "..", "..", "frontend"),
		filepath.Join(exeDir, "..", "..", "..", "Progress", "frontend"),
	}

	for _, cand := range candidates {
		checkFile := filepath.Join(cand, "pages", "home.html")
		if _, err := os.Stat(checkFile); err == nil {
			abs, _ := filepath.Abs(cand)
			return abs
		}
	}

	// Default fallback
	abs, _ := filepath.Abs(filepath.Join(cwd, "..", "frontend"))
	return abs
}

func main() {
	port := 8080
	controller := NewLoginController()
	frontendDir := resolveFrontendDir()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/login", LoginHttpHandler(controller))
	mux.HandleFunc("/api/register", RegisterHttpHandler(controller))
	mux.HandleFunc("/api/health", HealthHttpHandler())
	mux.HandleFunc("/", StaticFileHandler(frontendDir))

	fmt.Println("==================================================")
	fmt.Println(" Backend & Web Server ComicID (Golang) Dimulai!   ")
	fmt.Println("==================================================")
	fmt.Printf(" - Buka di Browser : http://localhost:%d/\n", port)
	fmt.Printf(" - Halaman Login   : http://localhost:%d/pages/home.html\n", port)
	fmt.Printf(" - Halaman Daftar  : http://localhost:%d/pages/register.html\n", port)
	fmt.Printf(" - Endpoint API    : http://localhost:%d/api/login\n", port)
	fmt.Println("--------------------------------------------------")

	if TestConnection() {
		fmt.Println(" [OK] Terhubung ke database MySQL/MariaDB `comicid` di Laragon.")
	} else {
		fmt.Println(" [PERINGATAN] Belum terhubung ke MySQL.")
		fmt.Println("              Pastikan Laragon sudah 'Start All' & database `comicid` sudah di-import.")
	}
	fmt.Println("==================================================")

	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: mux,
	}

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		fmt.Printf("[FATAL] Server berhenti dengan error: %v\n", err)
	}
}
