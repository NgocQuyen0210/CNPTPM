@echo off
title Khoi dong E-Commerce Microservices
cd /d "%~dp0"
echo Dang khoi dong toan bo he thong (Microservices ^& Frontend)...
powershell -ExecutionPolicy Bypass -File start-all.ps1
echo.
echo Da kich hoat lenh khoi dong tat ca cac services!
echo Cac cua so terminal rieng da duoc mo.
pause
