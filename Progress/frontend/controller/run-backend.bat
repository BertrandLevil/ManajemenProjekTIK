@echo off
title ComicID Backend Server (Auth: Login & Register)
cd /d "%~dp0"
echo =======================================================
echo          COMICID BACKEND SERVER RUNNER
echo =======================================================
echo.
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
