package main

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// AnalysisHttpHandler implements the report/dashboard flow from the SRS.
// The current schema has no created_at column on pengguna or komik, so those
// totals are lifetime totals; transaction and review figures are period-scoped.
type AnalisisController struct{}

func NewAnalisisController() *AnalisisController { return &AnalisisController{} }

func (c *AnalisisController) Handler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		if r.Method != http.MethodGet {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
			return
		}

		now := time.Now()
		start := r.URL.Query().Get("start_date")
		end := r.URL.Query().Get("end_date")
		if start == "" {
			start = now.AddDate(0, 0, -30).Format("2006-01-02")
		}
		if end == "" {
			end = now.Format("2006-01-02")
		}
		startDate, err1 := time.Parse("2006-01-02", start)
		endDate, err2 := time.Parse("2006-01-02", end)
		if err1 != nil || err2 != nil || endDate.Before(startDate) {
			sendJSONError(w, http.StatusBadRequest, "Rentang tanggal tidak valid. Gunakan YYYY-MM-DD dan pastikan tanggal akhir tidak sebelum tanggal awal.")
			return
		}
		endExclusive := endDate.AddDate(0, 0, 1)

		conn, err := GetConnection()
		if err != nil {
			sendJSONError(w, http.StatusServiceUnavailable, "Koneksi database gagal.")
			return
		}

		var totalUsers, totalComics, totalReviews, totalTransactions int
		var successfulRevenue float64
		err = conn.QueryRow(`SELECT COUNT(*) FROM pengguna`).Scan(&totalUsers)
		if err == nil {
			err = conn.QueryRow(`SELECT COUNT(*) FROM komik`).Scan(&totalComics)
		}
		if err == nil {
			err = conn.QueryRow(`SELECT COUNT(*) FROM komentar_rating WHERE tanggal_komentar >= ? AND tanggal_komentar < ?`, startDate, endExclusive).Scan(&totalReviews)
		}
		if err == nil {
			err = conn.QueryRow(`SELECT COUNT(*), COALESCE(SUM(CASE WHEN status_pembayaran = 'Berhasil' THEN jumlah_bayar ELSE 0 END), 0) FROM transaksi WHERE tanggal_transaksi >= ? AND tanggal_transaksi < ?`, startDate, endExclusive).Scan(&totalTransactions, &successfulRevenue)
		}
		if err != nil {
			sendJSONError(w, http.StatusInternalServerError, "Gagal mengambil data laporan.")
			return
		}

		if strings.EqualFold(r.URL.Query().Get("format"), "csv") {
			w.Header().Set("Content-Type", "text/csv; charset=utf-8")
			w.Header().Set("Content-Disposition", `attachment; filename="comicid-report.csv"`)
			writer := csv.NewWriter(w)
			_ = writer.Write([]string{"metric", "value", "period_start", "period_end"})
			period := []string{start, end}
			_ = writer.Write([]string{"total_users_lifetime", strconv.Itoa(totalUsers), period[0], period[1]})
			_ = writer.Write([]string{"total_comics_lifetime", strconv.Itoa(totalComics), period[0], period[1]})
			_ = writer.Write([]string{"reviews_in_period", strconv.Itoa(totalReviews), period[0], period[1]})
			_ = writer.Write([]string{"transactions_in_period", strconv.Itoa(totalTransactions), period[0], period[1]})
			_ = writer.Write([]string{"successful_revenue_in_period", fmt.Sprintf("%.2f", successfulRevenue), period[0], period[1]})
			writer.Flush()
			return
		}

		sendJSON(w, http.StatusOK, map[string]interface{}{
			"success": true,
			"period":  map[string]string{"start_date": start, "end_date": end},
			"data": map[string]interface{}{
				"total_users_lifetime":         totalUsers,
				"total_comics_lifetime":        totalComics,
				"reviews_in_period":            totalReviews,
				"transactions_in_period":       totalTransactions,
				"successful_revenue_in_period": successfulRevenue,
			},
		})
	}
}

// RecommendationsHttpHandler returns comics sharing categories with the
// reader's reading history. If no reading history exists, it falls back to
// the highest-rated comics. Already-read comics are excluded.
func RecommendationsHttpHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		setCORSHeaders(w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		if r.Method != http.MethodGet {
			sendJSONError(w, http.StatusMethodNotAllowed, "Method tidak diizinkan.")
			return
		}
		userID, _ := strconv.Atoi(r.URL.Query().Get("user_id"))
		limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
		if limit <= 0 || limit > 20 {
			limit = 8
		}
		conn, err := GetConnection()
		if err != nil {
			sendJSONError(w, http.StatusServiceUnavailable, "Koneksi database gagal.")
			return
		}

		query := `SELECT k.id_komik, k.id_kreator, COALESCE(u.username, ''),
			k.nama_komik, COALESCE(k.deskripsi, ''), COALESCE(k.nama_studio, '-'),
			k.rating_rata_rata, (SELECT COUNT(*) FROM bab b WHERE b.id_komik=k.id_komik) AS total_bab
			FROM komik k LEFT JOIN pengguna u ON u.id_pengguna=k.id_kreator
			WHERE (? <= 0 OR k.id_komik NOT IN (
				SELECT rb.id_komik FROM histori_baca hb
				JOIN bab rb ON rb.id_bab=hb.id_bab WHERE hb.id_pengguna=?
			))
			ORDER BY
			CASE WHEN ? > 0 THEN (
				SELECT COUNT(*) FROM komik_kategori target
				WHERE target.id_komik=k.id_komik AND target.id_kategori IN (
					SELECT source.id_kategori
					FROM histori_baca hb
					JOIN bab read_bab ON read_bab.id_bab=hb.id_bab
					JOIN komik_kategori source ON source.id_komik=read_bab.id_komik
					WHERE hb.id_pengguna=?
				)
			) ELSE 0 END DESC,
			k.rating_rata_rata DESC, k.id_komik DESC
			LIMIT ?`
		rows, err := conn.Query(query, userID, userID, userID, userID, limit)
		if err != nil {
			sendJSONError(w, http.StatusInternalServerError, "Gagal mengambil rekomendasi komik.")
			return
		}
		defer rows.Close()
		items := make([]KomikDTO, 0)
		for rows.Next() {
			var item KomikDTO
			if err := rows.Scan(&item.IdKomik, &item.IdKreator, &item.NamaKreator, &item.NamaKomik, &item.Deskripsi, &item.NamaStudio, &item.RatingRataRata, &item.TotalChapters); err != nil {
				sendJSONError(w, http.StatusInternalServerError, "Gagal membaca rekomendasi komik.")
				return
			}
			item.Categories = []string{}
			items = append(items, item)
		}
		if err := rows.Err(); err != nil {
			sendJSONError(w, http.StatusInternalServerError, "Gagal membaca rekomendasi komik.")
			return
		}
		sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "total": len(items), "data": items})
	}
}

// LogoutHttpHandler completes the API side of the current frontend's
// client-managed logout flow. The present application stores login state in
// browser localStorage and does not issue server-side sessions or tokens.
func (c *UserController) LogoutHandler() http.HandlerFunc {
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
		sendJSON(w, http.StatusOK, map[string]interface{}{"success": true, "message": "Logout berhasil. Hapus status login pada browser."})
	}
}

// Compatibility wrappers for existing tests and integrations.
func AnalysisHttpHandler() http.HandlerFunc { return NewAnalisisController().Handler() }
func LogoutHttpHandler() http.HandlerFunc   { return NewUserController().LogoutHandler() }
