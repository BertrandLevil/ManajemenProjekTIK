package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
)

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

	abs, _ := filepath.Abs(filepath.Join(cwd, "..", "frontend"))
	return abs
}

func main() {
	port := 8080
	loginCtrl := NewLoginController()
	userCtrl := NewUserController()
	komikCtrl := NewKomikController()
	babCtrl := NewBabController()
	kategoriCtrl := NewKategoriController()
	reviewCtrl := NewKomentarRatingController()
	bookmarkCtrl := NewBookmarkHistoriController()
	pembayaranCtrl := NewPembayaranController()

	frontendDir := resolveFrontendDir()
	mux := http.NewServeMux()

	// Lokasi folder penyimpanan PDF dan file lainnya.
	projectDir := filepath.Dir(frontendDir)
	storageDir := filepath.Join(projectDir, "backend", "storage")

	fmt.Printf("[Storage] Folder penyimpanan: %s\n", storageDir)

	// Sajikan file dari folder backend/storage melalui URL /storage/.
	mux.Handle(
		"/storage/",
		http.StripPrefix(
			"/storage/",
			http.FileServer(http.Dir(storageDir)),
		),
	)

	mux.HandleFunc("/api/login", LoginHttpHandler(loginCtrl))
	mux.HandleFunc("/api/register", RegisterHttpHandler(loginCtrl))
	mux.HandleFunc("/api/health", HealthHttpHandler())

	mux.HandleFunc("/api/user/profile", UserProfileHttpHandler(userCtrl))
	mux.HandleFunc("/api/admin/users", AdminUsersHttpHandler(userCtrl))

	mux.HandleFunc("/api/comics", ComicsHttpHandler(komikCtrl))
	mux.HandleFunc("/api/comics/detail", ComicsDetailHttpHandler(komikCtrl))
	mux.HandleFunc("/api/comics/verify", ComicsVerifyHttpHandler(komikCtrl))
	mux.HandleFunc("/api/comics/stats", ComicsStatsHttpHandler(komikCtrl))

	mux.HandleFunc("/api/chapters", ChaptersHttpHandler(babCtrl))
	mux.HandleFunc("/api/chapters/detail", ChaptersDetailHttpHandler(babCtrl))
	mux.HandleFunc("/api/chapter-pages", ChapterPagesHttpHandler(babCtrl))
	mux.HandleFunc("/api/chapter-pages/upload", ChapterPagesUploadHttpHandler(storageDir))

	mux.HandleFunc("/api/categories", CategoriesHttpHandler(kategoriCtrl))
	mux.HandleFunc("/api/categories/detail", CategoriesDetailHttpHandler(kategoriCtrl))

	mux.HandleFunc("/api/reviews", ReviewsHttpHandler(reviewCtrl))
	mux.HandleFunc("/api/reviews/detail", ReviewsDetailHttpHandler(reviewCtrl))
	mux.HandleFunc("/api/author/reviews", AuthorReviewsHttpHandler(reviewCtrl))

	mux.HandleFunc("/api/bookmarks", BookmarksHttpHandler(bookmarkCtrl))
	mux.HandleFunc("/api/history", HistoryHttpHandler(bookmarkCtrl))

	mux.HandleFunc("/api/payment/checkout", PaymentCheckoutHttpHandler(pembayaranCtrl))
	mux.HandleFunc("/api/payment/process", PaymentProcessHttpHandler(pembayaranCtrl))
	mux.HandleFunc("/api/payment/history", UserTransactionsHttpHandler(pembayaranCtrl))
	mux.HandleFunc("/api/admin/transactions", AdminTransactionsHttpHandler(pembayaranCtrl))

	mux.HandleFunc("/", StaticFileHandler(frontendDir))

	fmt.Println("==================================================")
	fmt.Println(" Backend & Web Server ComicID (Golang) Dimulai!   ")
	fmt.Println("==================================================")
	fmt.Printf(" - Buka di Browser : http://localhost:%d/\n", port)
	fmt.Printf(" - Halaman Login   : http://localhost:%d/pages/home.html\n", port)
	fmt.Printf(" - Halaman Daftar  : http://localhost:%d/pages/register.html\n", port)
	fmt.Println("--------------------------------------------------")
	fmt.Println(" Controller & API Endpoints Terdaftar: ")
	fmt.Println(" [Autentikasi] : /api/login, /api/register, /api/health")
	fmt.Println(" [Pengguna]    : /api/user/profile, /api/admin/users")
	fmt.Println(" [Komik]       : /api/comics, /api/comics/detail, /api/comics/verify, /api/comics/stats")
	fmt.Println(" [Bab/Chapter] : /api/chapters, /api/chapters/detail, /api/chapter-pages")
	fmt.Println(" [Kategori]    : /api/categories, /api/categories/detail")
	fmt.Println(" [Ulasan]      : /api/reviews, /api/reviews/detail, /api/author/reviews")
	fmt.Println(" [Bookmark]    : /api/bookmarks, /api/history")
	fmt.Println(" [Pembayaran]  : /api/payment/checkout, /api/payment/process, /api/payment/history, /api/admin/transactions")
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
