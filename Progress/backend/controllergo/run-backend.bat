@echo off
title ComicID Backend Server (Golang)
cd /d "%~dp0"
echo =======================================================
echo     COMICID BACKEND SERVER RUNNER (GOLANG VERSION)
echo =======================================================
echo.

REM Bebaskan port 8080 jika ada proses backend lama yang masih berjalan
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo [1/2] Memeriksa modul dan dependensi Go...
go mod tidy
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Gagal memverifikasi dependensi Go.
    pause
    exit /b %ERRORLEVEL%
)

echo [2/2] Menjalankan Server Backend Golang di port 8080...
echo.
go run .
pause
