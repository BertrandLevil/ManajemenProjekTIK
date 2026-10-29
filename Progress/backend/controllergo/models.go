package main

import "fmt"

// UserInterface mendefinisikan kontrak method umum untuk User
type UserInterface interface {
	Register() bool
	Login(inputUsernameOrEmail, inputPassword string) bool
	Logout()
	GetUsername() string
	GetEmail() string
	GetPassword() string
	IsLoggedIn() bool
	GetRole() string
}

// User merepresentasikan entitas dasar Pengguna (sesuai User.java)
type User struct {
	Username   string `json:"username"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	IsLoggedInState bool   `json:"isLoggedIn"`
}

func NewUser(username, email, password string) User {
	return User{
		Username:        username,
		Email:           email,
		Password:        password,
		IsLoggedInState: false,
	}
}

func (u *User) Login(inputUsernameOrEmail, inputPassword string) bool {
	if (inputUsernameOrEmail == u.Username || inputUsernameOrEmail == u.Email) && inputPassword == u.Password {
		u.IsLoggedInState = true
		fmt.Println("Login berhasil!")
		return true
	}
	fmt.Println("Login gagal!")
	return false
}

func (u *User) Logout() {
	u.IsLoggedInState = false
	fmt.Println("Berhasil logout.")
}

func (u *User) GetUsername() string { return u.Username }
func (u *User) GetEmail() string    { return u.Email }
func (u *User) GetPassword() string { return u.Password }
func (u *User) IsLoggedIn() bool    { return u.IsLoggedInState }

// =========================================================
// Admin (sesuai Admin.java)
// =========================================================
type Admin struct {
	User
	IdAdmin int `json:"idAdmin"`
}

func NewAdmin(username, email, password string, idAdmin int) *Admin {
	return &Admin{
		User:    NewUser(username, email, password),
		IdAdmin: idAdmin,
	}
}

func (a *Admin) Register() bool {
	fmt.Printf("Registrasi Admin (ID: %d) atas nama %s berhasil disimpan ke sistem pusat.\n", a.IdAdmin, a.GetUsername())
	return true
}

func (a *Admin) VerifyKomik(idKomik int) bool {
	if a.IsLoggedIn() {
		fmt.Printf("Admin %s telah memverifikasi kelayakan komik ID: %d\n", a.GetUsername(), idKomik)
		return true
	}
	fmt.Println("Akses ditolak. Admin belum login.")
	return false
}

func (a *Admin) UserManagement() {
	if a.IsLoggedIn() {
		fmt.Printf("Admin %s sedang mengakses panel manajemen pengguna.\n", a.GetUsername())
	}
}

func (a *Admin) KelolaPembayaran() {
	if a.IsLoggedIn() {
		fmt.Printf("Admin %s mengelola sistem dan riwayat pembayaran.\n", a.GetUsername())
	}
}

func (a *Admin) GetRole() string { return "Admin" }

// =========================================================
// Author / Kreator (sesuai Author.java)
// =========================================================
type Author struct {
	User
	NamaStudio  string   `json:"namaStudio"`
	DaftarKomik []string `json:"daftarKomik"`
	Pendapatan  float64  `json:"pendapatan"`
}

func NewAuthor(username, email, password, namaStudio string) *Author {
	return &Author{
		User:        NewUser(username, email, password),
		NamaStudio:  namaStudio,
		DaftarKomik: make([]string, 0),
		Pendapatan:  0.0,
	}
}

func (au *Author) Register() bool {
	fmt.Printf("Registrasi Author baru: %s (Studio: %s) berhasil.\n", au.GetUsername(), au.NamaStudio)
	return true
}

func (au *Author) PostKomik(namaKomik string) bool {
	if !au.IsLoggedIn() {
		fmt.Println("Gagal posting. Silakan login terlebih dahulu.")
		return false
	}
	au.DaftarKomik = append(au.DaftarKomik, namaKomik)
	fmt.Printf("Author %s berhasil memposting komik: %s\n", au.GetUsername(), namaKomik)
	return true
}

func (au *Author) UpdateKomik(idKomik int) bool {
	if au.IsLoggedIn() {
		fmt.Printf("Memperbarui data untuk komik ID: %d\n", idKomik)
		return true
	}
	return false
}

func (au *Author) Statistik() {
	fmt.Printf("=== Statistik Studio %s ===\n", au.NamaStudio)
	fmt.Printf("Total komik yang dipublish: %d\n", len(au.DaftarKomik))
}

func (au *Author) BacaKomentar() []string {
	fmt.Printf("Memuat semua komentar dari pembaca untuk Author %s...\n", au.GetUsername())
	return []string{}
}

func (au *Author) CekPendapatan() float64 {
	fmt.Printf("Total pendapatan %s saat ini: Rp%.2f\n", au.GetUsername(), au.Pendapatan)
	return au.Pendapatan
}

func (au *Author) GetRole() string { return "Kreator" }

// =========================================================
// Pembaca (sesuai Pembaca.java)
// =========================================================
type Pembaca struct {
	User
	IsPremiumState   bool  `json:"isPremium"`
	BookmarkKomikIds []int `json:"bookmarkKomikIds"`
}

func NewPembaca(username, email, password string) *Pembaca {
	return &Pembaca{
		User:             NewUser(username, email, password),
		IsPremiumState:   false,
		BookmarkKomikIds: make([]int, 0),
	}
}

func (p *Pembaca) Register() bool {
	fmt.Printf("Registrasi Pembaca baru: %s berhasil. Selamat membaca!\n", p.GetUsername())
	return true
}

func (p *Pembaca) BacaKomik(idKomik int) {
	if p.IsLoggedIn() {
		fmt.Printf("%s sedang membaca komik ID: %d\n", p.GetUsername(), idKomik)
	} else {
		fmt.Println("Silakan login untuk membaca komik.")
	}
}

func (p *Pembaca) SearchKomik(keyword string) []string {
	fmt.Printf("Mencari komik dengan kata kunci: %s\n", keyword)
	return []string{}
}

func (p *Pembaca) BeriRating(idKomik int, rating float64) {
	if p.IsLoggedIn() {
		fmt.Printf("%s memberikan rating %.1f untuk komik ID: %d\n", p.GetUsername(), rating, idKomik)
	}
}

func (p *Pembaca) Bookmark(idKomik int) {
	if p.IsLoggedIn() {
		p.BookmarkKomikIds = append(p.BookmarkKomikIds, idKomik)
		fmt.Printf("Komik ID: %d berhasil ditambahkan ke bookmark milik %s\n", idKomik, p.GetUsername())
	}
}

func (p *Pembaca) Komentar(idKomik int, isi string) {
	if p.IsLoggedIn() {
		fmt.Printf("%s berkomentar di komik ID %d: %s\n", p.GetUsername(), idKomik, isi)
	}
}

func (p *Pembaca) Pembayaran(jumlah float64) bool {
	if p.IsLoggedIn() {
		fmt.Printf("Memproses pembayaran upgrade akun sebesar: Rp%.2f\n", jumlah)
		p.IsPremiumState = true
		return true
	}
	return false
}

func (p *Pembaca) Translate() {
	if p.IsPremiumState {
		fmt.Printf("Fitur terjemahan otomatis diaktifkan untuk pembaca %s\n", p.GetUsername())
	} else {
		fmt.Println("Fitur translate hanya untuk akun premium.")
	}
}

func (p *Pembaca) IsPremium() bool { return p.IsPremiumState }
func (p *Pembaca) GetRole() string  { return "Pembaca" }
