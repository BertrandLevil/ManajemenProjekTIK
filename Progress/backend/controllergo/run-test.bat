@echo off
title ComicID Controller Test Suite
cd /d "%~dp0"
echo =======================================================
echo         COMICID CONTROLLER TEST RUNNER (GOLANG)
echo =======================================================
echo.
echo Menjalankan pengujian controller status test...
echo.
go test -v -run TestControllerStatusSuite .
echo.
pause
