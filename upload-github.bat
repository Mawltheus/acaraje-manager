@echo off
echo 🚀 Subindo projeto para GitHub - Mawltheus
echo.

REM Configurar Git (primeira vez)
git config --global user.name "Mawltheus"
git config --global user.email "seu-email@gmail.com"

REM Inicializar repositório
git init

REM Adicionar todos os arquivos (exceto node_modules - já configurado no .gitignore)
git add .

REM Fazer commit inicial
git commit -m "Sistema Acaraje Manager - Versao inicial completa"

REM Conectar com seu GitHub
git remote add origin https://github.com/Mawltheus/acaraje-manager.git

REM Fazer push para GitHub
git branch -M main
git push -u origin main

echo.
echo ✅ Projeto enviado para: https://github.com/Mawltheus/acaraje-manager
echo.
echo 📋 Próximos passos:
echo 1. Criar repositório "acaraje-manager" no GitHub
echo 2. Executar este arquivo novamente se necessário
echo.
pause
