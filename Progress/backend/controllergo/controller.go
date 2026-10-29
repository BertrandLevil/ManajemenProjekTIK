package main

import (
	"database/sql"
	"errors"
	"strings"
)

// ErrInvalidPassword menunjukkan bahwa kata sandi salah
var ErrInvalidPassword = errors.New("Password salah.")

// LoginController mengelola logika bisnis otentikasi pengguna
type LoginController struct{}

func NewLoginController() *LoginController {
	return &LoginController{}
}

// =========================================================
// 1. Method Utama Controller: Login (Verifikasi Akun Pengguna)
// =========================================================
func (c *LoginController) LoginWithQuery(emailOrUsername, passwordInput string) (UserInterface, error) {
	conn, err := GetConnection()
	if err != nil {
		return nil, err
	}

	query := `SELECT id_pengguna, username, email, password, role, is_premium 
              FROM pengguna 
              WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)`

	var (
		idPengguna int
		username   string
		dbEmail    string
		dbPassword string
		role       string
		isPremium  int
	)

	err = conn.QueryRow(query, emailOrUsername, emailOrUsername).Scan(
		&idPengguna, &username, &dbEmail, &dbPassword, &role, &isPremium,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // Akun belum terdaftar
		}
		return nil, err
	}

	if dbPassword != passwordInput {
		return nil, ErrInvalidPassword
	}

	var loggedInUser UserInterface

	switch role {
	case "Admin":
		loggedInUser = NewAdmin(username, dbEmail, dbPassword, idPengguna)
	case "Kreator":
		loggedInUser = NewAuthor(username, dbEmail, dbPassword, "-")
	default:
		pembaca := NewPembaca(username, dbEmail, dbPassword)
		if isPremium == 1 {
			pembaca.IsPremiumState = true
		}
		loggedInUser = pembaca
	}

	loggedInUser.Login(dbEmail, dbPassword)
	return loggedInUser, nil
}

// =========================================================
// 2. Method Utama Controller: Register (Registrasi Akun Baru)
// =========================================================
func (c *LoginController) RegisterWithQuery(username, email, password, role string) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		return false, err
	}

	// Cek apakah username sudah dipakai
	checkUserQuery := `SELECT id_pengguna FROM pengguna WHERE LOWER(username) = LOWER(?)`
	var existingId int
	err = conn.QueryRow(checkUserQuery, username).Scan(&existingId)
	if err == nil {
		return false, errors.New("Nama pengguna sudah digunakan.")
	} else if !errors.Is(err, sql.ErrNoRows) {
		return false, err
	}

	// Cek apakah email sudah terdaftar
	checkEmailQuery := `SELECT id_pengguna FROM pengguna WHERE LOWER(email) = LOWER(?)`
	err = conn.QueryRow(checkEmailQuery, email).Scan(&existingId)
	if err == nil {
		return false, errors.New("Email sudah terdaftar.")
	} else if !errors.Is(err, sql.ErrNoRows) {
		return false, err
	}

	// Default role: Pembaca jika tidak ditentukan
	finalRole := strings.TrimSpace(role)
	if finalRole == "" {
		finalRole = "Pembaca"
	}
	isPremium := 0

	// Instansiasi model sesuai class diagram untuk mencatat logika bisnis
	pembacaBaru := NewPembaca(username, email, password)
	pembacaBaru.Register()

	// Simpan ke database `pengguna`
	insertQuery := `INSERT INTO pengguna (username, email, password, role, is_premium) VALUES (?, ?, ?, ?, ?)`
	res, err := conn.Exec(insertQuery, username, email, password, finalRole, isPremium)
	if err != nil {
		return false, err
	}

	affected, err := res.RowsAffected()
	if err != nil {
		return false, err
	}

	return affected > 0, nil
}
