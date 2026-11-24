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
		LogStatus("KategoriController", "GetAllKategori", "ERROR", "Koneksi database gagal: %v", err)
		return nil, err
	}

	rows, err := conn.Query("SELECT id_kategori, nama_kategori FROM kategori ORDER BY id_kategori ASC")
	if err != nil {
		LogStatus("KategoriController", "GetAllKategori", "ERROR", "Gagal query kategori: %v", err)
		return nil, err
	}
	defer rows.Close()

	list := make([]KategoriModel, 0)
	for rows.Next() {
		var k KategoriModel
		if err := rows.Scan(&k.IdKategori, &k.NamaKategori); err != nil {
			LogStatus("KategoriController", "GetAllKategori", "ERROR", "Gagal scan kategori: %v", err)
			return nil, err
		}
		list = append(list, k)
	}
	LogStatus("KategoriController", "GetAllKategori", "SUCCESS", "Berhasil mengambil %d kategori", len(list))
	return list, nil
}

func (c *KategoriController) GetKategoriById(id int) (*KategoriModel, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("KategoriController", "GetKategoriById", "ERROR", "Koneksi database gagal: %v", err)
		return nil, err
	}

	var k KategoriModel
	err = conn.QueryRow("SELECT id_kategori, nama_kategori FROM kategori WHERE id_kategori = ?", id).Scan(&k.IdKategori, &k.NamaKategori)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			LogStatus("KategoriController", "GetKategoriById", "NOT_FOUND", "Kategori ID %d tidak ditemukan", id)
			return nil, nil
		}
		LogStatus("KategoriController", "GetKategoriById", "ERROR", "Gagal query kategori ID %d: %v", id, err)
		return nil, err
	}
	LogStatus("KategoriController", "GetKategoriById", "SUCCESS", "Berhasil mengambil kategori ID %d ('%s')", id, k.NamaKategori)
	return &k, nil
}

func (c *KategoriController) CreateKategori(nama string) (bool, error) {
	nama = strings.TrimSpace(nama)
	if nama == "" {
		LogStatus("KategoriController", "CreateKategori", "FAILED", "Nama kategori tidak boleh kosong")
		return false, errors.New("Nama kategori tidak boleh kosong.")
	}

	conn, err := GetConnection()
	if err != nil {
		LogStatus("KategoriController", "CreateKategori", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}

	var existingId int
	err = conn.QueryRow("SELECT id_kategori FROM kategori WHERE LOWER(nama_kategori) = LOWER(?)", nama).Scan(&existingId)
	if err == nil {
		LogStatus("KategoriController", "CreateKategori", "FAILED", "Kategori '%s' sudah ada", nama)
		return false, errors.New("Nama kategori sudah ada.")
	} else if !errors.Is(err, sql.ErrNoRows) {
		LogStatus("KategoriController", "CreateKategori", "ERROR", "Gagal cek kategori '%s': %v", nama, err)
		return false, err
	}

	_, err = conn.Exec("INSERT INTO kategori (nama_kategori) VALUES (?)", nama)
	if err != nil {
		LogStatus("KategoriController", "CreateKategori", "ERROR", "Gagal insert kategori '%s': %v", nama, err)
		return false, err
	}
	LogStatus("KategoriController", "CreateKategori", "SUCCESS", "Kategori '%s' berhasil dibuat", nama)
	return true, nil
}

func (c *KategoriController) UpdateKategori(id int, nama string) (bool, error) {
	nama = strings.TrimSpace(nama)
	if nama == "" {
		LogStatus("KategoriController", "UpdateKategori", "FAILED", "Nama kategori tidak boleh kosong")
		return false, errors.New("Nama kategori tidak boleh kosong.")
	}

	conn, err := GetConnection()
	if err != nil {
		LogStatus("KategoriController", "UpdateKategori", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}

	res, err := conn.Exec("UPDATE kategori SET nama_kategori = ? WHERE id_kategori = ?", nama, id)
	if err != nil {
		LogStatus("KategoriController", "UpdateKategori", "ERROR", "Gagal update kategori ID %d: %v", id, err)
		return false, err
	}
	ra, _ := res.RowsAffected()
	if ra > 0 {
		LogStatus("KategoriController", "UpdateKategori", "SUCCESS", "Kategori ID %d berhasil diubah menjadi '%s'", id, nama)
		return true, nil
	}
	LogStatus("KategoriController", "UpdateKategori", "NOT_FOUND", "Kategori ID %d tidak ditemukan untuk diperbarui", id)
	return false, nil
}

func (c *KategoriController) DeleteKategori(id int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("KategoriController", "DeleteKategori", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}
	res, err := conn.Exec("DELETE FROM kategori WHERE id_kategori = ?", id)
	if err != nil {
		LogStatus("KategoriController", "DeleteKategori", "ERROR", "Gagal menghapus kategori ID %d: %v", id, err)
		return false, err
	}
	rowsAffected, _ := res.RowsAffected()
	if rowsAffected > 0 {
		LogStatus("KategoriController", "DeleteKategori", "SUCCESS", "Kategori ID %d berhasil dihapus", id)
		return true, nil
	}
	LogStatus("KategoriController", "DeleteKategori", "NOT_FOUND", "Kategori ID %d tidak ditemukan untuk dihapus", id)
	return false, nil
}

type BabController struct{}

func NewBabController() *BabController {
	return &BabController{}
}

func (c *BabController) GetBabByKomik(idKomik int) ([]BabDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("BabController", "GetBabByKomik", "ERROR", "Koneksi database gagal untuk komik ID %d: %v", idKomik, err)
		return nil, err
	}

	query := `SELECT
                b.id_bab,
                b.id_komik,
                b.nomor_bab,
                b.tanggal_rilis,
                COALESCE(k.title, '')
              FROM bab b
              LEFT JOIN komik k ON b.id_komik = k.id
              WHERE b.id_komik = ?
              ORDER BY b.nomor_bab ASC`

	rows, err := conn.Query(query, idKomik)
	if err != nil {
		LogStatus("BabController", "GetBabByKomik", "ERROR", "Gagal query bab komik ID %d: %v", idKomik, err)
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
		); err != nil {
			LogStatus("BabController", "GetBabByKomik", "ERROR", "Gagal scan data bab komik ID %d: %v", idKomik, err)
			return nil, err
		}

		list = append(list, b)
	}

	if err := rows.Err(); err != nil {
		LogStatus("BabController", "GetBabByKomik", "ERROR", "Error baris bab komik ID %d: %v", idKomik, err)
		return nil, err
	}

	LogStatus("BabController", "GetBabByKomik", "SUCCESS", "Berhasil mengambil %d bab untuk komik ID %d", len(list), idKomik)
	return list, nil
}

