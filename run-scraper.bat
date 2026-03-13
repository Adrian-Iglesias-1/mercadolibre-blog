@echo off
cd /d "%~dp0"
echo 🚀 Iniciando actualizacion de productos ShopHub...
npm run scrape
echo ✅ Proceso completado.
exit
