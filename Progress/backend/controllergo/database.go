package main

import (
	"database/sql"
	"fmt"
	"sync"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

var (
	db   *sql.DB
	dbMu sync.Mutex
)

// Konfigurasi koneksi MySQL / MariaDB (Laragon)
// Database: comicid, Port default: 3306
const (
	dbUser     = "root"
	dbPassword = "" // Default password MySQL di Laragon adalah kosong ("")
	dbHost     = "127.0.0.1"
	dbPort     = "3306"
	dbName     = "comicid"
)

// GetConnection mengembalikan instance pool koneksi database MySQL
func GetConnection() (*sql.DB, error) {
	dbMu.Lock()
	defer dbMu.Unlock()

	if db != nil {
		if err := db.Ping(); err == nil {
			return db, nil
		}
		_ = db.Close()
		db = nil
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=true&loc=UTC",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	newDB, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Printf("[DatabaseConnection] Gagal menginisialisasi driver MySQL: %v\n", err)
		return nil, err
	}

	newDB.SetMaxOpenConns(25)
	newDB.SetMaxIdleConns(5)
	newDB.SetConnMaxLifetime(5 * time.Minute)

	if err := newDB.Ping(); err != nil {
		_ = newDB.Close()
		return nil, err
	}

	db = newDB
	return db, nil
}

// TestConnection menguji apakah koneksi ke database 'comicid' berhasil
func TestConnection() bool {
	conn, err := GetConnection()
	if err != nil {
		fmt.Printf("[DatabaseConnection] Gagal menghubungkan ke database 'comicid': %v\n", err)
		return false
	}
	return conn != nil
}
