@echo off
title AgriSense Gemma Voice Translator
echo ========================================================
echo  AgriSense ^& AgriMarket AI - Local Gemma Voice Translator
echo  Powered by Google Gemma 4 (gemma4-e2b via LiteRT-LM)
echo ========================================================
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0start_translator.ps1"
pause
