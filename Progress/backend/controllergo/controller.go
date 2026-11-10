package main

import (
	"database/sql"
	"errors"
	"strings"
)

var ErrInvalidPassword = errors.New("Password salah.")

type LoginController struct{}

func NewLoginController() *LoginController {
	return &LoginController{}
}

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
			return nil, nil
		}
		return nil, err
	}

	if dbPassword != passwordInput {
		return nil, ErrInvalidPassword
	}

	var loggedInUser UserInterface

	switch role {
	case "Admin":
		admin := NewAdmin(username, dbEmail, dbPassword, idPengguna)
		admin.SetId(idPengguna)
		loggedInUser = admin
	case "Kreator":
		author := NewAuthor(username, dbEmail, dbPassword, "-")
		author.SetId(idPengguna)
		loggedInUser = author
	default:
		pembaca := NewPembaca(username, dbEmail, dbPassword)
		pembaca.SetId(idPengguna)
		if isPremium == 1 {
			pembaca.IsPremiumState = true
		}
		loggedInUser = pembaca
	}

	loggedInUser.Login(dbEmail, dbPassword)
	return loggedInUser, nil
}

func (c *LoginController) RegisterWithQuery(username, email, password, role string) (bool, error) {
	conn, err := GetConnection()
	if err != nil {
		return false, err
	}

	checkUserQuery := `SELECT id_pengguna FROM pengguna WHERE LOWER(username) = LOWER(?)`
	var existingId int
	err = conn.QueryRow(checkUserQuery, username).Scan(&existingId)
	if err == nil {
		return false, errors.New("Nama pengguna sudah digunakan.")
	} else if !errors.Is(err, sql.ErrNoRows) {
		return false, err
	}

	checkEmailQuery := `SELECT id_pengguna FROM pengguna WHERE LOWER(email) = LOWER(?)`
	err = conn.QueryRow(checkEmailQuery, email).Scan(&existingId)
	if err == nil {
		return false, errors.New("Email sudah terdaftar.")
	} else if !errors.Is(err, sql.ErrNoRows) {
		return false, err
	}

	finalRole := strings.TrimSpace(role)
	if finalRole == "" {
		finalRole = "Pembaca"
	}
	isPremium := 0

	pembacaBaru := NewPembaca(username, email, password)
	pembacaBaru.Register()

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