func (c *BabController) GetBabDetail(idBab int) (*BabDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("BabController", "GetBabDetail", "ERROR", "Koneksi database gagal untuk bab ID %d: %v", idBab, err)
		return nil, err
	}

	query := `SELECT
                b.id_bab,
                b.id_komik,
                b.nomor_bab,
                b.tanggal_rilis,
                COALESCE(k.title, '')
              FROM bab b
              LEFT JOIN komik k ON b.id_komik = k.id
              WHERE b.id_bab = ?`

	var b BabDTO

	err = conn.QueryRow(query, idBab).Scan(
		&b.IdBab,
		&b.IdKomik,
		&b.NomorBab,
		&b.TanggalRilis,
		&b.NamaKomik,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			LogStatus("BabController", "GetBabDetail", "NOT_FOUND", "Bab ID %d tidak ditemukan", idBab)
			return nil, nil
		}
		LogStatus("BabController", "GetBabDetail", "ERROR", "Gagal query detail bab ID %d: %v", idBab, err)
		return nil, err
	}
	LogStatus("BabController", "GetBabDetail", "SUCCESS", "Berhasil mengambil detail bab ID %d (Bab %d '%s')", idBab, b.NomorBab, b.NamaKomik)
	return &b, nil
}

func (c *BabController) GetHalamanByBab(idBab int) ([]HalamanBabDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("BabController", "GetHalamanByBab", "ERROR", "Koneksi database gagal untuk bab ID %d: %v", idBab, err)
		return nil, err
	}

	query := `
        SELECT
            id_halaman,
            id_bab,
            nomor_halaman,
            file_path
        FROM halaman_bab
        WHERE id_bab = ?
        ORDER BY nomor_halaman ASC
    `

	rows, err := conn.Query(query, idBab)
	if err != nil {
		LogStatus("BabController", "GetHalamanByBab", "ERROR", "Gagal query halaman bab ID %d: %v", idBab, err)
		return nil, err
	}
	defer rows.Close()

	list := make([]HalamanBabDTO, 0)

	for rows.Next() {
		var halaman HalamanBabDTO

		err := rows.Scan(
			&halaman.IdHalaman,
			&halaman.IdBab,
			&halaman.NomorHalaman,
			&halaman.FilePath,
		)

		if err != nil {
			LogStatus("BabController", "GetHalamanByBab", "ERROR", "Gagal scan data halaman bab ID %d: %v", idBab, err)
			return nil, err
		}
		list = append(list, halaman)
	}
	if err := rows.Err(); err != nil {
		LogStatus("BabController", "GetHalamanByBab", "ERROR", "Error baris halaman bab ID %d: %v", idBab, err)
		return nil, err
	}
	LogStatus("BabController", "GetHalamanByBab", "SUCCESS", "Berhasil mengambil %d halaman untuk bab ID %d", len(list), idBab)
	return list, nil
}

