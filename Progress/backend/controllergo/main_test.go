package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestModelOOP(t *testing.T) {
	// Test Admin
	admin := NewAdmin("admin_test", "admin@test.com", "pass1234", 1)
	if !admin.Register() {
		t.Errorf("Admin Register failed")
	}
	if !admin.Login("admin_test", "pass1234") {
		t.Errorf("Admin Login failed")
	}
	if !admin.VerifyKomik(101) {
		t.Errorf("Admin VerifyKomik failed")
	}
	if admin.GetRole() != "Admin" {
		t.Errorf("Expected role Admin, got %s", admin.GetRole())
	}

	// Test Author
	author := NewAuthor("author_test", "author@test.com", "pass1234", "Studio A")
	if !author.Register() {
		t.Errorf("Author Register failed")
	}
	if !author.Login("author@test.com", "pass1234") {
		t.Errorf("Author Login failed")
	}
	if !author.PostKomik("Komik Petualangan") {
		t.Errorf("Author PostKomik failed")
	}
	if author.GetRole() != "Kreator" {
		t.Errorf("Expected role Kreator, got %s", author.GetRole())
	}

	// Test Pembaca
	pembaca := NewPembaca("reader_test", "reader@test.com", "pass1234")
	if !pembaca.Register() {
		t.Errorf("Pembaca Register failed")
	}
	if !pembaca.Login("reader_test", "pass1234") {
		t.Errorf("Pembaca Login failed")
	}
	pembaca.Bookmark(202)
	if len(pembaca.BookmarkKomikIds) != 1 || pembaca.BookmarkKomikIds[0] != 202 {
		t.Errorf("Pembaca Bookmark failed")
	}
	if pembaca.GetRole() != "Pembaca" {
		t.Errorf("Expected role Pembaca, got %s", pembaca.GetRole())
	}
}

func TestValidationHandlers(t *testing.T) {
	controller := NewLoginController()

	// Test Login validation empty body
	req := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewBufferString(`{}`))
	rec := httptest.NewRecorder()
	LoginHttpHandler(controller)(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 for empty login, got %d", rec.Code)
	}

	var resp map[string]interface{}
	_ = json.Unmarshal(rec.Body.Bytes(), &resp)
	if resp["success"] != false {
		t.Errorf("Expected success to be false")
	}

	// Test Register validation invalid email
	regBody := `{"username":"testuser","email":"invalid-email","password":"password123","role":"Pembaca"}`
	reqReg := httptest.NewRequest(http.MethodPost, "/api/register", bytes.NewBufferString(regBody))
	recReg := httptest.NewRecorder()
	RegisterHttpHandler(controller)(recReg, reqReg)

	if recReg.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 for invalid email, got %d", recReg.Code)
	}

	// Test Health handler
	reqHealth := httptest.NewRequest(http.MethodGet, "/api/health", nil)
	recHealth := httptest.NewRecorder()
	HealthHttpHandler()(recHealth, reqHealth)

	// Will return 200 or 503 depending on MySQL running
	if recHealth.Code != http.StatusOK && recHealth.Code != http.StatusServiceUnavailable {
		t.Errorf("Unexpected status code from health check: %d", recHealth.Code)
	}
}
