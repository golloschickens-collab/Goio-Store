@echo off
REM ====================================================
REM ABRIR CLOUD SHELL - DEPLOY SISTEMA ELITE 24/7
REM ====================================================

echo.
echo ========================================
echo  ABRIENDO CLOUD SHELL PARA DEPLOY
echo ========================================
echo.
echo  Se abrira Google Cloud Shell en tu navegador
echo  Una vez abierto, ejecuta estos comandos:
echo.
echo  cd ~/Goio-Store/palacio-central
echo  chmod +x scripts/gcp/deploy-elite-24-7.sh
echo  ./scripts/gcp/deploy-elite-24-7.sh
echo.
echo ========================================
echo.

REM Abrir Cloud Shell con proyecto configurado
start https://shell.cloud.google.com/?project=goio-imperios-prod

echo.
echo  Cloud Shell abierto en navegador
echo  Sigue las instrucciones de arriba
echo.
pause
