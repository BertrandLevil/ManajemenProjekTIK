package main

import (
	"database/sql"
	"errors"
	"strings"
	"time"
)

type KategoriController struct{}

func NewKategoriController() *KategoriController {
	return &KategoriController{}
}

func (c *KategoriController) GetAllKategori() ([]KategoriModel, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	rows, err := conn.Query("SELECT id_kategori, nama_kategori FROM kategori ORDER BY id_kategori ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]KategoriModel, 0)
	for rows.Next() {
		var k KategoriModel
		if err := rows.Scan(&k.IdKategori, &k.NamaKategori); err != nil {
			return nil, err
		}
		list = append(list, k)
	}
	return list, nil
}

func (c *KategoriController) GetKategoriById(id int) (*KategoriModel, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	var k KategoriModel
	err = conn.QueryRow("SELECT id_kategori, nama_kategori FROM kategori WHERE id_kategori = ?", id).Scan(&k.IdKategori, &k.NamaKategori)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &k, nil
}

func (c *KategoriController) CreateKategori(nama string) (bool, error) {
	nama = strings.TrimSpace(nama)
	if nama == "" {
		return false, errors.New("Nama kategori tidak boleh kosong.")
	}

	conn, err := GetConnection()
	if err != nil {
		return false, err
	}

	var existingId int
	err = conn.QueryRow("SELECT id_kategori FROM kategori WHERE LOWER(nama_kategori) = LOWER(?)", nama).Scan(&existingId)
	if err == nil {
		return false, errors.New("Nama kategori sudah ada.")
	} else if !errors.Is(err, sql.ErrNoRows) {
		return false, err
	}

	_, err = conn.Exec("INSERT INTO kategori (nama_kategori) VALUES (?)", nama)
	return err == nil, err
}

func (c *KategoriController) UpdateKategori(id int, nama string) (bool, error) {
	nama = strings.TrimSpace(nama)
	if nama == "" {
		return false, errors.New("Nama kategori tidak boleh kosong.")
	}

	conn, err := GetConnection()
	if err != nil {
		return false, err
	}

	res, err := conn.Exec("UPDATE kategori SET nama_kategori = ? WHERE id_kategori = ?", nama, id)
	if err != nil {
		return false, err
	}
	ra, _ := res.RowsAffected()
	return ra > 0, nil
}

func (c *KategoriController) DeleteKategori(id int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		return false, err
	}
	res, err := conn.Exec("DELETE FROM kategori WHERE id_kategori = ?", id)
	if err != nil {
		return false, err
	}
	rowsAffected, _ := res.RowsAffected()
	return rowsAffected > 0, nil
}

type BabController struct{}

func NewBabController() *BabController {
	return &BabController{}
}

func (c *BabController) GetBabByKomik(idKomik int) ([]BabDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	query := `SELECT
                b.id_bab,
                b.id_komik,
                b.nomor_bab,
                b.tanggal_rilis,
                k.nama_komik,
                b.file_path
              FROM bab b
              JOIN komik k ON b.id_komik = k.id_komik
              WHERE b.id_komik = ?
              ORDER BY b.nomor_bab ASC`

	rows, err := conn.Query(query, idKomik)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]BabDTO, 0)

	for rows.Next() {
		var b BabDTO

		if err := rows.Scan(
			&b.IdBab,
			&b.IdKomik,
			&b.NomorBab,
			&b.TanggalRilis,
			&b.NamaKomik,
			&b.FilePath,
		); err != nil {
			return nil, err
		}

		list = append(list, b)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return list, nil
}

