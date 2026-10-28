@echo off
title ComicID Backend Server
cd /d "%~dp0"
echo =======================================================
echo          COMICID BACKEND SERVER RUNNER
echo =======================================================
echo.

REM Bebaskan port 8080 jika ada proses Java lama yang masih berjalan
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo [1/2] Mengompilasi source code Java...
javac -encoding UTF-8 -cp ".;lib\mysql-connector-j-8.4.0.jar;..\..\..\IPPL\Implementasi Class Diagram" DatabaseConnection.java LoginController.java
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Kompilasi gagal! Periksa instalasi JDK Anda.
    pause
    exit /b %ERRORLEVEL%
)

echo [2/2] Menjalankan Server Backend di port 8080...
echo.
java -cp ".;lib\mysql-connector-j-8.4.0.jar;..\..\..\IPPL\Implementasi Class Diagram" LoginController
pause