func (c *BabController) CreateBab(idKomik, nomorBab int, tanggalRilis string) (bool, error) {
	if idKomik <= 0 || nomorBab <= 0 {
		LogStatus("BabController", "CreateBab", "FAILED", "ID Komik (%d) atau nomor bab (%d) tidak valid", idKomik, nomorBab)
		return false, errors.New("ID Komik dan nomor bab harus lebih dari 0.")
	}

	conn, err := GetConnection()
	if err != nil {
		LogStatus("BabController", "CreateBab", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}

	var existingId int
	err = conn.QueryRow("SELECT id_bab FROM bab WHERE id_komik = ? AND nomor_bab = ?", idKomik, nomorBab).Scan(&existingId)
	if err == nil {
		LogStatus("BabController", "CreateBab", "FAILED", "Nomor bab %d sudah ada pada komik ID %d", nomorBab, idKomik)
		return false, errors.New("Nomor bab sudah ada pada komik ini.")
	}

	if strings.TrimSpace(tanggalRilis) == "" {
		tanggalRilis = time.Now().Format("2006-01-02")
	}

	_, err = conn.Exec("INSERT INTO bab (id_komik, nomor_bab, tanggal_rilis) VALUES (?, ?, ?)", idKomik, nomorBab, tanggalRilis)
	if err != nil {
		LogStatus("BabController", "CreateBab", "ERROR", "Gagal insert bab %d komik ID %d: %v", nomorBab, idKomik, err)
		return false, err
	}
	LogStatus("BabController", "CreateBab", "SUCCESS", "Bab %d untuk komik ID %d berhasil dibuat", nomorBab, idKomik)
	return true, nil
}

func (c *BabController) UpdateBab(idBab, nomorBab int, tanggalRilis string) (bool, error) {
	if idBab <= 0 || nomorBab <= 0 {
		LogStatus("BabController", "UpdateBab", "FAILED", "ID Bab (%d) atau nomor bab (%d) tidak valid", idBab, nomorBab)
		return false, errors.New("ID Bab dan nomor bab tidak valid.")
	}

	conn, err := GetConnection()
	if err != nil {
		LogStatus("BabController", "UpdateBab", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}

	res, err := conn.Exec("UPDATE bab SET nomor_bab = ?, tanggal_rilis = ? WHERE id_bab = ?", nomorBab, tanggalRilis, idBab)
	if err != nil {
		LogStatus("BabController", "UpdateBab", "ERROR", "Gagal update bab ID %d: %v", idBab, err)
		return false, err
	}
	ra, _ := res.RowsAffected()
	if ra > 0 {
		LogStatus("BabController", "UpdateBab", "SUCCESS", "Bab ID %d berhasil diperbarui (Nomor: %d)", idBab, nomorBab)
		return true, nil
	}
	LogStatus("BabController", "UpdateBab", "NOT_FOUND", "Bab ID %d tidak ditemukan untuk diperbarui", idBab)
	return false, nil
}

func (c *BabController) DeleteBab(idBab int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("BabController", "DeleteBab", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}
	res, err := conn.Exec("DELETE FROM bab WHERE id_bab = ?", idBab)
	if err != nil {
		LogStatus("BabController", "DeleteBab", "ERROR", "Gagal menghapus bab ID %d: %v", idBab, err)
		return false, err
	}
	rowsAffected, _ := res.RowsAffected()
	if rowsAffected > 0 {
		LogStatus("BabController", "DeleteBab", "SUCCESS", "Bab ID %d berhasil dihapus", idBab)
		return true, nil
	}
	LogStatus("BabController", "DeleteBab", "NOT_FOUND", "Bab ID %d tidak ditemukan untuk dihapus", idBab)
	return false, nil
}

type KomikController struct{}

func NewKomikController() *KomikController {
	return &KomikController{}
}

func (c *KomikController) GetAllKomik(search, kategori, sortBy string) ([]KomikDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("KomikController", "GetAllKomik", "ERROR", "Koneksi database gagal: %v", err)
		return nil, err
	}

	sqlQuery := `SELECT k.id, k.creatorID, COALESCE(u.username, '') AS nama_kreator,
                 k.title, COALESCE(k.description, '') AS deskripsi,
                 COALESCE(CAST(k.studio AS CHAR), '-') AS nama_studio, k.rating,
                 (SELECT COUNT(*) FROM bab b WHERE b.id_komik = k.id) AS total_bab
                 FROM komik k
                 LEFT JOIN pengguna u ON k.creatorID = u.id_pengguna
                 WHERE 1=1 `

	var params []interface{}

	if strings.TrimSpace(search) != "" {
		sqlQuery += "AND (LOWER(k.title) LIKE LOWER(?) OR LOWER(COALESCE(k.description, '')) LIKE LOWER(?) OR LOWER(COALESCE(CAST(k.studio AS CHAR), '')) LIKE LOWER(?)) "
		pat := "%" + strings.TrimSpace(search) + "%"
		params = append(params, pat, pat, pat)
	}

	if strings.TrimSpace(kategori) != "" {
		sqlQuery += `AND (LOWER(COALESCE(k.category, '')) = LOWER(?) OR k.id IN (
            SELECT kk.id_komik FROM komik_kategori kk
            JOIN kategori kat ON kk.id_kategori = kat.id_kategori
            WHERE LOWER(kat.nama_kategori) = LOWER(?) OR kk.id_kategori = ?
        )) `
		params = append(params, strings.TrimSpace(kategori), strings.TrimSpace(kategori), strings.TrimSpace(kategori))
	}

	if sortBy == "rating" || sortBy == "popular" {
		sqlQuery += "ORDER BY k.rating DESC, k.id DESC"
	} else if sortBy == "title" || sortBy == "az" {
		sqlQuery += "ORDER BY k.title ASC"
	} else {
		sqlQuery += "ORDER BY k.id DESC"
	}

	rows, err := conn.Query(sqlQuery, params...)
	if err != nil {
		LogStatus("KomikController", "GetAllKomik", "ERROR", "Gagal query komik: %v", err)
		return nil, err
	}
	defer rows.Close()

	list := make([]KomikDTO, 0)
	for rows.Next() {
		var k KomikDTO
		if err := rows.Scan(&k.IdKomik, &k.IdKreator, &k.NamaKreator, &k.NamaKomik, &k.Deskripsi, &k.NamaStudio, &k.RatingRataRata, &k.TotalChapters); err != nil {
			LogStatus("KomikController", "GetAllKomik", "ERROR", "Gagal scan data komik: %v", err)
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

	LogStatus("KomikController", "GetAllKomik", "SUCCESS", "Berhasil mengambil %d komik (search='%s', kategori='%s', sortBy='%s')", len(list), search, kategori, sortBy)
	return list, nil
}

func (c *KomikController) GetKomikById(id int) (*KomikDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("KomikController", "GetKomikById", "ERROR", "Koneksi database gagal untuk komik ID %d: %v", id, err)
		return nil, err
	}

	sqlQuery := `SELECT k.id, k.creatorID, COALESCE(u.username, '') AS nama_kreator,
                 k.title, COALESCE(k.description, '') AS deskripsi,
                 COALESCE(CAST(k.studio AS CHAR), '-') AS nama_studio, k.rating,
                 (SELECT COUNT(*) FROM bab b WHERE b.id_komik = k.id) AS total_bab
                 FROM komik k
                 LEFT JOIN pengguna u ON k.creatorID = u.id_pengguna
                 WHERE k.id = ?`

	var k KomikDTO
	err = conn.QueryRow(sqlQuery, id).Scan(
		&k.IdKomik, &k.IdKreator, &k.NamaKreator, &k.NamaKomik, &k.Deskripsi, &k.NamaStudio, &k.RatingRataRata, &k.TotalChapters,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			LogStatus("KomikController", "GetKomikById", "NOT_FOUND", "Komik ID %d tidak ditemukan", id)
			return nil, nil
		}
		LogStatus("KomikController", "GetKomikById", "ERROR", "Gagal query komik ID %d: %v", id, err)
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

	LogStatus("KomikController", "GetKomikById", "SUCCESS", "Berhasil mengambil komik ID %d ('%s')", id, k.NamaKomik)
	return &k, nil
}

func (c *KomikController) CreateKomik(idKreator int, title, desc, studio string, catIds []int) (int, error) {
	title = strings.TrimSpace(title)
	if title == "" {
		LogStatus("KomikController", "CreateKomik", "FAILED", "Judul komik tidak boleh kosong")
		return 0, errors.New("Judul komik tidak boleh kosong.")
	}

	conn, err := GetConnection()
	if err != nil {
		LogStatus("KomikController", "CreateKomik", "ERROR", "Koneksi database gagal: %v", err)
		return 0, err
	}

	res, err := conn.Exec("INSERT INTO komik (creatorID, title, description, studio, rating) VALUES (?, ?, ?, ?, 0.00)",
		idKreator, title, desc, studio)
	if err != nil {
		LogStatus("KomikController", "CreateKomik", "ERROR", "Gagal insert komik '%s': %v", title, err)
		return 0, err
	}

	newId, err := res.LastInsertId()
	if err != nil {
		LogStatus("KomikController", "CreateKomik", "ERROR", "Gagal mendapatkan lastInsertId komik '%s': %v", title, err)
		return 0, err
	}

	for _, cid := range catIds {
		if cid > 0 {
			_, _ = conn.Exec("INSERT IGNORE INTO komik_kategori (id_komik, id_kategori) VALUES (?, ?)", newId, cid)
		}
	}

	LogStatus("KomikController", "CreateKomik", "SUCCESS", "Komik '%s' berhasil dibuat dengan ID %d oleh Kreator ID %d", title, newId, idKreator)
	return int(newId), nil
}

func (c *KomikController) UpdateKomik(idKomik, idKreator int, title, desc, studio string, catIds []int) (bool, error) {
	title = strings.TrimSpace(title)
	if title == "" {
		LogStatus("KomikController", "UpdateKomik", "FAILED", "Judul komik tidak boleh kosong")
		return false, errors.New("Judul komik tidak boleh kosong.")
	}

	conn, err := GetConnection()
	if err != nil {
		LogStatus("KomikController", "UpdateKomik", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}

	res, err := conn.Exec(
		`UPDATE komik
    SET title = ?, description = ?, studio = ?
    WHERE id = ? AND creatorID = ?`,
		title, desc, studio, idKomik, idKreator,
	)
	if err != nil {
		LogStatus("KomikController", "UpdateKomik", "ERROR", "Gagal update komik ID %d: %v", idKomik, err)
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
	if ra > 0 {
		LogStatus("KomikController", "UpdateKomik", "SUCCESS", "Komik ID %d ('%s') berhasil diperbarui", idKomik, title)
		return true, nil
	}
	LogStatus("KomikController", "UpdateKomik", "NOT_FOUND", "Komik ID %d tidak ditemukan untuk diperbarui", idKomik)
	return false, nil
}

func (c *KomikController) DeleteKomik(id int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("KomikController", "DeleteKomik", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}
	res, err := conn.Exec("DELETE FROM komik WHERE id = ?", id)
	if err != nil {
		LogStatus("KomikController", "DeleteKomik", "ERROR", "Gagal menghapus komik ID %d: %v", id, err)
		return false, err
	}
	ra, _ := res.RowsAffected()
	if ra > 0 {
		LogStatus("KomikController", "DeleteKomik", "SUCCESS", "Komik ID %d berhasil dihapus", id)
		return true, nil
	}
	LogStatus("KomikController", "DeleteKomik", "NOT_FOUND", "Komik ID %d tidak ditemukan untuk dihapus", id)
	return false, nil
}

func (c *KomikController) VerifyKomik(comicId, adminId int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("KomikController", "VerifyKomik", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}

	var role string
	err = conn.QueryRow("SELECT role FROM pengguna WHERE id_pengguna = ?", adminId).Scan(&role)
	if err != nil {
		LogStatus("KomikController", "VerifyKomik", "FAILED", "Admin ID %d tidak ditemukan: %v", adminId, err)
		return false, errors.New("Admin tidak ditemukan.")
	}
	if role != "Admin" {
		LogStatus("KomikController", "VerifyKomik", "FAILED", "Pengguna ID %d bukan Admin (Role: %s)", adminId, role)
		return false, errors.New("Hanya admin yang dapat memverifikasi komik.")
	}
	LogStatus("KomikController", "VerifyKomik", "SUCCESS", "Admin ID %d berhasil memverifikasi komik ID %d", adminId, comicId)
	return true, nil
}

func (c *KomikController) GetKomikStats(comicId int) (map[string]interface{}, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("KomikController", "GetKomikStats", "ERROR", "Koneksi database gagal: %v", err)
		return nil, err
	}

	query := `SELECT k.title, k.rating,
              (SELECT COUNT(*) FROM bab WHERE id_komik = k.id) AS total_bab,
              (SELECT COUNT(*) FROM komentar_rating WHERE id_komik = k.id) AS total_komentar,
              (SELECT COUNT(*) FROM bookmark WHERE id_komik = k.id) AS total_bookmark
              FROM komik k WHERE k.id = ?`

	var (
		title         string
		rating        float64
		totalBab      int
		totalKomentar int
		totalBookmark int
	)

	err = conn.QueryRow(query, comicId).Scan(&title, &rating, &totalBab, &totalKomentar, &totalBookmark)
	if err != nil {
		LogStatus("KomikController", "GetKomikStats", "ERROR", "Gagal mengambil statistik komik ID %d: %v", comicId, err)
		return nil, err
	}

	LogStatus("KomikController", "GetKomikStats", "SUCCESS", "Berhasil mengambil statistik komik ID %d ('%s')", comicId, title)
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
		LogStatus("KomikController", "GetAuthorStats", "ERROR", "Koneksi database gagal: %v", err)
		return nil, err
	}

	query := `SELECT COUNT(*) AS total_komik, COALESCE(AVG(rating), 0) AS avg_rating
              FROM komik WHERE creatorID = ?`

	var (
		totalKomik int
		avgRating  float64
	)
	err = conn.QueryRow(query, creatorId).Scan(&totalKomik, &avgRating)
	if err != nil {
		LogStatus("KomikController", "GetAuthorStats", "ERROR", "Gagal mengambil statistik kreator ID %d: %v", creatorId, err)
		return nil, err
	}

	LogStatus("KomikController", "GetAuthorStats", "SUCCESS", "Berhasil mengambil statistik kreator ID %d (Total: %d komik, Avg: %.2f)", creatorId, totalKomik, avgRating)
	return map[string]interface{}{
		"creator_id":     creatorId,
		"total_comics":   totalKomik,
		"average_rating": avgRating,
	}, nil
}

type KomentarController struct{}

func NewKomentarController() *KomentarController {
	return &KomentarController{}
}

// Compatibility alias for code written before the SRS naming alignment.
type KomentarRatingController = KomentarController

func NewKomentarRatingController() *KomentarController { return NewKomentarController() }

func (c *KomentarController) GetReviewsByComic(comicId int, sort string) ([]ReviewDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("KomentarController", "GetReviewsByComic", "ERROR", "Koneksi database gagal untuk komik ID %d: %v", comicId, err)
		return nil, err
	}

	query := `SELECT kr.id_ulasan, kr.id_pengguna, u.username, kr.id_komik, COALESCE(k.title, ''),
              kr.isi_komentar, kr.nilai_rating, kr.tanggal_komentar
              FROM komentar_rating kr
              JOIN pengguna u ON kr.id_pengguna = u.id_pengguna
              LEFT JOIN komik k ON kr.id_komik = k.id
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
		LogStatus("KomentarController", "GetReviewsByComic", "ERROR", "Gagal query ulasan komik ID %d: %v", comicId, err)
		return nil, err
	}
	defer rows.Close()

	list := make([]ReviewDTO, 0)
	for rows.Next() {
		var r ReviewDTO
		if err := rows.Scan(&r.IdUlasan, &r.IdPengguna, &r.Username, &r.IdKomik, &r.NamaKomik, &r.IsiKomentar, &r.NilaiRating, &r.TanggalKomentar); err != nil {
			LogStatus("KomentarController", "GetReviewsByComic", "ERROR", "Gagal scan data ulasan komik ID %d: %v", comicId, err)
			return nil, err
		}
		list = append(list, r)
	}
	LogStatus("KomentarController", "GetReviewsByComic", "SUCCESS", "Berhasil mengambil %d ulasan untuk komik ID %d (sort='%s')", len(list), comicId, sort)
	return list, nil
}

func (c *KomentarController) GetReviewsForAuthor(creatorId int) ([]ReviewDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("KomentarController", "GetReviewsForAuthor", "ERROR", "Koneksi database gagal untuk kreator ID %d: %v", creatorId, err)
		return nil, err
	}

	query := `SELECT kr.id_ulasan, kr.id_pengguna, u.username, kr.id_komik, COALESCE(k.title, ''),
              kr.isi_komentar, kr.nilai_rating, kr.tanggal_komentar
              FROM komentar_rating kr
              JOIN pengguna u ON kr.id_pengguna = u.id_pengguna
              LEFT JOIN komik k ON kr.id_komik = k.id
              WHERE k.creatorID = ?
              ORDER BY kr.tanggal_komentar DESC`

	rows, err := conn.Query(query, creatorId)
	if err != nil {
		LogStatus("KomentarController", "GetReviewsForAuthor", "ERROR", "Gagal query ulasan kreator ID %d: %v", creatorId, err)
		return nil, err
	}
	defer rows.Close()

	list := make([]ReviewDTO, 0)
	for rows.Next() {
		var r ReviewDTO
		if err := rows.Scan(&r.IdUlasan, &r.IdPengguna, &r.Username, &r.IdKomik, &r.NamaKomik, &r.IsiKomentar, &r.NilaiRating, &r.TanggalKomentar); err != nil {
			LogStatus("KomentarController", "GetReviewsForAuthor", "ERROR", "Gagal scan data ulasan kreator ID %d: %v", creatorId, err)
			return nil, err
		}
		list = append(list, r)
	}
	LogStatus("KomentarController", "GetReviewsForAuthor", "SUCCESS", "Berhasil mengambil %d ulasan untuk kreator ID %d", len(list), creatorId)
	return list, nil
}

func (c *KomentarController) AddReview(idPengguna, idKomik int, isi string, rating float64) (bool, error) {
	if idPengguna <= 0 || idKomik <= 0 {
		LogStatus("KomentarController", "AddReview", "FAILED", "ID Pengguna (%d) dan ID Komik (%d) harus lebih dari 0", idPengguna, idKomik)
		return false, errors.New("idPengguna dan idKomik harus lebih dari 0.")
	}
	if strings.TrimSpace(isi) == "" {
		LogStatus("KomentarController", "AddReview", "FAILED", "Isi komentar tidak boleh kosong (User: %d, Komik: %d)", idPengguna, idKomik)
		return false, errors.New("Isi komentar tidak boleh kosong.")
	}

	conn, err := GetConnection()
	if err != nil {
		LogStatus("KomentarController", "AddReview", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}

	_, err = conn.Exec("INSERT INTO komentar_rating (id_pengguna, id_komik, isi_komentar, nilai_rating, tanggal_komentar) VALUES (?, ?, ?, ?, NOW())",
		idPengguna, idKomik, isi, rating)
	if err != nil {
		LogStatus("KomentarController", "AddReview", "ERROR", "Gagal insert ulasan komik ID %d oleh User ID %d: %v", idKomik, idPengguna, err)
		return false, err
	}

	_, _ = conn.Exec(`UPDATE komik SET rating = (
        SELECT COALESCE(AVG(nilai_rating), 0.0) FROM komentar_rating WHERE id_komik = ?
    ) WHERE id = ?`, idKomik, idKomik)

	LogStatus("KomentarController", "AddReview", "SUCCESS", "User ID %d berhasil mengirim ulasan & rating %.1f untuk komik ID %d", idPengguna, rating, idKomik)
	return true, nil
}

func (c *KomentarController) DeleteReview(idUlasan, idPengguna int, role string) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("KomentarController", "DeleteReview", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}

	var comicId, ownerId int
	err = conn.QueryRow("SELECT id_komik, id_pengguna FROM komentar_rating WHERE id_ulasan = ?", idUlasan).Scan(&comicId, &ownerId)
	if err != nil {
		LogStatus("KomentarController", "DeleteReview", "ERROR", "Gagal cari ulasan ID %d: %v", idUlasan, err)
		return false, err
	}

	if role != "Admin" && ownerId != idPengguna {
		LogStatus("KomentarController", "DeleteReview", "FAILED", "Akses ditolak: User ID %d bukan pemilik ulasan ID %d (Pemilik: %d)", idPengguna, idUlasan, ownerId)
		return false, errors.New("Anda tidak memiliki hak akses untuk menghapus ulasan ini.")
	}

	res, err := conn.Exec("DELETE FROM komentar_rating WHERE id_ulasan = ?", idUlasan)
	if err != nil {
		LogStatus("KomentarController", "DeleteReview", "ERROR", "Gagal menghapus ulasan ID %d: %v", idUlasan, err)
		return false, err
	}

	_, _ = conn.Exec(`UPDATE komik SET rating = (
        SELECT COALESCE(AVG(nilai_rating), 0.0) FROM komentar_rating WHERE id_komik = ?
    ) WHERE id = ?`, comicId, comicId)

	ra, _ := res.RowsAffected()
	if ra > 0 {
		LogStatus("KomentarController", "DeleteReview", "SUCCESS", "Ulasan ID %d berhasil dihapus oleh User ID %d", idUlasan, idPengguna)
		return true, nil
	}
	LogStatus("KomentarController", "DeleteReview", "NOT_FOUND", "Ulasan ID %d tidak ditemukan untuk dihapus", idUlasan)
	return false, nil
}

type BookmarkHistoriController struct{}

func NewBookmarkHistoriController() *BookmarkHistoriController {
	return &BookmarkHistoriController{}
}

func (c *BookmarkHistoriController) GetBookmarks(userId int) ([]BookmarkDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("BookmarkHistoriController", "GetBookmarks", "ERROR", "Koneksi database gagal untuk User ID %d: %v", userId, err)
		return nil, err
	}

	query := `SELECT b.id_bookmark, b.id_pengguna, b.id_komik, COALESCE(k.title, ''),
              COALESCE(CAST(k.studio AS CHAR), '-'), k.rating, b.tanggal_ditambahkan
              FROM bookmark b
              LEFT JOIN komik k ON b.id_komik = k.id
              WHERE b.id_pengguna = ?
              ORDER BY b.tanggal_ditambahkan DESC`

	rows, err := conn.Query(query, userId)
	if err != nil {
		LogStatus("BookmarkHistoriController", "GetBookmarks", "ERROR", "Gagal query bookmark User ID %d: %v", userId, err)
		return nil, err
	}
	defer rows.Close()

	list := make([]BookmarkDTO, 0)
	for rows.Next() {
		var b BookmarkDTO
		if err := rows.Scan(&b.IdBookmark, &b.IdPengguna, &b.IdKomik, &b.NamaKomik, &b.NamaStudio, &b.RatingRataRata, &b.TanggalDitambahkan); err != nil {
			LogStatus("BookmarkHistoriController", "GetBookmarks", "ERROR", "Gagal scan bookmark User ID %d: %v", userId, err)
			return nil, err
		}
		list = append(list, b)
	}
	LogStatus("BookmarkHistoriController", "GetBookmarks", "SUCCESS", "Berhasil mengambil %d bookmark untuk User ID %d", len(list), userId)
	return list, nil
}

func (c *BookmarkHistoriController) AddBookmark(userId, comicId int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("BookmarkHistoriController", "AddBookmark", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}

	_, err = conn.Exec("INSERT IGNORE INTO bookmark (id_pengguna, id_komik, tanggal_ditambahkan) VALUES (?, ?, NOW())", userId, comicId)
	if err != nil {
		LogStatus("BookmarkHistoriController", "AddBookmark", "ERROR", "Gagal bookmark komik ID %d untuk User ID %d: %v", comicId, userId, err)
		return false, err
	}
	LogStatus("BookmarkHistoriController", "AddBookmark", "SUCCESS", "Komik ID %d berhasil ditambahkan ke bookmark User ID %d", comicId, userId)
	return true, nil
}

func (c *BookmarkHistoriController) RemoveBookmark(userId, comicId int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("BookmarkHistoriController", "RemoveBookmark", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}
	res, err := conn.Exec("DELETE FROM bookmark WHERE id_pengguna = ? AND id_komik = ?", userId, comicId)
	if err != nil {
		LogStatus("BookmarkHistoriController", "RemoveBookmark", "ERROR", "Gagal menghapus bookmark komik ID %d User ID %d: %v", comicId, userId, err)
		return false, err
	}
	ra, _ := res.RowsAffected()
	if ra > 0 {
		LogStatus("BookmarkHistoriController", "RemoveBookmark", "SUCCESS", "Bookmark komik ID %d berhasil dihapus untuk User ID %d", comicId, userId)
		return true, nil
	}
	LogStatus("BookmarkHistoriController", "RemoveBookmark", "NOT_FOUND", "Bookmark komik ID %d tidak ditemukan untuk User ID %d", comicId, userId)
	return false, nil
}

func (c *BookmarkHistoriController) AddHistori(userId, chapterId int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("BookmarkHistoriController", "AddHistori", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}
	_, err = conn.Exec("INSERT INTO histori_baca (id_pengguna, id_komik, id_bab, tanggal_baca) VALUES (?, COALESCE((SELECT id_komik FROM bab WHERE id_bab = ?), 0), ?, NOW())", userId, chapterId, chapterId)
	if err != nil {
		LogStatus("BookmarkHistoriController", "AddHistori", "ERROR", "Gagal mencatat riwayat baca bab ID %d User ID %d: %v", chapterId, userId, err)
		return false, err
	}
	LogStatus("BookmarkHistoriController", "AddHistori", "SUCCESS", "Riwayat baca bab ID %d berhasil dicatat untuk User ID %d", chapterId, userId)
	return true, nil
}

func (c *BookmarkHistoriController) GetHistori(userId int) ([]HistoriDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("BookmarkHistoriController", "GetHistori", "ERROR", "Koneksi database gagal untuk User ID %d: %v", userId, err)
		return nil, err
	}

	query := `SELECT h.id_histori, h.id_pengguna, h.id_bab, b.nomor_bab,
              COALESCE(k.id, 0), COALESCE(k.title, ''), h.tanggal_baca
              FROM histori_baca h
              LEFT JOIN bab b ON h.id_bab = b.id_bab
              LEFT JOIN komik k ON b.id_komik = k.id
              WHERE h.id_pengguna = ?
              ORDER BY h.tanggal_baca DESC`

	rows, err := conn.Query(query, userId)
	if err != nil {
		LogStatus("BookmarkHistoriController", "GetHistori", "ERROR", "Gagal query riwayat baca User ID %d: %v", userId, err)
		return nil, err
	}
	defer rows.Close()

	list := make([]HistoriDTO, 0)
	for rows.Next() {
		var h HistoriDTO
		if err := rows.Scan(&h.IdHistori, &h.IdPengguna, &h.IdBab, &h.NomorBab, &h.IdKomik, &h.NamaKomik, &h.TanggalBaca); err != nil {
			LogStatus("BookmarkHistoriController", "GetHistori", "ERROR", "Gagal scan histori User ID %d: %v", userId, err)
			return nil, err
		}
		list = append(list, h)
	}
	LogStatus("BookmarkHistoriController", "GetHistori", "SUCCESS", "Berhasil mengambil %d riwayat baca untuk User ID %d", len(list), userId)
	return list, nil
}

func (c *BookmarkHistoriController) DeleteHistori(idHistori, userId int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("BookmarkHistoriController", "DeleteHistori", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}
	res, err := conn.Exec("DELETE FROM histori_baca WHERE id_histori = ? AND id_pengguna = ?", idHistori, userId)
	if err != nil {
		LogStatus("BookmarkHistoriController", "DeleteHistori", "ERROR", "Gagal menghapus riwayat baca ID %d User ID %d: %v", idHistori, userId, err)
		return false, err
	}
	ra, _ := res.RowsAffected()
	if ra > 0 {
		LogStatus("BookmarkHistoriController", "DeleteHistori", "SUCCESS", "Riwayat baca ID %d berhasil dihapus untuk User ID %d", idHistori, userId)
		return true, nil
	}
	LogStatus("BookmarkHistoriController", "DeleteHistori", "NOT_FOUND", "Riwayat baca ID %d tidak ditemukan untuk User ID %d", idHistori, userId)
	return false, nil
}

type ProsesPembayaranController struct{}

func NewProsesPembayaranController() *ProsesPembayaranController {
	return &ProsesPembayaranController{}
}

// Compatibility alias; the SRS participant is ProsesPembayaranController.
type PembayaranController = ProsesPembayaranController

func NewPembayaranController() *ProsesPembayaranController { return NewProsesPembayaranController() }

func (c *ProsesPembayaranController) GetUserIdByEmail(email string) (int, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("ProsesPembayaranController", "GetUserIdByEmail", "ERROR", "Koneksi database gagal untuk '%s': %v", email, err)
		return 0, err
	}
	var id int
	err = conn.QueryRow("SELECT id_pengguna FROM pengguna WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)", email, email).Scan(&id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			LogStatus("ProsesPembayaranController", "GetUserIdByEmail", "NOT_FOUND", "User '%s' tidak ditemukan", email)
		} else {
			LogStatus("ProsesPembayaranController", "GetUserIdByEmail", "ERROR", "Gagal query user '%s': %v", email, err)
		}
		return 0, err
	}
	LogStatus("ProsesPembayaranController", "GetUserIdByEmail", "SUCCESS", "User ID %d ditemukan untuk '%s'", id, email)
	return id, nil
}

func (c *ProsesPembayaranController) Checkout(userId int, method string, amount float64) (int, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("ProsesPembayaranController", "Checkout", "ERROR", "Koneksi database gagal: %v", err)
		return 0, err
	}

	res, err := conn.Exec("INSERT INTO transaksi (id_pengguna, metode_pembayaran, status_pembayaran, jumlah_bayar, tanggal_transaksi) VALUES (?, ?, 'Menunggu', ?, NOW())",
		userId, method, amount)
	if err != nil {
		LogStatus("ProsesPembayaranController", "Checkout", "ERROR", "Gagal membuat transaksi baru untuk User ID %d: %v", userId, err)
		return 0, err
	}
	id, err := res.LastInsertId()
	if err != nil {
		LogStatus("ProsesPembayaranController", "Checkout", "ERROR", "Gagal membaca lastInsertId transaksi: %v", err)
		return 0, err
	}
	LogStatus("ProsesPembayaranController", "Checkout", "SUCCESS", "Checkout berhasil dibuat (Transaksi ID: %d, User ID: %d, Metode: %s, Jumlah: Rp%.2f)", id, userId, method, amount)
	return int(id), nil
}

func (c *ProsesPembayaranController) ProcessPayment(txId int, status string) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("ProsesPembayaranController", "ProcessPayment", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}

	if status != "Berhasil" {
		status = "Gagal"
	}

	var userId int
	err = conn.QueryRow("SELECT id_pengguna FROM transaksi WHERE id_transaksi = ?", txId).Scan(&userId)
	if err != nil {
		LogStatus("ProsesPembayaranController", "ProcessPayment", "ERROR", "Transaksi ID %d tidak ditemukan: %v", txId, err)
		return false, err
	}

	_, err = conn.Exec("UPDATE transaksi SET status_pembayaran = ? WHERE id_transaksi = ?", status, txId)
	if err != nil {
		LogStatus("ProsesPembayaranController", "ProcessPayment", "ERROR", "Gagal memperbarui status transaksi ID %d: %v", txId, err)
		return false, err
	}

	if status == "Berhasil" {
		_, _ = conn.Exec("UPDATE pengguna SET is_premium = 1 WHERE id_pengguna = ?", userId)
		LogStatus("ProsesPembayaranController", "ProcessPayment", "SUCCESS", "Transaksi ID %d Berhasil - Akun User ID %d ditingkatkan ke Premium", txId, userId)
	} else {
		LogStatus("ProsesPembayaranController", "ProcessPayment", "SUCCESS", "Transaksi ID %d diproses dengan status '%s' (User ID: %d)", txId, status, userId)
	}

	return true, nil
}

func (c *ProsesPembayaranController) GetUserTransactions(userId int) ([]TransaksiDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("ProsesPembayaranController", "GetUserTransactions", "ERROR", "Koneksi database gagal untuk User ID %d: %v", userId, err)
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
		LogStatus("ProsesPembayaranController", "GetUserTransactions", "ERROR", "Gagal query transaksi User ID %d: %v", userId, err)
		return nil, err
	}
	defer rows.Close()

	list := make([]TransaksiDTO, 0)
	for rows.Next() {
		var t TransaksiDTO
		if err := rows.Scan(&t.IdTransaksi, &t.IdPengguna, &t.Username, &t.Email, &t.MetodePembayaran, &t.StatusPembayaran, &t.JumlahBayar, &t.TanggalTransaksi); err != nil {
			LogStatus("ProsesPembayaranController", "GetUserTransactions", "ERROR", "Gagal scan transaksi User ID %d: %v", userId, err)
			return nil, err
		}
		list = append(list, t)
	}
	LogStatus("ProsesPembayaranController", "GetUserTransactions", "SUCCESS", "Berhasil mengambil %d transaksi untuk User ID %d", len(list), userId)
	return list, nil
}

func (c *ProsesPembayaranController) GetAllTransactions() ([]TransaksiDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("ProsesPembayaranController", "GetAllTransactions", "ERROR", "Koneksi database gagal: %v", err)
		return nil, err
	}

	query := `SELECT t.id_transaksi, t.id_pengguna, u.username, u.email,
              t.metode_pembayaran, t.status_pembayaran, t.jumlah_bayar, t.tanggal_transaksi
              FROM transaksi t
              JOIN pengguna u ON t.id_pengguna = u.id_pengguna
              ORDER BY t.tanggal_transaksi DESC`

	rows, err := conn.Query(query)
	if err != nil {
		LogStatus("ProsesPembayaranController", "GetAllTransactions", "ERROR", "Gagal query semua transaksi: %v", err)
		return nil, err
	}
	defer rows.Close()

	list := make([]TransaksiDTO, 0)
	for rows.Next() {
		var t TransaksiDTO
		if err := rows.Scan(&t.IdTransaksi, &t.IdPengguna, &t.Username, &t.Email, &t.MetodePembayaran, &t.StatusPembayaran, &t.JumlahBayar, &t.TanggalTransaksi); err != nil {
			LogStatus("ProsesPembayaranController", "GetAllTransactions", "ERROR", "Gagal scan transaksi: %v", err)
			return nil, err
		}
		list = append(list, t)
	}
	LogStatus("ProsesPembayaranController", "GetAllTransactions", "SUCCESS", "Admin berhasil mengambil %d seluruh transaksi", len(list))
	return list, nil
}

type UserController struct{}

func NewUserController() *UserController {
	return &UserController{}
}

func (c *UserController) GetUserProfile(emailOrUsername string) (*UserDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("UserController", "GetUserProfile", "ERROR", "Koneksi database gagal untuk '%s': %v", emailOrUsername, err)
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
			LogStatus("UserController", "GetUserProfile", "NOT_FOUND", "Profil pengguna '%s' tidak ditemukan", emailOrUsername)
			return nil, nil
		}
		LogStatus("UserController", "GetUserProfile", "ERROR", "Gagal query profil pengguna '%s': %v", emailOrUsername, err)
		return nil, err
	}
	u.IsPremium = isPremium == 1
	LogStatus("UserController", "GetUserProfile", "SUCCESS", "Profil pengguna '%s' (ID: %d, Role: %s, Premium: %t) berhasil dimuat", emailOrUsername, u.IdPengguna, u.Role, u.IsPremium)
	return &u, nil
}

func (c *UserController) GetUserById(id int) (*UserDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("UserController", "GetUserById", "ERROR", "Koneksi database gagal untuk User ID %d: %v", id, err)
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
			LogStatus("UserController", "GetUserById", "NOT_FOUND", "Pengguna ID %d tidak ditemukan", id)
			return nil, nil
		}
		LogStatus("UserController", "GetUserById", "ERROR", "Gagal query user ID %d: %v", id, err)
		return nil, err
	}
	u.IsPremium = isPremium == 1
	LogStatus("UserController", "GetUserById", "SUCCESS", "Pengguna ID %d ('%s', Role: %s) berhasil dimuat", id, u.Username, u.Role)
	return &u, nil
}

func (c *UserController) UpdateProfile(id int, newUsername, newEmail, newPassword string) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("UserController", "UpdateProfile", "ERROR", "Koneksi database gagal untuk User ID %d: %v", id, err)
		return false, err
	}

	if id <= 0 && strings.TrimSpace(newEmail) != "" {
		_ = conn.QueryRow("SELECT id_pengguna FROM pengguna WHERE LOWER(email) = LOWER(?)", strings.TrimSpace(newEmail)).Scan(&id)
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
		LogStatus("UserController", "UpdateProfile", "NO_OP", "Tidak ada data yang diubah untuk User ID %d", id)
		return true, nil
	}

	query := "UPDATE pengguna SET " + strings.Join(updates, ", ") + " WHERE id_pengguna = ?"
	params = append(params, id)

	res, err := conn.Exec(query, params...)
	if err != nil {
		LogStatus("UserController", "UpdateProfile", "ERROR", "Gagal update profil User ID %d: %v", id, err)
		return false, err
	}
	ra, _ := res.RowsAffected()
	if ra > 0 {
		LogStatus("UserController", "UpdateProfile", "SUCCESS", "Profil User ID %d berhasil diperbarui", id)
		return true, nil
	}
	LogStatus("UserController", "UpdateProfile", "NOT_FOUND", "User ID %d tidak ditemukan untuk update profil", id)
	return false, nil
}

func (c *UserController) GetAllUsers() ([]UserDTO, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("UserController", "GetAllUsers", "ERROR", "Koneksi database gagal: %v", err)
		return nil, err
	}

	rows, err := conn.Query("SELECT id_pengguna, username, email, role, is_premium FROM pengguna ORDER BY id_pengguna ASC")
	if err != nil {
		LogStatus("UserController", "GetAllUsers", "ERROR", "Gagal query daftar pengguna: %v", err)
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
			LogStatus("UserController", "GetAllUsers", "ERROR", "Gagal scan data pengguna: %v", err)
			return nil, err
		}
		u.IsPremium = isPremium == 1
		list = append(list, u)
	}
	LogStatus("UserController", "GetAllUsers", "SUCCESS", "Admin berhasil mengambil %d pengguna", len(list))
	return list, nil
}

func (c *UserController) CreateUserByAdmin(username, email, password, role string, isPremium bool) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("UserController", "CreateUserByAdmin", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}

	premiumVal := 0
	if isPremium && role != "Admin" {
		premiumVal = 1
	}

	_, err = conn.Exec("INSERT INTO pengguna (username, email, password, role, is_premium) VALUES (?, ?, ?, ?, ?)",
		username, email, password, role, premiumVal)
	if err != nil {
		LogStatus("UserController", "CreateUserByAdmin", "ERROR", "Admin gagal membuat user '%s': %v", username, err)
		return false, err
	}
	LogStatus("UserController", "CreateUserByAdmin", "SUCCESS", "Admin berhasil membuat user '%s' (Role: %s, Premium: %t)", username, role, isPremium)
	return true, nil
}

func (c *UserController) UpdateUserByAdmin(id int, username, email, role string, isPremium *bool, password string) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("UserController", "UpdateUserByAdmin", "ERROR", "Koneksi database gagal untuk User ID %d: %v", id, err)
		return false, err
	}

	if id <= 0 && strings.TrimSpace(email) != "" {
		_ = conn.QueryRow("SELECT id_pengguna FROM pengguna WHERE LOWER(email) = LOWER(?)", strings.TrimSpace(email)).Scan(&id)
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
		LogStatus("UserController", "UpdateUserByAdmin", "NO_OP", "Tidak ada perubahan untuk User ID %d", id)
		return true, nil
	}

	query := "UPDATE pengguna SET " + strings.Join(updates, ", ") + " WHERE id_pengguna = ?"
	params = append(params, id)

	res, err := conn.Exec(query, params...)
	if err != nil {
		LogStatus("UserController", "UpdateUserByAdmin", "ERROR", "Admin gagal update User ID %d: %v", id, err)
		return false, err
	}
	ra, _ := res.RowsAffected()
	if ra > 0 {
		LogStatus("UserController", "UpdateUserByAdmin", "SUCCESS", "Admin berhasil update User ID %d", id)
		return true, nil
	}
	LogStatus("UserController", "UpdateUserByAdmin", "NOT_FOUND", "User ID %d tidak ditemukan untuk diupdate", id)
	return false, nil
}

func (c *UserController) DeleteUserByAdmin(id int) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		LogStatus("UserController", "DeleteUserByAdmin", "ERROR", "Koneksi database gagal: %v", err)
		return false, err
	}
	res, err := conn.Exec("DELETE FROM pengguna WHERE id_pengguna = ?", id)
	if err != nil {
		LogStatus("UserController", "DeleteUserByAdmin", "ERROR", "Admin gagal menghapus User ID %d: %v", id, err)
		return false, err
	}
	ra, _ := res.RowsAffected()
	if ra > 0 {
		LogStatus("UserController", "DeleteUserByAdmin", "SUCCESS", "Admin berhasil menghapus User ID %d", id)
		return true, nil
	}
	LogStatus("UserController", "DeleteUserByAdmin", "NOT_FOUND", "User ID %d tidak ditemukan untuk dihapus", id)
	return false, nil
}
