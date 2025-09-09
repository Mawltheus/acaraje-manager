@echo off
echo ===================================================
echo  🧹 LIMPEZA E ORGANIZAÇÃO DO PROJETO ACARAJÉ MANAGER
echo ===================================================

echo.
echo 🔄 Atualizando o README.md...
node scripts/update-readme.js

echo.
echo 🗑️  Executando limpeza...
node scripts/cleanup-project.js

echo.
echo 📦 Instalando dependências...
call npm install

echo.
echo ✅ Limpeza concluída com sucesso!
echo.
echo Próximos passos:
echo 1. Revise as alterações feitas
echo 2. Faça commit das mudanças
echo 3. Execute o servidor com: npm start
echo.
pause