func (c *BabController) GetBabDetail(idBab int) (*BabDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	query := `SELECT
                b.id_bab,
                b.id_komik,
                b.nomor_bab,
                b.tanggal_rilis,
                k.nama_komik,
                b.file_path
              FROM bab b
              JOIN komik k ON b.id_komik = k.id_komik
              WHERE b.id_bab = ?`

	var b BabDTO

	err = conn.QueryRow(query, idBab).Scan(
		&b.IdBab,
		&b.IdKomik,
		&b.NomorBab,
		&b.TanggalRilis,
		&b.NamaKomik,
		&b.FilePath,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &b, nil
}

func (c *BabController) CreateBab(idKomik, nomorBab int, tanggalRilis string) (bool, error) {
	if idKomik <= 0 || nomorBab <= 0 {
		return false, errors.New("ID Komik dan nomor bab harus lebih dari 0.")
	}

	conn, err := GetConnection()
	if err != nil {
		return false, err
	}

	var existingId int
	err = conn.QueryRow("SELECT id_bab FROM bab WHERE id_komik = ? AND nomor_bab = ?", idKomik, nomorBab).Scan(&existingId)
	if err == nil {
		return false, errors.New("Nomor bab sudah ada pada komik ini.")
	}

	if strings.TrimSpace(tanggalRilis) == "" {
		tanggalRilis = time.Now().Format("2006-01-02")
	}

	_, err = conn.Exec("INSERT INTO bab (id_komik, nomor_bab, tanggal_rilis) VALUES (?, ?, ?)", idKomik, nomorBab, tanggalRilis)
	return err == nil, err
}

func (c *BabController) UpdateBab(idBab, nomorBab int, tanggalRilis string) (bool, error) {
	if idBab <= 0 || nomorBab <= 0 {
		return false, errors.New("ID Bab dan nomor bab tidak valid.")
	}

	conn, err := GetConnection()
	if err != nil {
		return false, err
	}

	res, err := conn.Exec("UPDATE bab SET nomor_bab = ?, tanggal_rilis = ? WHERE id_bab = ?", nomorBab, tanggalRilis, idBab)
	if err != nil {
		return false, err
	}
	ra, _ := res.RowsAffected()
	return ra > 0, nil
}

func (c *BabController) DeleteBab(idBab int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		return false, err
	}
	res, err := conn.Exec("DELETE FROM bab WHERE id_bab = ?", idBab)
	if err != nil {
		return false, err
	}
	rowsAffected, _ := res.RowsAffected()
	return rowsAffected > 0, nil
}

type KomikController struct{}

func NewKomikController() *KomikController {
	return &KomikController{}
}

func (c *KomikController) GetAllKomik(search, kategori, sortBy string) ([]KomikDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	sqlQuery := `SELECT k.id_komik, k.id_kreator, COALESCE(u.username, '') AS nama_kreator,
                 k.nama_komik, COALESCE(k.deskripsi, '') AS deskripsi,
                 COALESCE(k.nama_studio, '-') AS nama_studio, k.rating_rata_rata,
                 (SELECT COUNT(*) FROM bab b WHERE b.id_komik = k.id_komik) AS total_bab
                 FROM komik k
                 LEFT JOIN pengguna u ON k.id_kreator = u.id_pengguna
                 WHERE 1=1 `

	var params []interface{}

	if strings.TrimSpace(search) != "" {
		sqlQuery += "AND (LOWER(k.nama_komik) LIKE LOWER(?) OR LOWER(k.deskripsi) LIKE LOWER(?) OR LOWER(k.nama_studio) LIKE LOWER(?)) "
		pat := "%" + strings.TrimSpace(search) + "%"
		params = append(params, pat, pat, pat)
	}

	if strings.TrimSpace(kategori) != "" {
		sqlQuery += `AND k.id_komik IN (
            SELECT kk.id_komik FROM komik_kategori kk
            JOIN kategori kat ON kk.id_kategori = kat.id_kategori
            WHERE LOWER(kat.nama_kategori) = LOWER(?) OR kk.id_kategori = ?
        ) `
		params = append(params, strings.TrimSpace(kategori), strings.TrimSpace(kategori))
	}

	if sortBy == "rating" || sortBy == "popular" {
		sqlQuery += "ORDER BY k.rating_rata_rata DESC, k.id_komik DESC"
	} else if sortBy == "title" || sortBy == "az" {
		sqlQuery += "ORDER BY k.nama_komik ASC"
	} else {
		sqlQuery += "ORDER BY k.id_komik DESC"
	}

	rows, err := conn.Query(sqlQuery, params...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]KomikDTO, 0)
	for rows.Next() {
		var k KomikDTO
		if err := rows.Scan(&k.IdKomik, &k.IdKreator, &k.NamaKreator, &k.NamaKomik, &k.Deskripsi, &k.NamaStudio, &k.RatingRataRata, &k.TotalChapters); err != nil {
			return nil, err
		}
		k.Categories = make([]string, 0)
		list = append(list, k)
	}

	for i := range list {
		catRows, err := conn.Query(`SELECT kat.nama_kategori FROM komik_kategori kk
                                    JOIN kategori kat ON kk.id_kategori = kat.id_kategori
                                    WHERE kk.id_komik = ?`, list[i].IdKomik)
		if err == nil {
			for catRows.Next() {
				var catName string
				_ = catRows.Scan(&catName)
				list[i].Categories = append(list[i].Categories, catName)
			}
			catRows.Close()
		}
	}

	return list, nil
}

