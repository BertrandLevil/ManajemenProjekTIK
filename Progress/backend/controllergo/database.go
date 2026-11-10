package main

import (
	"database/sql"
	"fmt"
	"os"
	"sync"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

var (
	db   *sql.DB
	dbMu sync.Mutex
)

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

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

	dbUser := getEnv("DB_USER", "root")
	dbPassword := getEnv("DB_PASSWORD", "")
	dbHost := getEnv("DB_HOST", "127.0.0.1")
	dbPort := getEnv("DB_PORT", "3306")
	dbName := getEnv("DB_NAME", "comicid")

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

func TestConnection() bool {
	conn, err := GetConnection()
	if err != nil {
		fmt.Printf("[DatabaseConnection] Gagal menghubungkan ke database 'comicid': %v\n", err)
		return false
	}
	return conn != nil
}
