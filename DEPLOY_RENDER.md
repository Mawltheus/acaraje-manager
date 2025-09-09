# Guia de Deploy no Render

Este guia explica como implantar o backend do Acarajé Manager no Render.

## Pré-requisitos

1. Conta no [Render](https://render.com/)
2. Repositório Git com o código do projeto
3. Node.js 16+ instalado localmente

## Opção 1: Deploy Automático (Recomendado)

1. Clique no botão abaixo para iniciar o deploy automático:

   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Mawltheus/acaraje-manager)

2. Siga as instruções na tela para conectar sua conta do GitHub
3. Configure as variáveis de ambiente conforme necessário
4. Clique em "Create Web Service"

## Opção 2: Deploy Manual

1. Acesse o [Painel do Render](https://dashboard.render.com/)
2. Clique em "New" > "Web Service"
3. Conecte seu repositório do GitHub
4. Configure o serviço:
   - **Name**: `acaraje-backend`
   - **Region**: `Ohio` (mais próximo do Brasil)
   - **Branch**: `main` (ou sua branch principal)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

5. Adicione as variáveis de ambiente:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=sua_chave_secreta_aqui
   ALLOWED_ORIGINS=https://acarajeeabaradolouro.netlify.app
   ```

6. Clique em "Create Web Service"

## Variáveis de Ambiente

| Variável | Valor | Obrigatório |
|----------|-------|-------------|
| `NODE_ENV` | `production` | ✅ |
| `PORT` | `10000` | ✅ |
| `JWT_SECRET` | Sua chave secreta | ✅ |
| `ALLOWED_ORIGINS` | `https://acarajeeabaradolouro.netlify.app` | ✅ |

## Solução de Problemas

1. **Erro ao iniciar o servidor**:
   - Verifique os logs em "Logs" > "Service Logs"
   - Confira se todas as variáveis de ambiente estão corretas

2. **Erro de conexão com o banco de dados**:
   - Verifique se o banco de dados está acessível
   - Confira as credenciais no arquivo `.env`

3. **Erros de CORS**:
   - Verifique se o domínio do seu frontend está em `ALLOWED_ORIGINS`

## Atualizando o Serviço

1. Faça push das alterações para o repositório
2. O Render fará o deploy automático
3. Acompanhe o progresso em "Deploys"

---

Para mais informações, consulte a [documentação do Render](https://render.com/docs).