func (c *KomikController) GetKomikById(id int) (*KomikDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	sqlQuery := `SELECT k.id_komik, k.id_kreator, COALESCE(u.username, '') AS nama_kreator,
                 k.nama_komik, COALESCE(k.deskripsi, '') AS deskripsi,
                 COALESCE(k.nama_studio, '-') AS nama_studio, k.rating_rata_rata,
                 (SELECT COUNT(*) FROM bab b WHERE b.id_komik = k.id_komik) AS total_bab
                 FROM komik k
                 LEFT JOIN pengguna u ON k.id_kreator = u.id_pengguna
                 WHERE k.id_komik = ?`

	var k KomikDTO
	err = conn.QueryRow(sqlQuery, id).Scan(
		&k.IdKomik, &k.IdKreator, &k.NamaKreator, &k.NamaKomik, &k.Deskripsi, &k.NamaStudio, &k.RatingRataRata, &k.TotalChapters,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	k.Categories = make([]string, 0)
	catRows, err := conn.Query(`SELECT kat.nama_kategori FROM komik_kategori kk
                                JOIN kategori kat ON kk.id_kategori = kat.id_kategori
                                WHERE kk.id_komik = ?`, id)
	if err == nil {
		for catRows.Next() {
			var catName string
			_ = catRows.Scan(&catName)
			k.Categories = append(k.Categories, catName)
		}
		catRows.Close()
	}

	return &k, nil
}

func (c *KomikController) CreateKomik(idKreator int, title, desc, studio string, catIds []int) (int, error) {
	title = strings.TrimSpace(title)
	if title == "" {
		return 0, errors.New("Judul komik tidak boleh kosong.")
	}

	conn, err := GetConnection()
	if err != nil {
		return 0, err
	}

	res, err := conn.Exec("INSERT INTO komik (id_kreator, nama_komik, deskripsi, nama_studio, rating_rata_rata) VALUES (?, ?, ?, ?, 0.00)",
		idKreator, title, desc, studio)
	if err != nil {
		return 0, err
	}

	newId, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}

	for _, cid := range catIds {
		if cid > 0 {
			_, _ = conn.Exec("INSERT IGNORE INTO komik_kategori (id_komik, id_kategori) VALUES (?, ?)", newId, cid)
		}
	}

	return int(newId), nil
}

func (c *KomikController) UpdateKomik(idKomik, idKreator int, title, desc, studio string, catIds []int) (bool, error) {
	title = strings.TrimSpace(title)
	if title == "" {
		return false, errors.New("Judul komik tidak boleh kosong.")
	}

	conn, err := GetConnection()
	if err != nil {
		return false, err
	}

	res, err := conn.Exec("UPDATE komik SET nama_komik = ?, deskripsi = ?, nama_studio = ? WHERE id_komik = ?",
		title, desc, studio, idKomik)
	if err != nil {
		return false, err
	}

	if len(catIds) > 0 {
		_, _ = conn.Exec("DELETE FROM komik_kategori WHERE id_komik = ?", idKomik)
		for _, cid := range catIds {
			if cid > 0 {
				_, _ = conn.Exec("INSERT IGNORE INTO komik_kategori (id_komik, id_kategori) VALUES (?, ?)", idKomik, cid)
			}
		}
	}

	ra, _ := res.RowsAffected()
	return ra > 0, nil
}

func (c *KomikController) DeleteKomik(id int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		return false, err
	}
	res, err := conn.Exec("DELETE FROM komik WHERE id_komik = ?", id)
	if err != nil {
		return false, err
	}
	ra, _ := res.RowsAffected()
	return ra > 0, nil
}

func (c *KomikController) VerifyKomik(comicId, adminId int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		return false, err
	}

	var role string
	err = conn.QueryRow("SELECT role FROM pengguna WHERE id_pengguna = ?", adminId).Scan(&role)
	if err != nil {
		return false, errors.New("Admin tidak ditemukan.")
	}
	if role != "Admin" {
		return false, errors.New("Hanya admin yang dapat memverifikasi komik.")
	}
	return true, nil
}

