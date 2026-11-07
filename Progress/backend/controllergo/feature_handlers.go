package main

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"
)

// =========================================================
// Kategori Handler
// =========================================================
func CategoriesHttpHandler(ctrl *KategoriController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method == http.MethodGet {
			list, err := ctrl.GetAllKategori()
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": list})
		} else if r.Method == http.MethodPost {
			body, _ := io.ReadAll(r.Body)
			defer r.Body.Close()
			var req struct {
				Name string `json:"name"`
			}
			_ = json.Unmarshal(body, &req)
			ok, err := ctrl.CreateKategori(req.Name)
			if err != nil {
				sendJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			sendJSON(w, http.StatusCreated, map[string]interface{}{"success": ok, "message": "Kategori berhasil dibuat."})
		} else {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
		}
	}
}

// =========================================================
// Chapters Handler
// =========================================================
func ChaptersHttpHandler(ctrl *BabController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method == http.MethodGet {
			comicIdStr := r.URL.Query().Get("comic_id")
			comicId, _ := strconv.Atoi(comicIdStr)
			if comicId <= 0 {
				sendJSONError(w, http.StatusBadRequest, "comic_id wajib diisi.")
				return
			}
			list, err := ctrl.GetBabByKomik(comicId)
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "total": len(list), "data": list})
		} else if r.Method == http.MethodPost {
			body, _ := io.ReadAll(r.Body)
			defer r.Body.Close()
			var req struct {
				ComicId       int    `json:"comic_id"`
				ChapterNumber int    `json:"chapter_number"`
				ReleaseDate   string `json:"release_date"`
			}
			_ = json.Unmarshal(body, &req)
			ok, err := ctrl.CreateBab(req.ComicId, req.ChapterNumber, req.ReleaseDate)
			if err != nil {
				sendJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			sendJSON(w, http.StatusCreated, map[string]interface{}{"success": ok, "message": "Bab berhasil ditambahkan."})
		} else {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
		}
	}
}

// =========================================================
// Comics Handler
// =========================================================
func ComicsHttpHandler(ctrl *KomikController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method == http.MethodGet {
			search := r.URL.Query().Get("search")
			if search == "" {
				search = r.URL.Query().Get("q")
			}
			kategori := r.URL.Query().Get("category")
			sortBy := r.URL.Query().Get("sort")

			list, err := ctrl.GetAllKomik(search, kategori, sortBy)
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "total": len(list), "data": list})
		} else if r.Method == http.MethodPost {
			body, _ := io.ReadAll(r.Body)
			defer r.Body.Close()
			var req struct {
				CreatorId   int    `json:"creator_id"`
				Title       string `json:"title"`
				Description string `json:"description"`
				Studio      string `json:"studio"`
				CategoryIds []int  `json:"category_ids"`
			}
			_ = json.Unmarshal(body, &req)
			newId, err := ctrl.CreateKomik(req.CreatorId, req.Title, req.Description, req.Studio, req.CategoryIds)
			if err != nil {
				sendJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			sendJSON(w, http.StatusCreated, map[string]interface{}{"success": true, "message": "Komik berhasil dibuat.", "id": newId})
		} else {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
		}
	}
}

// =========================================================
// Comics Detail Handler
// =========================================================
func ComicsDetailHttpHandler(ctrl *KomikController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		idStr := r.URL.Query().Get("id")
		id, _ := strconv.Atoi(idStr)

		if r.Method == http.MethodGet {
			if id <= 0 {
				sendJSONError(w, http.StatusBadRequest, "Parameter id wajib diisi.")
				return
			}
			komik, err := ctrl.GetKomikById(id)
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			if komik == nil {
				sendJSONError(w, http.StatusNotFound, "Komik tidak ditemukan.")
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": komik})
		} else if r.Method == http.MethodDelete {
			ok, err := ctrl.DeleteKomik(id)
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": ok, "message": "Komik berhasil dihapus."})
		} else {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
		}
	}
}

// =========================================================
// Reviews Handler
// =========================================================
func ReviewsHttpHandler(ctrl *KomentarRatingController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method == http.MethodGet {
			comicIdStr := r.URL.Query().Get("comic_id")
			comicId, _ := strconv.Atoi(comicIdStr)
			sort := r.URL.Query().Get("sort")
			list, err := ctrl.GetReviewsByComic(comicId, sort)
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "total": len(list), "data": list})
		} else if r.Method == http.MethodPost {
			body, _ := io.ReadAll(r.Body)
			defer r.Body.Close()
			var req struct {
				UserId  int     `json:"user_id"`
				ComicId int     `json:"comic_id"`
				Comment string  `json:"comment"`
				Rating  float64 `json:"rating"`
			}
			_ = json.Unmarshal(body, &req)
			ok, err := ctrl.AddReview(req.UserId, req.ComicId, req.Comment, req.Rating)
			if err != nil {
				sendJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			sendJSON(w, http.StatusCreated, map[string]interface{}{"success": ok, "message": "Ulasan dan rating berhasil dikirim!"})
		} else {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
		}
	}
}

