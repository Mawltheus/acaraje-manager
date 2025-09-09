@echo off
echo ===================================================
echo  🔄 ATUALIZANDO REPOSITÓRIO NO GITHUB
echo ===================================================
echo.

:: Verificar se o Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js em https://nodejs.org/
    pause
    exit /b 1
)

:: Verificar se o Git está instalado
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Git não encontrado. Por favor, instale o Git em https://git-scm.com/
    pause
    exit /b 1
)

:: Configurar usuário do Git
set /p GIT_EMAIL="Digite seu email do GitHub: "
git config --global user.email "%GIT_EMAIL%"
set /p GIT_NAME="Digite seu nome de usuário do GitHub: "
git config --global user.name "%GIT_NAME%"

echo.
echo 🚀 Iniciando atualização do repositório...

:: Executar o script de atualização em Node.js
node scripts/update-github.js

if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Ocorreu um erro ao atualizar o repositório.
    echo   Por favor, verifique as mensagens acima para mais detalhes.
    pause
    exit /b 1
)

echo.
echo ✅ Processo de atualização concluído com sucesso!
echo   Por favor, siga as instruções acima para finalizar a atualização.
pause
