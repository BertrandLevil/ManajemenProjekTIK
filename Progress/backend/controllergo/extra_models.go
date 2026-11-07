package main

// KategoriModel merepresentasikan kategori komik
type KategoriModel struct {
	IdKategori   int    `json:"id"`
	NamaKategori string `json:"name"`
}

// KomikDTO merepresentasikan data transfer komik
type KomikDTO struct {
	IdKomik        int      `json:"id"`
	IdKreator      int      `json:"creator_id"`
	NamaKreator    string   `json:"creator_name"`
	NamaKomik      string   `json:"title"`
	Deskripsi      string   `json:"description"`
	NamaStudio     string   `json:"studio"`
	RatingRataRata float64  `json:"rating"`
	TotalChapters  int      `json:"total_chapters"`
	Categories     []string `json:"categories"`
}

// BabDTO merepresentasikan data chapter
type BabDTO struct {
	IdBab        int    `json:"id"`
	IdKomik      int    `json:"comic_id"`
	NomorBab     int    `json:"chapter_number"`
	TanggalRilis string `json:"release_date"`
	NamaKomik    string `json:"comic_name"`
}

// ReviewDTO merepresentasikan komentar dan rating
type ReviewDTO struct {
	IdUlasan        int     `json:"id"`
	IdPengguna      int     `json:"user_id"`
	Username        string  `json:"username"`
	IdKomik         int     `json:"comic_id"`
	NamaKomik       string  `json:"comic_name"`
	IsiKomentar     string  `json:"comment"`
	NilaiRating     float64 `json:"rating"`
	TanggalKomentar string  `json:"created_at"`
}

// BookmarkDTO merepresentasikan data komik yang dibookmark
type BookmarkDTO struct {
	IdBookmark         int     `json:"id"`
	IdPengguna         int     `json:"user_id"`
	IdKomik            int     `json:"comic_id"`
	NamaKomik          string  `json:"comic_name"`
	NamaStudio         string  `json:"studio"`
	RatingRataRata     float64 `json:"rating"`
	TanggalDitambahkan string  `json:"added_at"`
}

// HistoriDTO merepresentasikan data riwayat baca
type HistoriDTO struct {
	IdHistori   int    `json:"id"`
	IdPengguna  int    `json:"user_id"`
	IdBab       int    `json:"chapter_id"`
	NomorBab    int    `json:"chapter_number"`
	IdKomik     int    `json:"comic_id"`
	NamaKomik   string `json:"comic_name"`
	TanggalBaca string `json:"read_at"`
}

// TransaksiDTO merepresentasikan data transaksi pembayaran
type TransaksiDTO struct {
	IdTransaksi      int     `json:"id"`
	IdPengguna       int     `json:"user_id"`
	Username         string  `json:"username"`
	Email            string  `json:"email"`
	MetodePembayaran string  `json:"method"`
	StatusPembayaran string  `json:"status"`
	JumlahBayar      float64 `json:"amount"`
	TanggalTransaksi string  `json:"date"`
}

// UserDTO merepresentasikan data profil & manajemen pengguna
type UserDTO struct {
	IdPengguna int    `json:"id"`
	Username   string `json:"username"`
	Email      string `json:"email"`
	Role       string `json:"role"`
	IsPremium  bool   `json:"is_premium"`
}