// =========================================================
// Bookmarks Handler
// =========================================================
func BookmarksHttpHandler(ctrl *BookmarkHistoriController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method == http.MethodGet {
			userIdStr := r.URL.Query().Get("user_id")
			userId, _ := strconv.Atoi(userIdStr)
			list, err := ctrl.GetBookmarks(userId)
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "total": len(list), "data": list})
		} else if r.Method == http.MethodPost {
			body, _ := io.ReadAll(r.Body)
			defer r.Body.Close()
			var req struct {
				UserId  int `json:"user_id"`
				ComicId int `json:"comic_id"`
			}
			_ = json.Unmarshal(body, &req)
			ok, err := ctrl.AddBookmark(req.UserId, req.ComicId)
			if err != nil {
				sendJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			sendJSON(w, http.StatusCreated, map[string]interface{}{"success": ok, "message": "Komik berhasil ditambahkan ke bookmark."})
		} else if r.Method == http.MethodDelete {
			userIdStr := r.URL.Query().Get("user_id")
			comicIdStr := r.URL.Query().Get("comic_id")
			userId, _ := strconv.Atoi(userIdStr)
			comicId, _ := strconv.Atoi(comicIdStr)
			ok, err := ctrl.RemoveBookmark(userId, comicId)
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": ok, "message": "Bookmark berhasil dihapus."})
		} else {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
		}
	}
}

// =========================================================
// History Handler
// =========================================================
func HistoryHttpHandler(ctrl *BookmarkHistoriController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method == http.MethodGet {
			userIdStr := r.URL.Query().Get("user_id")
			userId, _ := strconv.Atoi(userIdStr)
			list, err := ctrl.GetHistori(userId)
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "total": len(list), "data": list})
		} else if r.Method == http.MethodPost {
			body, _ := io.ReadAll(r.Body)
			defer r.Body.Close()
			var req struct {
				UserId    int `json:"user_id"`
				ChapterId int `json:"chapter_id"`
			}
			_ = json.Unmarshal(body, &req)
			ok, err := ctrl.AddHistori(req.UserId, req.ChapterId)
			if err != nil {
				sendJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			sendJSON(w, http.StatusCreated, map[string]interface{}{"success": ok, "message": "Riwayat membaca berhasil dicatat."})
		} else {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
		}
	}
}

// =========================================================
// Payment Checkout & Process Handlers
// =========================================================
func PaymentCheckoutHttpHandler(ctrl *PembayaranController) http.HandlerFunc {
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

		body, _ := io.ReadAll(r.Body)
		defer r.Body.Close()
		var req struct {
			UserId        int     `json:"user_id"`
			PaymentMethod string  `json:"payment_method"`
			Amount        float64 `json:"amount"`
			AutoConfirm   bool    `json:"auto_confirm"`
		}
		_ = json.Unmarshal(body, &req)
		if req.Amount <= 0 {
			req.Amount = 30000.0
		}

		txId, err := ctrl.Checkout(req.UserId, req.PaymentMethod, req.Amount)
		if err != nil {
			sendJSONError(w, http.StatusBadRequest, err.Error())
			return
		}

		if req.AutoConfirm {
			_, _ = ctrl.ProcessPayment(txId, "Berhasil")
		}

		sendJSON(w, http.StatusCreated, map[string]interface{}{
			"success":        true,
			"message":        "Checkout berhasil dibuat.",
			"transaction_id": txId,
			"amount":         req.Amount,
		})
	}
}

func PaymentProcessHttpHandler(ctrl *PembayaranController) http.HandlerFunc {
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

		body, _ := io.ReadAll(r.Body)
		defer r.Body.Close()
		var req struct {
			TransactionId int    `json:"transaction_id"`
			Status        string `json:"status"`
		}
		_ = json.Unmarshal(body, &req)
		if req.Status == "" {
			req.Status = "Berhasil"
		}

		ok, err := ctrl.ProcessPayment(req.TransactionId, req.Status)
		if err != nil {
			sendJSONError(w, http.StatusBadRequest, err.Error())
			return
		}
		sendJSON(w, http.StatusOK, map[string]interface{}{
			"success": ok,
			"message": "Status pembayaran berhasil diproses.",
		})
	}
}

// =========================================================
// User & Admin Handlers
// =========================================================
func UserProfileHttpHandler(ctrl *UserController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method == http.MethodGet {
			email := r.URL.Query().Get("email")
			if email == "" {
				email = r.URL.Query().Get("username")
			}
			user, err := ctrl.GetUserProfile(email)
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			if user == nil {
				sendJSONError(w, http.StatusNotFound, "Pengguna tidak ditemukan.")
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": user})
		} else {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
		}
	}
}

func AdminUsersHttpHandler(ctrl *UserController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method == http.MethodGet {
			users, err := ctrl.GetAllUsers()
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "total": len(users), "data": users})
		} else {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
		}
	}
}

