const { execSync } = require('child_process');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Iniciando atualização do repositório...\n');

// Verificar se é um repositório Git
function isGitRepo() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Executar comandos Git
function runGitCommand(command) {
  try {
    console.log(`Executando: ${command}`);
    const result = execSync(command, { stdio: 'pipe' }).toString().trim();
    console.log(result);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao executar: ${command}\n${error.stderr.toString()}`);
    return false;
  }
}

// Função principal
async function updateRepository() {
  if (!isGitRepo()) {
    console.log('Inicializando repositório Git...');
    if (!runGitCommand('git init')) {
      console.log('❌ Falha ao inicializar o repositório Git');
      return;
    }
  }

  // Configurar remote
  console.log('\n🔗 Configurando repositório remoto...');
  runGitCommand('git remote remove origin');
  runGitCommand('git remote add origin https://github.com/Mawltheus/acaraje-manager.git');

  // Baixar alterações
  console.log('\n⬇️  Baixando alterações do GitHub...');
  runGitCommand('git fetch origin');

  // Criar branch para as alterações
  const branchName = `update-${new Date().toISOString().split('T')[0]}`;
  console.log(`\n🌿 Criando branch: ${branchName}`);
  runGitCommand(`git checkout -b ${branchName}`);

  // Adicionar arquivos
  console.log('\n📦 Adicionando arquivos...');
  runGitCommand('git add .');

  // Fazer commit
  console.log('\n💾 Criando commit...');
  runGitCommand('git commit -m "Atualização de arquivos"');

  // Enviar para o GitHub
  console.log(`\n🚀 Enviando para o GitHub (branch: ${branchName})...`);
  runGitCommand(`git push -u origin ${branchName}`);

  console.log('\n✅ Repositório atualizado com sucesso!');
  console.log('\nPróximos passos:');
  console.log(`1. Acesse: https://github.com/Mawltheus/acaraje-manager`);
  console.log(`2. Crie um Pull Request da branch '${branchName}' para 'main'`);
  console.log('3. Revise e aprove as alterações');
  console.log('4. Faça o merge do Pull Request');
}

// Executar a atualização
updateRepository().catch(console.error);