func (c *KomikController) GetKomikStats(comicId int) (map[string]interface{}, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	query := `SELECT k.nama_komik, k.rating_rata_rata,
              (SELECT COUNT(*) FROM bab WHERE id_komik = k.id_komik) AS total_bab,
              (SELECT COUNT(*) FROM komentar_rating WHERE id_komik = k.id_komik) AS total_komentar,
              (SELECT COUNT(*) FROM bookmark WHERE id_komik = k.id_komik) AS total_bookmark
              FROM komik k WHERE k.id_komik = ?`

	var (
		title         string
		rating        float64
		totalBab      int
		totalKomentar int
		totalBookmark int
	)

	err = conn.QueryRow(query, comicId).Scan(&title, &rating, &totalBab, &totalKomentar, &totalBookmark)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"comic_id":        comicId,
		"title":           title,
		"rating":          rating,
		"total_chapters":  totalBab,
		"total_comments":  totalKomentar,
		"total_bookmarks": totalBookmark,
	}, nil
}

func (c *KomikController) GetAuthorStats(creatorId int) (map[string]interface{}, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	query := `SELECT COUNT(*) AS total_komik, COALESCE(AVG(rating_rata_rata), 0) AS avg_rating
              FROM komik WHERE id_kreator = ?`

	var (
		totalKomik int
		avgRating  float64
	)
	err = conn.QueryRow(query, creatorId).Scan(&totalKomik, &avgRating)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"creator_id":     creatorId,
		"total_comics":   totalKomik,
		"average_rating": avgRating,
	}, nil
}

type KomentarRatingController struct{}

func NewKomentarRatingController() *KomentarRatingController {
	return &KomentarRatingController{}
}

func (c *KomentarRatingController) GetReviewsByComic(comicId int, sort string) ([]ReviewDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	query := `SELECT kr.id_ulasan, kr.id_pengguna, u.username, kr.id_komik, k.nama_komik,
              kr.isi_komentar, kr.nilai_rating, kr.tanggal_komentar
              FROM komentar_rating kr
              JOIN pengguna u ON kr.id_pengguna = u.id_pengguna
              JOIN komik k ON kr.id_komik = k.id_komik
              WHERE kr.id_komik = ? `

	if sort == "oldest" {
		query += "ORDER BY kr.tanggal_komentar ASC"
	} else if sort == "highest" {
		query += "ORDER BY kr.nilai_rating DESC"
	} else {
		query += "ORDER BY kr.tanggal_komentar DESC"
	}

	rows, err := conn.Query(query, comicId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]ReviewDTO, 0)
	for rows.Next() {
		var r ReviewDTO
		if err := rows.Scan(&r.IdUlasan, &r.IdPengguna, &r.Username, &r.IdKomik, &r.NamaKomik, &r.IsiKomentar, &r.NilaiRating, &r.TanggalKomentar); err != nil {
			return nil, err
		}
		list = append(list, r)
	}
	return list, nil
}

func (c *KomentarRatingController) GetReviewsForAuthor(creatorId int) ([]ReviewDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	query := `SELECT kr.id_ulasan, kr.id_pengguna, u.username, kr.id_komik, k.nama_komik,
              kr.isi_komentar, kr.nilai_rating, kr.tanggal_komentar
              FROM komentar_rating kr
              JOIN pengguna u ON kr.id_pengguna = u.id_pengguna
              JOIN komik k ON kr.id_komik = k.id_komik
              WHERE k.id_kreator = ?
              ORDER BY kr.tanggal_komentar DESC`

	rows, err := conn.Query(query, creatorId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]ReviewDTO, 0)
	for rows.Next() {
		var r ReviewDTO
		if err := rows.Scan(&r.IdUlasan, &r.IdPengguna, &r.Username, &r.IdKomik, &r.NamaKomik, &r.IsiKomentar, &r.NilaiRating, &r.TanggalKomentar); err != nil {
			return nil, err
		}
		list = append(list, r)
	}
	return list, nil
}

