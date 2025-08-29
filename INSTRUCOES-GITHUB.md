# 🚀 Como Subir para o GitHub - PASSO A PASSO

## **MÉTODO MAIS FÁCIL:**

### **1. Primeiro, criar repositório no GitHub:**
1. Acesse: https://github.com/Mawltheus
2. Clique em "New repository" (botão verde)
3. Nome: `acaraje-manager`
4. Deixe público ou privado (sua escolha)
5. **NÃO** marque "Add README" (já temos arquivos)
6. Clique "Create repository"

### **2. Executar o arquivo que criei:**
```bash
# Duplo clique no arquivo:
upload-github.bat
```

**OU** abrir novo terminal PowerShell e digitar:
```bash
cd C:\Users\adm.mateus\CascadeProjects\acaraje-manager
git init
git add .
git commit -m "Sistema Acaraje Manager - Versao inicial"
git remote add origin https://github.com/Mawltheus/acaraje-manager.git
git push -u origin main
```

## **SE DER ERRO:**

### **Erro de autenticação:**
- GitHub vai pedir login
- Use seu username: `Mawltheus`
- Senha: Seu token pessoal (não a senha normal)

### **Para criar token:**
1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Marcar: `repo`, `workflow`
4. Copiar o token e usar como senha

## **RESULTADO FINAL:**
✅ Projeto estará em: https://github.com/Mawltheus/acaraje-manager

## **PARA BAIXAR EM CASA:**
```bash
git clone https://github.com/Mawltheus/acaraje-manager.git
cd acaraje-manager
npm install
node server-demo.js
```

---

**🎯 Tamanho do projeto agora: ~2MB (sem node_modules)**
