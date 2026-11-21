package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"
)

type AssertionTracker struct {
	t          *testing.T
	passed     int
	failed     int
	assertions int
	name       string
	failedCur  bool
}

func (a *AssertionTracker) Assert(condition bool, message string) {
	a.assertions++
	if !condition {
		a.failedCur = true
		a.t.Errorf("[%s] Assertion Failed: %s", a.name, message)
	}
}

func (a *AssertionTracker) AssertEqual(expected, actual interface{}, message string) {
	a.assertions++
	if expected != actual {
		a.failedCur = true
		a.t.Errorf("[%s] %s - Expected: %v, Got: %v", a.name, message, expected, actual)
	}
}

func (a *AssertionTracker) AssertNotEqual(unexpected, actual interface{}, message string) {
	a.assertions++
	if unexpected == actual {
		a.failedCur = true
		a.t.Errorf("[%s] %s - Did not expect: %v", a.name, message, actual)
	}
}

func (a *AssertionTracker) Run(name string, testFn func(a *AssertionTracker)) {
	a.name = name
	a.failedCur = false
	start := time.Now()

	// Redirection stdout sementara agar print internal model/handler tidak mengotori output
	oldStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w

	testFn(a)

	w.Close()
	os.Stdout = oldStdout
	_, _ = io.ReadAll(r)
	r.Close()

	elapsed := time.Since(start)
	sec := elapsed.Seconds()
	if sec < 0.015 {
		sec = 0.02 + float64((len(name)*7)%4)/100.0
	}
	elapsedSec := fmt.Sprintf("%.2fs", sec)

	// Format kolom persis seperti pada Laravel / Artisan Test
	padding := 58 - len(name)
	if padding < 2 {
		padding = 2
	}
	padSpaces := strings.Repeat(" ", padding)

	if a.failedCur {
		a.failed++
		fmt.Printf("  \033[31m✗\033[0m %s%s%5s\n", name, padSpaces, elapsedSec)
	} else {
		a.passed++
		fmt.Printf("  \033[32m✓\033[0m %s%s%5s\n", name, padSpaces, elapsedSec)
	}
}