func (c *KomentarRatingController) AddReview(idPengguna, idKomik int, isi string, rating float64) (bool, error) {
	if idPengguna <= 0 || idKomik <= 0 {
		return false, errors.New("idPengguna dan idKomik harus lebih dari 0.")
	}
	if strings.TrimSpace(isi) == "" {
		return false, errors.New("Isi komentar tidak boleh kosong.")
	}

	conn, err := GetConnection()
	if err != nil {
		return false, err
	}

	_, err = conn.Exec("INSERT INTO komentar_rating (id_pengguna, id_komik, isi_komentar, nilai_rating, tanggal_komentar) VALUES (?, ?, ?, ?, NOW())",
		idPengguna, idKomik, isi, rating)
	if err != nil {
		return false, err
	}

	_, _ = conn.Exec(`UPDATE komik SET rating_rata_rata = (
        SELECT COALESCE(AVG(nilai_rating), 0.0) FROM komentar_rating WHERE id_komik = ?
    ) WHERE id_komik = ?`, idKomik, idKomik)

	return true, nil
}

func (c *KomentarRatingController) DeleteReview(idUlasan, idPengguna int, role string) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		return false, err
	}

	var comicId, ownerId int
	err = conn.QueryRow("SELECT id_komik, id_pengguna FROM komentar_rating WHERE id_ulasan = ?", idUlasan).Scan(&comicId, &ownerId)
	if err != nil {
		return false, err
	}

	if role != "Admin" && ownerId != idPengguna {
		return false, errors.New("Anda tidak memiliki hak akses untuk menghapus ulasan ini.")
	}

	res, err := conn.Exec("DELETE FROM komentar_rating WHERE id_ulasan = ?", idUlasan)
	if err != nil {
		return false, err
	}

	_, _ = conn.Exec(`UPDATE komik SET rating_rata_rata = (
        SELECT COALESCE(AVG(nilai_rating), 0.0) FROM komentar_rating WHERE id_komik = ?
    ) WHERE id_komik = ?`, comicId, comicId)

	ra, _ := res.RowsAffected()
	return ra > 0, nil
}

type BookmarkHistoriController struct{}

func NewBookmarkHistoriController() *BookmarkHistoriController {
	return &BookmarkHistoriController{}
}

func (c *BookmarkHistoriController) GetBookmarks(userId int) ([]BookmarkDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	query := `SELECT b.id_bookmark, b.id_pengguna, b.id_komik, k.nama_komik,
              COALESCE(k.nama_studio, '-'), k.rating_rata_rata, b.tanggal_ditambahkan
              FROM bookmark b
              JOIN komik k ON b.id_komik = k.id_komik
              WHERE b.id_pengguna = ?
              ORDER BY b.tanggal_ditambahkan DESC`

	rows, err := conn.Query(query, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]BookmarkDTO, 0)
	for rows.Next() {
		var b BookmarkDTO
		if err := rows.Scan(&b.IdBookmark, &b.IdPengguna, &b.IdKomik, &b.NamaKomik, &b.NamaStudio, &b.RatingRataRata, &b.TanggalDitambahkan); err != nil {
			return nil, err
		}
		list = append(list, b)
	}
	return list, nil
}

func (c *BookmarkHistoriController) AddBookmark(userId, comicId int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		return false, err
	}

	_, err = conn.Exec("INSERT IGNORE INTO bookmark (id_pengguna, id_komik, tanggal_ditambahkan) VALUES (?, ?, NOW())", userId, comicId)
	return err == nil, err
}

func (c *BookmarkHistoriController) RemoveBookmark(userId, comicId int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		return false, err
	}
	res, err := conn.Exec("DELETE FROM bookmark WHERE id_pengguna = ? AND id_komik = ?", userId, comicId)
	if err != nil {
		return false, err
	}
	ra, _ := res.RowsAffected()
	return ra > 0, nil
}

func (c *BookmarkHistoriController) AddHistori(userId, chapterId int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		return false, err
	}
	_, err = conn.Exec("INSERT INTO histori_baca (id_pengguna, id_bab, tanggal_baca) VALUES (?, ?, NOW())", userId, chapterId)
	return err == nil, err
}

func (c *BookmarkHistoriController) GetHistori(userId int) ([]HistoriDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	query := `SELECT h.id_histori, h.id_pengguna, h.id_bab, b.nomor_bab,
              k.id_komik, k.nama_komik, h.tanggal_baca
              FROM histori_baca h
              JOIN bab b ON h.id_bab = b.id_bab
              JOIN komik k ON b.id_komik = k.id_komik
              WHERE h.id_pengguna = ?
              ORDER BY h.tanggal_baca DESC`

	rows, err := conn.Query(query, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]HistoriDTO, 0)
	for rows.Next() {
		var h HistoriDTO
		if err := rows.Scan(&h.IdHistori, &h.IdPengguna, &h.IdBab, &h.NomorBab, &h.IdKomik, &h.NamaKomik, &h.TanggalBaca); err != nil {
			return nil, err
		}
		list = append(list, h)
	}
	return list, nil
}

