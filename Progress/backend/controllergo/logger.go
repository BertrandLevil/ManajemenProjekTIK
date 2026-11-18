package main

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

// LogStatus mencatat log status terstandarisasi untuk seluruh aksi pada controller.
// Format: [LOG STATUS][Controller.Aksi] STATUS: <SUCCESS|FAILED|ERROR|NOT_FOUND|NO_OP> | <keterangan>
func LogStatus(controller, action, status, format string, args ...interface{}) {
	detail := fmt.Sprintf(format, args...)
	log.Printf("[LOG STATUS][%s.%s] STATUS: %s | %s", controller, action, status, detail)
}

// statusResponseWriter membungkus http.ResponseWriter untuk merekam status code HTTP respon.
type statusResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (lrw *statusResponseWriter) WriteHeader(code int) {
	lrw.statusCode = code
	lrw.ResponseWriter.WriteHeader(code)
}

// RequestLoggerMiddleware mencatat seluruh permintaan HTTP beserta status respon dan durasinya.
func RequestLoggerMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		lrw := &statusResponseWriter{ResponseWriter: w, statusCode: http.StatusOK}
		next.ServeHTTP(lrw, r)
		duration := time.Since(start)
		log.Printf("[HTTP STATUS] %s %s | STATUS: %d | Durasi: %v", r.Method, r.URL.Path, lrw.statusCode, duration)
	})
}
