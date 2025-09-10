const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Função para criar diretório se não existir
function ensureDirectoryExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

// Função para mover arquivos para uma pasta de backup
function backupFiles(files, backupDir) {
  console.log('\n📂 Criando backup dos arquivos...');
  ensureDirectoryExists(backupDir);
  
  files.forEach(file => {
    const source = path.join(__dirname, '..', file);
    const target = path.join(backupDir, file);
    
    // Cria diretório de destino se não existir
    const targetDir = path.dirname(target);
    ensureDirectoryExists(targetDir);
    
    if (fs.existsSync(source)) {
      try {
        fs.renameSync(source, target);
        console.log(`✅ Backup: ${file}`);
      } catch (err) {
        console.error(`❌ Erro ao fazer backup de ${file}:`, err.message);
      }
    } else {
      console.log(`ℹ️  Arquivo não encontrado: ${file}`);
    }
  });
}

// Função para remover arquivos/diretórios
function removeFiles(files) {
  console.log('\n🗑️  Removendo arquivos desnecessários...');
  
  files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    
    try {
      if (fs.existsSync(filePath)) {
        if (fs.lstatSync(filePath).isDirectory()) {
          fs.rmdirSync(filePath, { recursive: true });
        } else {
          fs.unlinkSync(filePath);
        }
        console.log(`✅ Removido: ${file}`);
      }
    } catch (err) {
      console.error(`❌ Erro ao remover ${file}:`, err.message);
    }
  });
}

// Lista de arquivos para mover para backup
const filesToBackup = [
  'INSTALACAO-CASA.md',
  'INSTRUCOES-EXECUCAO.md',
  'INSTRUCOES-GITHUB.md',
  'github-setup.md',
  'setup-guide.md',
  'netlify.toml.example',
  'server.js',
  'server-sqlite.js',
  'test-api.js',
  'query',
  'models-mongodb/'
];

// Lista de arquivos para remover completamente
const filesToRemove = [
  'node_modules/',
  '.git/'
];

// Diretório de backup
const backupDir = path.join(__dirname, '..', 'backup_' + new Date().toISOString().replace(/[:.]/g, '-'));

// Executar limpeza
console.log('🚀 Iniciando limpeza do projeto...');

// 1. Fazer backup dos arquivos
backupFiles(filesToBackup, backupDir);

// 2. Remover arquivos desnecessários
removeFiles(filesToRemove);

console.log('\n✨ Limpeza concluída!');
console.log(`📦 Backup salvo em: ${backupDir}`);
console.log('\nPróximos passos:');
console.log('1. Instale as dependências: npm install');
console.log('2. Inicie o servidor: npm start');