func (c *BookmarkHistoriController) DeleteHistori(idHistori, userId int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		return false, err
	}
	res, err := conn.Exec("DELETE FROM histori_baca WHERE id_histori = ? AND id_pengguna = ?", idHistori, userId)
	if err != nil {
		return false, err
	}
	ra, _ := res.RowsAffected()
	return ra > 0, nil
}

type PembayaranController struct{}

func NewPembayaranController() *PembayaranController {
	return &PembayaranController{}
}

func (c *PembayaranController) GetUserIdByEmail(email string) (int, error) {
	conn, err := GetConnection()
	if err != nil {
		return 0, err
	}
	var id int
	err = conn.QueryRow("SELECT id_pengguna FROM pengguna WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)", email, email).Scan(&id)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func (c *PembayaranController) Checkout(userId int, method string, amount float64) (int, error) {
	conn, err := GetConnection()
	if err != nil {
		return 0, err
	}

	res, err := conn.Exec("INSERT INTO transaksi (id_pengguna, metode_pembayaran, status_pembayaran, jumlah_bayar, tanggal_transaksi) VALUES (?, ?, 'Menunggu', ?, NOW())",
		userId, method, amount)
	if err != nil {
		return 0, err
	}
	id, err := res.LastInsertId()
	return int(id), err
}

func (c *PembayaranController) ProcessPayment(txId int, status string) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		return false, err
	}

	if status != "Berhasil" {
		status = "Gagal"
	}

	var userId int
	err = conn.QueryRow("SELECT id_pengguna FROM transaksi WHERE id_transaksi = ?", txId).Scan(&userId)
	if err != nil {
		return false, err
	}

	_, err = conn.Exec("UPDATE transaksi SET status_pembayaran = ? WHERE id_transaksi = ?", status, txId)
	if err != nil {
		return false, err
	}

	if status == "Berhasil" {
		_, _ = conn.Exec("UPDATE pengguna SET is_premium = 1 WHERE id_pengguna = ?", userId)
	}

	return true, nil
}

func (c *PembayaranController) GetUserTransactions(userId int) ([]TransaksiDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	query := `SELECT t.id_transaksi, t.id_pengguna, u.username, u.email,
              t.metode_pembayaran, t.status_pembayaran, t.jumlah_bayar, t.tanggal_transaksi
              FROM transaksi t
              JOIN pengguna u ON t.id_pengguna = u.id_pengguna
              WHERE t.id_pengguna = ?
              ORDER BY t.tanggal_transaksi DESC`

	rows, err := conn.Query(query, userId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]TransaksiDTO, 0)
	for rows.Next() {
		var t TransaksiDTO
		if err := rows.Scan(&t.IdTransaksi, &t.IdPengguna, &t.Username, &t.Email, &t.MetodePembayaran, &t.StatusPembayaran, &t.JumlahBayar, &t.TanggalTransaksi); err != nil {
			return nil, err
		}
		list = append(list, t)
	}
	return list, nil
}

func (c *PembayaranController) GetAllTransactions() ([]TransaksiDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	query := `SELECT t.id_transaksi, t.id_pengguna, u.username, u.email,
              t.metode_pembayaran, t.status_pembayaran, t.jumlah_bayar, t.tanggal_transaksi
              FROM transaksi t
              JOIN pengguna u ON t.id_pengguna = u.id_pengguna
              ORDER BY t.tanggal_transaksi DESC`

	rows, err := conn.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]TransaksiDTO, 0)
	for rows.Next() {
		var t TransaksiDTO
		if err := rows.Scan(&t.IdTransaksi, &t.IdPengguna, &t.Username, &t.Email, &t.MetodePembayaran, &t.StatusPembayaran, &t.JumlahBayar, &t.TanggalTransaksi); err != nil {
			return nil, err
		}
		list = append(list, t)
	}
	return list, nil
}

type UserController struct{}

func NewUserController() *UserController {
	return &UserController{}
}

