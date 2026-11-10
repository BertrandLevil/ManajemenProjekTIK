package main

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"
)

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

func CategoriesDetailHttpHandler(ctrl *KategoriController) http.HandlerFunc {
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
			kat, err := ctrl.GetKategoriById(id)
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			if kat == nil {
				sendJSONError(w, http.StatusNotFound, "Kategori tidak ditemukan.")
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": kat})
		} else if r.Method == http.MethodPut {
			body, _ := io.ReadAll(r.Body)
			defer r.Body.Close()
			var req struct {
				Id   int    `json:"id"`
				Name string `json:"name"`
			}
			_ = json.Unmarshal(body, &req)
			if req.Id <= 0 {
				req.Id = id
			}
			ok, err := ctrl.UpdateKategori(req.Id, req.Name)
			if err != nil {
				sendJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": ok, "message": "Kategori berhasil diperbarui."})
		} else if r.Method == http.MethodDelete {
			ok, err := ctrl.DeleteKategori(id)
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": ok, "message": "Kategori berhasil dihapus."})
		} else {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
		}
	}
}

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

func ChaptersDetailHttpHandler(ctrl *BabController) http.HandlerFunc {
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
			bab, err := ctrl.GetBabDetail(id)
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			if bab == nil {
				sendJSONError(w, http.StatusNotFound, "Bab tidak ditemukan.")
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": bab})
		} else if r.Method == http.MethodPut {
			body, _ := io.ReadAll(r.Body)
			defer r.Body.Close()
			var req struct {
				Id            int    `json:"id"`
				ChapterNumber int    `json:"chapter_number"`
				ReleaseDate   string `json:"release_date"`
			}
			_ = json.Unmarshal(body, &req)
			if req.Id <= 0 {
				req.Id = id
			}
			ok, err := ctrl.UpdateBab(req.Id, req.ChapterNumber, req.ReleaseDate)
			if err != nil {
				sendJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": ok, "message": "Bab berhasil diperbarui."})
		} else if r.Method == http.MethodDelete {
			ok, err := ctrl.DeleteBab(id)
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": ok, "message": "Bab berhasil dihapus."})
		} else {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
		}
	}
}

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
		} else if r.Method == http.MethodPut {
			body, _ := io.ReadAll(r.Body)
			defer r.Body.Close()
			var req struct {
				Id          int    `json:"id"`
				CreatorId   int    `json:"creator_id"`
				Title       string `json:"title"`
				Description string `json:"description"`
				Studio      string `json:"studio"`
				CategoryIds []int  `json:"category_ids"`
			}
			_ = json.Unmarshal(body, &req)
			if req.Id <= 0 {
				req.Id = id
			}
			ok, err := ctrl.UpdateKomik(req.Id, req.CreatorId, req.Title, req.Description, req.Studio, req.CategoryIds)
			if err != nil {
				sendJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": ok, "message": "Komik berhasil diperbarui."})
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

func ComicsVerifyHttpHandler(ctrl *KomikController) http.HandlerFunc {
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
			ComicId int `json:"comic_id"`
			AdminId int `json:"admin_id"`
		}
		_ = json.Unmarshal(body, &req)

		ok, err := ctrl.VerifyKomik(req.ComicId, req.AdminId)
		if err != nil {
			sendJSONError(w, http.StatusForbidden, err.Error())
			return
		}
		sendJSON(w, http.StatusOK, map[string]interface{}{"success": ok, "message": "Komik berhasil diverifikasi oleh Admin."})
	}
}

func ComicsStatsHttpHandler(ctrl *KomikController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		comicIdStr := r.URL.Query().Get("id")
		creatorIdStr := r.URL.Query().Get("creator_id")

		if comicIdStr != "" {
			cId, _ := strconv.Atoi(comicIdStr)
			stats, err := ctrl.GetKomikStats(cId)
			if err != nil {
				sendJSONError(w, http.StatusNotFound, "Komik tidak ditemukan.")
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": stats})
			return
		} else if creatorIdStr != "" {
			crId, _ := strconv.Atoi(creatorIdStr)
			stats, err := ctrl.GetAuthorStats(crId)
			if err != nil {
				sendJSONError(w, http.StatusNotFound, "Kreator tidak ditemukan.")
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": stats})
			return
		}

		sendJSONError(w, http.StatusBadRequest, "Parameter id atau creator_id wajib disertakan.")
	}
}

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

func ReviewsDetailHttpHandler(ctrl *KomentarRatingController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method != http.MethodDelete {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
			return
		}

		idStr := r.URL.Query().Get("id")
		id, _ := strconv.Atoi(idStr)
		userIdStr := r.URL.Query().Get("user_id")
		userId, _ := strconv.Atoi(userIdStr)
		role := r.URL.Query().Get("role")

		ok, err := ctrl.DeleteReview(id, userId, role)
		if err != nil {
			sendJSONError(w, http.StatusBadRequest, err.Error())
			return
		}
		sendJSON(w, http.StatusOK, map[string]interface{}{"success": ok, "message": "Ulasan berhasil dihapus."})
	}
}