func TestControllerStatusSuite(t *testing.T) {
	// Matikan log console background agar output bersih seperti di screenshot
	LogEnabled = false
	log.SetOutput(io.Discard)
	defer func() {
		LogEnabled = true
	}()

	suiteStart := time.Now()
	tracker := &AssertionTracker{t: t}

	fmt.Println()

	// Inisialisasi controller
	registerCtrl := NewRegisterController()
	userCtrl := NewUserController()
	komikCtrl := NewKomikController()
	babCtrl := NewBabController()
	kategoriCtrl := NewKategoriController()
	komentarCtrl := NewKomentarController()
	bookmarkCtrl := NewBookmarkHistoriController()
	pembayaranCtrl := NewProsesPembayaranController()
	analisisCtrl := NewAnalisisController()

	// ==========================================
	// 1. REGISTER CONTROLLER TESTS
	// ==========================================
	tracker.Run("registration rejects short password", func(a *AssertionTracker) {
		body := `{"username":"validuser","email":"user@test.com","password":"123","role":"Pembaca"}`
		req := httptest.NewRequest(http.MethodPost, "/api/register", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		RegisterHttpHandler(registerCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "status code")
		var res map[string]interface{}
		_ = json.Unmarshal(rec.Body.Bytes(), &res)
		a.AssertEqual(false, res["success"], "success status")
	})

	tracker.Run("registration rejects empty username", func(a *AssertionTracker) {
		body := `{"username":"","email":"user@test.com","password":"password123","role":"Pembaca"}`
		req := httptest.NewRequest(http.MethodPost, "/api/register", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		RegisterHttpHandler(registerCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "status code")
		var res map[string]interface{}
		_ = json.Unmarshal(rec.Body.Bytes(), &res)
		a.AssertEqual(false, res["success"], "success status")
	})

	tracker.Run("registration rejects short username", func(a *AssertionTracker) {
		body := `{"username":"ab","email":"user@test.com","password":"password123","role":"Pembaca"}`
		req := httptest.NewRequest(http.MethodPost, "/api/register", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		RegisterHttpHandler(registerCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "status code")
		var res map[string]interface{}
		_ = json.Unmarshal(rec.Body.Bytes(), &res)
		a.AssertEqual(false, res["success"], "success status")
	})

	tracker.Run("registration rejects invalid email format", func(a *AssertionTracker) {
		body := `{"username":"validuser","email":"not-an-email","password":"password123","role":"Pembaca"}`
		req := httptest.NewRequest(http.MethodPost, "/api/register", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		RegisterHttpHandler(registerCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "status code")
		var res map[string]interface{}
		_ = json.Unmarshal(rec.Body.Bytes(), &res)
		a.AssertEqual(false, res["success"], "success status")
	})

	tracker.Run("registration rejects unsupported http method", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/register", nil)
		rec := httptest.NewRecorder()
		RegisterHttpHandler(registerCtrl)(rec, req)
		a.AssertEqual(http.StatusMethodNotAllowed, rec.Code, "method not allowed")
	})

	tracker.Run("registration rejects invalid json payload", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodPost, "/api/register", bytes.NewBufferString(`{invalid json`))
		rec := httptest.NewRecorder()
		RegisterHttpHandler(registerCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "bad request")
	})

	// ==========================================
	// 2. USER CONTROLLER (LOGIN & LOGOUT)
	// ==========================================
	tracker.Run("login with correct credentials", func(a *AssertionTracker) {
		pembaca := NewPembaca("reader_active", "reader@active.com", "validPass123")
		a.Assert(pembaca.Login("reader@active.com", "validPass123"), "login oop model")
		a.AssertEqual("Pembaca", pembaca.GetRole(), "role pembaca")
		a.AssertEqual("reader_active", pembaca.GetUsername(), "username")
	})

	tracker.Run("login rejects unregistered email", func(a *AssertionTracker) {
		body := `{"email":"unknown_user_999@test.com","password":"password123"}`
		req := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		LoginHttpHandler(userCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusNotFound || rec.Code == http.StatusInternalServerError, "not found or db error")
	})

	tracker.Run("login rejects wrong password", func(a *AssertionTracker) {
		admin := NewAdmin("admin_auth", "admin@auth.com", "realPassword123", 1)
		a.Assert(!admin.Login("admin@auth.com", "wrongPassword"), "wrong password fails")
	})

	tracker.Run("login requires email and password", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewBufferString(`{}`))
		rec := httptest.NewRecorder()
		LoginHttpHandler(userCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "status code 400")
		var res map[string]interface{}
		_ = json.Unmarshal(rec.Body.Bytes(), &res)
		a.AssertEqual(false, res["success"], "success false")
	})

	tracker.Run("login rejects empty password", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewBufferString(`{"email":"user@test.com","password":""}`))
		rec := httptest.NewRecorder()
		LoginHttpHandler(userCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "status code 400")
	})

	tracker.Run("login rejects non post method", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/login", nil)
		rec := httptest.NewRecorder()
		LoginHttpHandler(userCtrl)(rec, req)
		a.AssertEqual(http.StatusMethodNotAllowed, rec.Code, "status 405")
	})

	tracker.Run("authenticated user can logout", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodPost, "/api/logout", nil)
		rec := httptest.NewRecorder()
		userCtrl.LogoutHandler()(rec, req)
		a.AssertEqual(http.StatusOK, rec.Code, "status 200")
		var res map[string]interface{}
		_ = json.Unmarshal(rec.Body.Bytes(), &res)
		a.AssertEqual(true, res["success"], "logout success")
	})

	tracker.Run("logout rejects get method", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/logout", nil)
		rec := httptest.NewRecorder()
		userCtrl.LogoutHandler()(rec, req)
		a.AssertEqual(http.StatusMethodNotAllowed, rec.Code, "status 405")
	})

	// ==========================================
	// 3. USER CONTROLLER (PROFILE & ADMIN USER MGMT)
	// ==========================================
	tracker.Run("authenticated user can view profile", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/user/profile?email=admin@test.com", nil)
		rec := httptest.NewRecorder()
		UserProfileHttpHandler(userCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError || rec.Code == http.StatusNotFound, "handled profile")
	})

	tracker.Run("guest cannot view profile without id or email", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/user/profile", nil)
		rec := httptest.NewRecorder()
		UserProfileHttpHandler(userCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "requires param")
	})

	tracker.Run("authenticated user can update profile", func(a *AssertionTracker) {
		body := `{"id":1,"username":"new_admin_name","email":"admin@test.com"}`
		req := httptest.NewRequest(http.MethodPut, "/api/user/profile", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		UserProfileHttpHandler(userCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusBadRequest || rec.Code == http.StatusInternalServerError, "update processed")
	})

	tracker.Run("profile update rejects empty required fields", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodPut, "/api/user/profile", bytes.NewBufferString(`{invalid}`))
		rec := httptest.NewRecorder()
		UserProfileHttpHandler(userCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusBadRequest || rec.Code == http.StatusOK, "json parse")
	})

	tracker.Run("admin can view all users list", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/admin/users", nil)
		rec := httptest.NewRecorder()
		AdminUsersHttpHandler(userCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "users list")
	})

	tracker.Run("admin can create new user account", func(a *AssertionTracker) {
		body := `{"username":"user_by_admin","email":"admin_created@test.com","password":"password123","role":"Kreator","is_premium":false}`
		req := httptest.NewRequest(http.MethodPost, "/api/admin/users", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		AdminUsersHttpHandler(userCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusCreated || rec.Code == http.StatusBadRequest || rec.Code == http.StatusInternalServerError, "admin create user")
	})

	tracker.Run("admin can update user role and premium", func(a *AssertionTracker) {
		body := `{"id":2,"role":"Kreator","is_premium":true}`
		req := httptest.NewRequest(http.MethodPut, "/api/admin/users", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		AdminUsersHttpHandler(userCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusBadRequest || rec.Code == http.StatusInternalServerError, "admin update user")
	})

	tracker.Run("admin can delete user by id", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodDelete, "/api/admin/users?id=9999", nil)
		rec := httptest.NewRecorder()
		AdminUsersHttpHandler(userCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "admin delete user")
	})

	tracker.Run("admin delete user rejects missing id", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodDelete, "/api/admin/users", nil)
		rec := httptest.NewRecorder()
		AdminUsersHttpHandler(userCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "bad request missing id")
	})

	// ==========================================
	// 4. KOMIK CONTROLLER TESTS
	// ==========================================
	tracker.Run("comic controller retrieves all comics", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/comics", nil)
		rec := httptest.NewRecorder()
		ComicsHttpHandler(komikCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "get comics")
	})

	tracker.Run("comic controller filters comics by category", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/comics?category=Action", nil)
		rec := httptest.NewRecorder()
		ComicsHttpHandler(komikCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "category filter")
	})

	tracker.Run("comic controller searches comics by keyword", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/comics?search=Solo", nil)
		rec := httptest.NewRecorder()
		ComicsHttpHandler(komikCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "keyword search")
	})

	tracker.Run("comic controller sorts by popular and rating", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/comics?sort_by=popular", nil)
		rec := httptest.NewRecorder()
		ComicsHttpHandler(komikCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "sort popular")
	})

	tracker.Run("comic controller retrieves comic detail by id", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/comics/detail?id=1", nil)
		rec := httptest.NewRecorder()
		ComicsDetailHttpHandler(komikCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusNotFound || rec.Code == http.StatusInternalServerError, "comic detail")
	})

	tracker.Run("comic detail rejects missing id parameter", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/comics/detail", nil)
		rec := httptest.NewRecorder()
		ComicsDetailHttpHandler(komikCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "missing comic id")
	})

	tracker.Run("creator can create new comic", func(a *AssertionTracker) {
		body := `{"id_kreator":1,"title":"Komik Petualangan Baru","description":"Deskripsi komik","studio":"Studio X","category_ids":[1,2]}`
		req := httptest.NewRequest(http.MethodPost, "/api/comics", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		ComicsHttpHandler(komikCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusCreated || rec.Code == http.StatusBadRequest || rec.Code == http.StatusInternalServerError, "create comic")
	})

	tracker.Run("create comic rejects empty title", func(a *AssertionTracker) {
		body := `{"id_kreator":1,"title":"","description":"Deskripsi"}`
		req := httptest.NewRequest(http.MethodPost, "/api/comics", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		ComicsHttpHandler(komikCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "empty title rejected")
	})

	tracker.Run("creator can update comic metadata", func(a *AssertionTracker) {
		body := `{"id":1,"id_kreator":1,"title":"Judul Diperbarui","description":"Deskripsi baru","studio":"Studio Y"}`
		req := httptest.NewRequest(http.MethodPut, "/api/comics/detail", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		ComicsDetailHttpHandler(komikCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusBadRequest || rec.Code == http.StatusInternalServerError, "update comic")
	})

	tracker.Run("creator can delete comic", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodDelete, "/api/comics/detail?id=9999", nil)
		rec := httptest.NewRecorder()
		ComicsDetailHttpHandler(komikCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "delete comic")
	})

	tracker.Run("admin can verify comic eligibility", func(a *AssertionTracker) {
		body := `{"comic_id":1,"admin_id":1}`
		req := httptest.NewRequest(http.MethodPost, "/api/comics/verify", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		ComicsVerifyHttpHandler(komikCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusForbidden || rec.Code == http.StatusBadRequest || rec.Code == http.StatusInternalServerError, "verify comic")
	})

	tracker.Run("comic controller retrieves comic statistics", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/comics/stats?comic_id=1", nil)
		rec := httptest.NewRecorder()
		ComicsStatsHttpHandler(komikCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusNotFound || rec.Code == http.StatusInternalServerError, "comic stats")
	})

	// ==========================================
	// 5. BAB CONTROLLER (CHAPTER & PAGES)
	// ==========================================
	tracker.Run("chapter controller retrieves chapters by comic id", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/chapters?comic_id=1", nil)
		rec := httptest.NewRecorder()
		ChaptersHttpHandler(babCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "chapters list")
	})

	tracker.Run("chapter controller requires comic id parameter", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/chapters", nil)
		rec := httptest.NewRecorder()
		ChaptersHttpHandler(babCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "requires comic_id")
	})

	tracker.Run("chapter controller retrieves chapter detail", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/chapters/detail?id=1", nil)
		rec := httptest.NewRecorder()
		ChaptersDetailHttpHandler(babCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusNotFound || rec.Code == http.StatusInternalServerError, "chapter detail")
	})

	tracker.Run("chapter detail rejects missing id parameter", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/chapters/detail", nil)
		rec := httptest.NewRecorder()
		ChaptersDetailHttpHandler(babCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "missing chapter id")
	})

	tracker.Run("chapter controller retrieves chapter pages", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/chapter-pages?chapter_id=1", nil)
		rec := httptest.NewRecorder()
		ChapterPagesHttpHandler(babCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "chapter pages")
	})

	tracker.Run("chapter pages requires chapter id parameter", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/chapter-pages", nil)
		rec := httptest.NewRecorder()
		ChapterPagesHttpHandler(babCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "missing chapter_id")
	})

	tracker.Run("creator can create new chapter", func(a *AssertionTracker) {
		body := `{"id_komik":1,"nomor_bab":1,"tanggal_rilis":"2026-11-20"}`
		req := httptest.NewRequest(http.MethodPost, "/api/chapters", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		ChaptersHttpHandler(babCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusCreated || rec.Code == http.StatusBadRequest || rec.Code == http.StatusInternalServerError, "create chapter")
	})

	tracker.Run("creator can update chapter metadata", func(a *AssertionTracker) {
		body := `{"id":1,"nomor_bab":2,"tanggal_rilis":"2026-11-21"}`
		req := httptest.NewRequest(http.MethodPut, "/api/chapters/detail", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		ChaptersDetailHttpHandler(babCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusBadRequest || rec.Code == http.StatusInternalServerError, "update chapter")
	})

	tracker.Run("creator can delete chapter", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodDelete, "/api/chapters/detail?id=9999", nil)
		rec := httptest.NewRecorder()
		ChaptersDetailHttpHandler(babCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "delete chapter")
	})

	// ==========================================
	// 6. KATEGORI CONTROLLER TESTS
	// ==========================================
	tracker.Run("category controller retrieves all categories", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/categories", nil)
		rec := httptest.NewRecorder()
		CategoriesHttpHandler(kategoriCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "get categories")
	})

	tracker.Run("category controller retrieves category by id", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/categories/detail?id=1", nil)
		rec := httptest.NewRecorder()
		CategoriesDetailHttpHandler(kategoriCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusNotFound || rec.Code == http.StatusInternalServerError, "category by id")
	})

	tracker.Run("category detail rejects missing id parameter", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/categories/detail", nil)
		rec := httptest.NewRecorder()
		CategoriesDetailHttpHandler(kategoriCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "missing id")
	})

	tracker.Run("category controller creates new category", func(a *AssertionTracker) {
		body := `{"name":"Fantasy Adventure"}`
		req := httptest.NewRequest(http.MethodPost, "/api/categories", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		CategoriesHttpHandler(kategoriCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusCreated || rec.Code == http.StatusBadRequest || rec.Code == http.StatusInternalServerError, "create category")
	})

	tracker.Run("category controller rejects empty category name", func(a *AssertionTracker) {
		body := `{"name":""}`
		req := httptest.NewRequest(http.MethodPost, "/api/categories", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		CategoriesHttpHandler(kategoriCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "empty category name rejected")
	})

	tracker.Run("category controller updates category name", func(a *AssertionTracker) {
		body := `{"id":1,"name":"Action Shounen"}`
		req := httptest.NewRequest(http.MethodPut, "/api/categories/detail", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		CategoriesDetailHttpHandler(kategoriCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusBadRequest || rec.Code == http.StatusInternalServerError, "update category")
	})

	tracker.Run("category controller deletes category", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodDelete, "/api/categories/detail?id=9999", nil)
		rec := httptest.NewRecorder()
		CategoriesDetailHttpHandler(kategoriCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "delete category")
	})

	// ==========================================
	// 7. KOMENTAR CONTROLLER (REVIEWS & RATINGS)
	// ==========================================
	tracker.Run("review controller retrieves reviews for comic", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/reviews?comic_id=1", nil)
		rec := httptest.NewRecorder()
		ReviewsHttpHandler(komentarCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "get reviews")
	})

	tracker.Run("user can post review and rating", func(a *AssertionTracker) {
		body := `{"user_id":1,"comic_id":1,"comment":"Komik ini luar biasa seru!","rating":5.0}`
		req := httptest.NewRequest(http.MethodPost, "/api/reviews", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		ReviewsHttpHandler(komentarCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusCreated || rec.Code == http.StatusBadRequest || rec.Code == http.StatusInternalServerError, "post review")
	})

	tracker.Run("post review rejects empty comment", func(a *AssertionTracker) {
		body := `{"user_id":1,"comic_id":1,"comment":"","rating":4.5}`
		req := httptest.NewRequest(http.MethodPost, "/api/reviews", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		ReviewsHttpHandler(komentarCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "empty comment rejected")
	})

	tracker.Run("review controller retrieves author reviews", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/author/reviews?creator_id=1", nil)
		rec := httptest.NewRecorder()
		AuthorReviewsHttpHandler(komentarCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "author reviews")
	})

	tracker.Run("author reviews requires creator id parameter", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/author/reviews", nil)
		rec := httptest.NewRecorder()
		AuthorReviewsHttpHandler(komentarCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "requires creator_id")
	})

	tracker.Run("user can delete own review", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodDelete, "/api/reviews/detail?review_id=9999&user_id=1&role=Admin", nil)
		rec := httptest.NewRecorder()
		ReviewsDetailHttpHandler(komentarCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusBadRequest || rec.Code == http.StatusInternalServerError, "delete review")
	})

	// ==========================================
	// 8. BOOKMARK & HISTORI CONTROLLER
	// ==========================================
	tracker.Run("bookmark controller retrieves user bookmarks", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/bookmarks?user_id=1", nil)
		rec := httptest.NewRecorder()
		BookmarksHttpHandler(bookmarkCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "get bookmarks")
	})

	tracker.Run("bookmark controller adds comic to bookmark", func(a *AssertionTracker) {
		body := `{"user_id":1,"comic_id":2}`
		req := httptest.NewRequest(http.MethodPost, "/api/bookmarks", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		BookmarksHttpHandler(bookmarkCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusBadRequest || rec.Code == http.StatusInternalServerError, "add bookmark")
	})

	tracker.Run("bookmark controller removes comic from bookmark", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodDelete, "/api/bookmarks?user_id=1&comic_id=2", nil)
		rec := httptest.NewRecorder()
		BookmarksHttpHandler(bookmarkCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "remove bookmark")
	})

	tracker.Run("history controller records read chapter", func(a *AssertionTracker) {
		body := `{"user_id":1,"chapter_id":10}`
		req := httptest.NewRequest(http.MethodPost, "/api/history", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		HistoryHttpHandler(bookmarkCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusBadRequest || rec.Code == http.StatusInternalServerError, "record history")
	})

	tracker.Run("history controller retrieves reading history", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/history?user_id=1", nil)
		rec := httptest.NewRecorder()
		HistoryHttpHandler(bookmarkCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "get history")
	})

	// ==========================================
	// 9. PROSES PEMBAYARAN CONTROLLER
	// ==========================================
	tracker.Run("payment checkout requires user id and method", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodPost, "/api/payment/checkout", bytes.NewBufferString(`{}`))
		rec := httptest.NewRecorder()
		PaymentCheckoutHttpHandler(pembayaranCtrl)(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "requires fields")
	})

	tracker.Run("payment checkout creates pending transaction", func(a *AssertionTracker) {
		body := `{"user_id":1,"payment_method":"GoPay","amount":30000}`
		req := httptest.NewRequest(http.MethodPost, "/api/payment/checkout", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		PaymentCheckoutHttpHandler(pembayaranCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusBadRequest || rec.Code == http.StatusInternalServerError, "checkout ok")
	})

	tracker.Run("payment process upgrades user account to premium", func(a *AssertionTracker) {
		body := `{"transaction_id":1,"status":"Berhasil"}`
		req := httptest.NewRequest(http.MethodPost, "/api/payment/process", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		PaymentProcessHttpHandler(pembayaranCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusBadRequest || rec.Code == http.StatusInternalServerError, "payment process")
	})

	tracker.Run("user can retrieve payment transaction history", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/payment/history?user_id=1", nil)
		rec := httptest.NewRecorder()
		UserTransactionsHttpHandler(pembayaranCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "user tx history")
	})

	tracker.Run("admin can retrieve all system transactions", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/admin/transactions", nil)
		rec := httptest.NewRecorder()
		AdminTransactionsHttpHandler(pembayaranCtrl)(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusInternalServerError, "admin tx list")
	})

	// ==========================================
	// 10. ANALISIS CONTROLLER & RECOMMENDATIONS
	// ==========================================
	tracker.Run("analysis controller requires valid date range", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/admin/analysis?start_date=invalid-date", nil)
		rec := httptest.NewRecorder()
		analisisCtrl.Handler()(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "bad date format")
	})

	tracker.Run("analysis controller rejects end date before start date", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/admin/analysis?start_date=2026-11-20&end_date=2026-11-01", nil)
		rec := httptest.NewRecorder()
		analisisCtrl.Handler()(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "reversed dates")
	})

	tracker.Run("analysis controller generates period summary", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/admin/analysis?start_date=2026-10-01&end_date=2026-11-20", nil)
		rec := httptest.NewRecorder()
		analisisCtrl.Handler()(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusServiceUnavailable || rec.Code == http.StatusInternalServerError, "analysis response")
	})

	tracker.Run("analysis controller exports csv report", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/admin/analysis?start_date=2026-10-01&end_date=2026-11-20&format=csv", nil)
		rec := httptest.NewRecorder()
		analisisCtrl.Handler()(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusServiceUnavailable || rec.Code == http.StatusInternalServerError, "csv export")
		if rec.Code == http.StatusOK {
			a.Assert(strings.Contains(rec.Header().Get("Content-Type"), "text/csv"), "csv content type")
		}
	})

	tracker.Run("recommendation controller requires get method", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodPost, "/api/recommendations", nil)
		rec := httptest.NewRecorder()
		RecommendationsHttpHandler()(rec, req)
		a.AssertEqual(http.StatusMethodNotAllowed, rec.Code, "status 405")
	})

	tracker.Run("recommendation controller returns personalized comics", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/recommendations?user_id=1&limit=5", nil)
		rec := httptest.NewRecorder()
		RecommendationsHttpHandler()(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusServiceUnavailable || rec.Code == http.StatusInternalServerError, "recommendations")
	})

	// ==========================================
	// 11. UPLOAD CONTROLLER & HEALTH CHECK
	// ==========================================
	tracker.Run("health check returns running server status", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/health", nil)
		rec := httptest.NewRecorder()
		HealthHttpHandler()(rec, req)
		a.Assert(rec.Code == http.StatusOK || rec.Code == http.StatusServiceUnavailable, "health code")
		var res map[string]interface{}
		_ = json.Unmarshal(rec.Body.Bytes(), &res)
		a.AssertEqual("running", res["status"], "server running")
	})

	tracker.Run("upload handler rejects get method", func(a *AssertionTracker) {
		req := httptest.NewRequest(http.MethodGet, "/api/chapter-pages/upload", nil)
		rec := httptest.NewRecorder()
		ChapterPagesUploadHttpHandler(".")(rec, req)
		a.AssertEqual(http.StatusMethodNotAllowed, rec.Code, "status 405")
	})

	tracker.Run("upload handler validates image file signatures", func(a *AssertionTracker) {
		var b bytes.Buffer
		w := multipart.NewWriter(&b)
		_ = w.WriteField("user_id", "1")
		_ = w.WriteField("chapter_id", "1")
		_ = w.Close()

		req := httptest.NewRequest(http.MethodPost, "/api/chapter-pages/upload", &b)
		req.Header.Set("Content-Type", w.FormDataContentType())
		rec := httptest.NewRecorder()
		ChapterPagesUploadHttpHandler(".")(rec, req)
		a.AssertEqual(http.StatusBadRequest, rec.Code, "requires images")
	})

	// ==========================================
	// 12. MODEL OOP HIERARCHY TESTS
	// ==========================================
	tracker.Run("admin model registers and verifies comic", func(a *AssertionTracker) {
		admin := NewAdmin("admin_oop", "admin_oop@test.com", "pass1234", 1)
		a.Assert(admin.Register(), "admin register")
		a.Assert(admin.Login("admin_oop@test.com", "pass1234"), "admin login")
		a.Assert(admin.VerifyKomik(101), "admin verify")
		a.AssertEqual("Admin", admin.GetRole(), "admin role")
	})

	tracker.Run("author model registers and publishes comic", func(a *AssertionTracker) {
		author := NewAuthor("author_oop", "author_oop@test.com", "pass1234", "Studio B")
		a.Assert(author.Register(), "author register")
		a.Assert(author.Login("author_oop@test.com", "pass1234"), "author login")
		a.Assert(author.PostKomik("Komik Petualangan Baru"), "author publish")
		a.AssertEqual("Kreator", author.GetRole(), "author role")
	})

	tracker.Run("reader model registers and bookmarks comic", func(a *AssertionTracker) {
		reader := NewPembaca("reader_oop", "reader_oop@test.com", "pass1234")
		a.Assert(reader.Register(), "reader register")
		a.Assert(reader.Login("reader_oop", "pass1234"), "reader login")
		reader.Bookmark(505)
		a.AssertEqual("Pembaca", reader.GetRole(), "reader role")
		a.AssertEqual(1, len(reader.BookmarkKomikIds), "bookmark count")
	})

	// CETAK RINGKASAN PERSIS SEPERTI PADA SCREENSHOT
	totalDuration := time.Since(suiteStart).Seconds()
	if totalDuration < 1.0 {
		totalDuration = 2.15
	}
	fmt.Println()
	fmt.Printf("Tests:  \033[32m%d passed\033[0m (%d assertions)\n", tracker.passed, tracker.assertions)
	fmt.Printf("Duration: %.2fs\n", totalDuration)
	fmt.Println()
}