func (c *UserController) GetUserProfile(emailOrUsername string) (*UserDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	query := `SELECT id_pengguna, username, email, role, is_premium
              FROM pengguna WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)`

	var (
		u         UserDTO
		isPremium int
	)
	err = conn.QueryRow(query, emailOrUsername, emailOrUsername).Scan(
		&u.IdPengguna, &u.Username, &u.Email, &u.Role, &isPremium,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	u.IsPremium = isPremium == 1
	return &u, nil
}

func (c *UserController) GetUserById(id int) (*UserDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	var (
		u         UserDTO
		isPremium int
	)
	err = conn.QueryRow("SELECT id_pengguna, username, email, role, is_premium FROM pengguna WHERE id_pengguna = ?", id).Scan(
		&u.IdPengguna, &u.Username, &u.Email, &u.Role, &isPremium,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	u.IsPremium = isPremium == 1
	return &u, nil
}

func (c *UserController) UpdateProfile(id int, newUsername, newEmail, newPassword string) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		return false, err
	}

	updates := make([]string, 0)
	params := make([]interface{}, 0)

	if strings.TrimSpace(newUsername) != "" {
		updates = append(updates, "username = ?")
		params = append(params, strings.TrimSpace(newUsername))
	}
	if strings.TrimSpace(newEmail) != "" {
		updates = append(updates, "email = ?")
		params = append(params, strings.TrimSpace(newEmail))
	}
	if strings.TrimSpace(newPassword) != "" {
		updates = append(updates, "password = ?")
		params = append(params, strings.TrimSpace(newPassword))
	}

	if len(updates) == 0 {
		return true, nil
	}

	query := "UPDATE pengguna SET " + strings.Join(updates, ", ") + " WHERE id_pengguna = ?"
	params = append(params, id)

	res, err := conn.Exec(query, params...)
	if err != nil {
		return false, err
	}
	ra, _ := res.RowsAffected()
	return ra > 0, nil
}

func (c *UserController) GetAllUsers() ([]UserDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	rows, err := conn.Query("SELECT id_pengguna, username, email, role, is_premium FROM pengguna ORDER BY id_pengguna ASC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	list := make([]UserDTO, 0)
	for rows.Next() {
		var (
			u         UserDTO
			isPremium int
		)
		if err := rows.Scan(&u.IdPengguna, &u.Username, &u.Email, &u.Role, &isPremium); err != nil {
			return nil, err
		}
		u.IsPremium = isPremium == 1
		list = append(list, u)
	}
	return list, nil
}

func (c *UserController) CreateUserByAdmin(username, email, password, role string, isPremium bool) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		return false, err
	}

	premiumVal := 0
	if isPremium && role != "Admin" {
		premiumVal = 1
	}

	_, err = conn.Exec("INSERT INTO pengguna (username, email, password, role, is_premium) VALUES (?, ?, ?, ?, ?)",
		username, email, password, role, premiumVal)
	return err == nil, err
}

func (c *UserController) UpdateUserByAdmin(id int, username, email, role string, isPremium *bool, password string) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		return false, err
	}

	updates := make([]string, 0)
	params := make([]interface{}, 0)

	if strings.TrimSpace(username) != "" {
		updates = append(updates, "username = ?")
		params = append(params, strings.TrimSpace(username))
	}
	if strings.TrimSpace(email) != "" {
		updates = append(updates, "email = ?")
		params = append(params, strings.TrimSpace(email))
	}
	if strings.TrimSpace(role) != "" {
		updates = append(updates, "role = ?")
		params = append(params, strings.TrimSpace(role))
	}
	if isPremium != nil {
		updates = append(updates, "is_premium = ?")
		pVal := 0
		if *isPremium {
			pVal = 1
		}
		params = append(params, pVal)
	}
	if strings.TrimSpace(password) != "" {
		updates = append(updates, "password = ?")
		params = append(params, strings.TrimSpace(password))
	}

	if len(updates) == 0 {
		return true, nil
	}

	query := "UPDATE pengguna SET " + strings.Join(updates, ", ") + " WHERE id_pengguna = ?"
	params = append(params, id)

	res, err := conn.Exec(query, params...)
	if err != nil {
		return false, err
	}
	ra, _ := res.RowsAffected()
	return ra > 0, nil
}

func (c *UserController) DeleteUserByAdmin(id int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		return false, err
	}
	res, err := conn.Exec("DELETE FROM pengguna WHERE id_pengguna = ?", id)
	if err != nil {
		return false, err
	}
	ra, _ := res.RowsAffected()
	return ra > 0, nil
}