func AuthorReviewsHttpHandler(ctrl *KomentarRatingController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		creatorIdStr := r.URL.Query().Get("creator_id")
		creatorId, _ := strconv.Atoi(creatorIdStr)
		if creatorId <= 0 {
			sendJSONError(w, http.StatusBadRequest, "creator_id wajib disertakan.")
			return
		}

		list, err := ctrl.GetReviewsForAuthor(creatorId)
		if err != nil {
			sendJSONError(w, http.StatusInternalServerError, err.Error())
			return
		}
		sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "total": len(list), "data": list})
	}
}

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
		} else if r.Method == http.MethodDelete {
			idStr := r.URL.Query().Get("id")
			userIdStr := r.URL.Query().Get("user_id")
			id, _ := strconv.Atoi(idStr)
			userId, _ := strconv.Atoi(userIdStr)
			ok, err := ctrl.DeleteHistori(id, userId)
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": ok, "message": "Riwayat berhasil dihapus."})
		} else {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
		}
	}
}

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
			Email         string  `json:"email"`
			PaymentMethod string  `json:"payment_method"`
			Amount        float64 `json:"amount"`
			AutoConfirm   bool    `json:"auto_confirm"`
		}
		_ = json.Unmarshal(body, &req)
		if req.Amount <= 0 {
			req.Amount = 30000.0
		}

		userId := req.UserId
		if userId <= 0 && req.Email != "" {
			if id, err := ctrl.GetUserIdByEmail(req.Email); err == nil && id > 0 {
				userId = id
			}
		}

		txId, err := ctrl.Checkout(userId, req.PaymentMethod, req.Amount)
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

func UserTransactionsHttpHandler(ctrl *PembayaranController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		userIdStr := r.URL.Query().Get("user_id")
		userId, _ := strconv.Atoi(userIdStr)
		if userId <= 0 {
			sendJSONError(w, http.StatusBadRequest, "user_id wajib disertakan.")
			return
		}

		list, err := ctrl.GetUserTransactions(userId)
		if err != nil {
			sendJSONError(w, http.StatusInternalServerError, err.Error())
			return
		}
		sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "total": len(list), "data": list})
	}
}

func AdminTransactionsHttpHandler(ctrl *PembayaranController) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		if r.Method == http.MethodGet {
			list, err := ctrl.GetAllTransactions()
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "total": len(list), "data": list})
		} else if r.Method == http.MethodPut {
			body, _ := io.ReadAll(r.Body)
			defer r.Body.Close()
			var req struct {
				TransactionId int    `json:"transaction_id"`
				Status        string `json:"status"`
			}
			_ = json.Unmarshal(body, &req)
			ok, err := ctrl.ProcessPayment(req.TransactionId, req.Status)
			if err != nil {
				sendJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": ok, "message": "Status transaksi berhasil diubah oleh Admin."})
		} else {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
		}
	}
}

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
			idStr := r.URL.Query().Get("id")

			var (
				user *UserDTO
				err  error
			)

			if idStr != "" {
				id, _ := strconv.Atoi(idStr)
				user, err = ctrl.GetUserById(id)
			} else if email != "" {
				user, err = ctrl.GetUserProfile(email)
			} else {
				sendJSONError(w, http.StatusBadRequest, "Parameter email atau id wajib disertakan.")
				return
			}

			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			if user == nil {
				sendJSONError(w, http.StatusNotFound, "Pengguna tidak ditemukan.")
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "data": user})
		} else if r.Method == http.MethodPut {
			body, _ := io.ReadAll(r.Body)
			defer r.Body.Close()
			var req struct {
				Id       int    `json:"id"`
				Username string `json:"username"`
				Email    string `json:"email"`
				Password string `json:"password"`
			}
			_ = json.Unmarshal(body, &req)
			ok, err := ctrl.UpdateProfile(req.Id, req.Username, req.Email, req.Password)
			if err != nil {
				sendJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": ok, "message": "Profil berhasil diperbarui."})
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
		} else if r.Method == http.MethodPost {
			body, _ := io.ReadAll(r.Body)
			defer r.Body.Close()
			var req struct {
				Username  string `json:"username"`
				Email     string `json:"email"`
				Password  string `json:"password"`
				Role      string `json:"role"`
				IsPremium bool   `json:"is_premium"`
			}
			_ = json.Unmarshal(body, &req)
			ok, err := ctrl.CreateUserByAdmin(req.Username, req.Email, req.Password, req.Role, req.IsPremium)
			if err != nil {
				sendJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			sendJSON(w, http.StatusCreated, map[string]interface{}{"success": ok, "message": "Pengguna berhasil ditambahkan oleh Admin."})
		} else if r.Method == http.MethodPut {
			body, _ := io.ReadAll(r.Body)
			defer r.Body.Close()
			var req struct {
				Id        int    `json:"id"`
				Username  string `json:"username"`
				Email     string `json:"email"`
				Role      string `json:"role"`
				IsPremium *bool  `json:"is_premium"`
				Password  string `json:"password"`
			}
			_ = json.Unmarshal(body, &req)
			ok, err := ctrl.UpdateUserByAdmin(req.Id, req.Username, req.Email, req.Role, req.IsPremium, req.Password)
			if err != nil {
				sendJSONError(w, http.StatusBadRequest, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": ok, "message": "Data pengguna berhasil diperbarui."})
		} else if r.Method == http.MethodDelete {
			idStr := r.URL.Query().Get("id")
			id, _ := strconv.Atoi(idStr)
			ok, err := ctrl.DeleteUserByAdmin(id)
			if err != nil {
				sendJSONError(w, http.StatusInternalServerError, err.Error())
				return
			}
			sendJSON(w, http.StatusOK, map[string]interface{}{"success": ok, "message": "Pengguna berhasil dihapus."})
		} else {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
		}
	}
}
