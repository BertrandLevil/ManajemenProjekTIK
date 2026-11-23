package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"
)

// LogEnabled mengatur apakah LogStatus aktif mencetak ke output console.
// Dapat dinonaktifkan saat menjalankan test suite agar output bersih.
var LogEnabled = true

// LogStatus mencatat status controller hanya untuk status SUCCESS atau FAILED.
// Format: [LOG STATUS][Controller.Aksi] STATUS: <SUCCESS|FAILED> | <keterangan>
func LogStatus(controller, action, status, format string, args ...interface{}) {
	if !LogEnabled {
		return
	}

	statusUpper := strings.ToUpper(strings.TrimSpace(status))
	// Normalisasi status error / not found menjadi FAILED agar log konsisten
	if statusUpper == "ERROR" || statusUpper == "NOT_FOUND" {
		statusUpper = "FAILED"
	}

	// Hanya cetak status SUCCESS atau FAILED
	if statusUpper != "SUCCESS" && statusUpper != "FAILED" {
		return
	}

	detail := fmt.Sprintf(format, args...)
	log.Printf("[LOG STATUS][%s.%s] STATUS: %s | %s", controller, action, statusUpper, detail)
}

// RequestLoggerMiddleware meneruskan request tanpa mencetak log HTTP status.
func RequestLoggerMiddleware(next http.Handler) http.Handler {
	return next
}
