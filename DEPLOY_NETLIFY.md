# Guia de Implantação no Netlify

Este guia explica como implantar o Acarajé Manager no Netlify e conectá-lo ao seu backend.

## Pré-requisitos

1. Conta no [Netlify](https://www.netlify.com/)
2. Repositório Git (GitHub, GitLab ou Bitbucket) com o código do Acarajé Manager
3. Backend da aplicação implantado e acessível pela internet

## Passo 1: Preparar o Backend

1. **Implantar o Backend**:
   - O backend deve estar acessível em uma URL pública (ex: `https://seu-backend-api.com`)
   - Certifique-se de que o CORS está configurado corretamente para permitir requisições do seu domínio Netlify

2. **Configurar Variáveis de Ambiente**:
   - `ALLOWED_ORIGINS`: Domínios permitidos (ex: `https://seu-site.netlify.app,https://*.netlify.app`)
   - `JWT_SECRET`: Chave secreta para autenticação JWT
   - `NODE_ENV`: `production`

## Passo 2: Configurar o Frontend

1. **Atualizar a URL da API**:
   - No arquivo `public/index.html`, atualize a URL da API:
   ```javascript
   window.API_BASE_URL = 'https://seu-backend-api.com';
   ```

2. **Configurar Variáveis de Ambiente no Netlify**:
   - Acesse as configurações do seu site no Netlify
   - Vá em "Build & Deploy" > "Environment"
   - Adicione as seguintes variáveis:
     - `NODE_VERSION`: 16
     - `NPM_VERSION`: 8
     - `REACT_APP_API_URL`: `https://seu-backend-api.com/api`

## Passo 3: Implantar no Netlify

### Opção 1: Conectar ao Repositório Git
1. Acesse o [Painel do Netlify](https://app.netlify.com/)
2. Clique em "New site from Git"
3. Escolha seu provedor Git e selecione o repositório
4. Nas configurações de build:
   - Build command: `npm run build` (ou deixe em branco se não houver build necessária)
   - Publish directory: `public`
5. Clique em "Deploy site"

### Opção 2: Arrastar e Soltar (Drag and Drop)
1. Execute o comando para gerar os arquivos estáticos:
   ```bash
   npm run build
   ```
2. Acesse o [Painel do Netlify](https://app.netlify.com/)
3. Arraste e solte a pasta `public` na área indicada

## Passo 4: Configurar Domínio Personalizado (Opcional)

1. Acesse as configurações do site no Netlify
2. Vá em "Domain management"
3. Clque em "Add custom domain" e siga as instruções

## Passo 5: Configurar HTTPS

O Netlify fornece certificados SSL gratuitos automaticamente. Para habilitar:

1. Acesse as configurações do site
2. Vá em "Domain management" > "HTTPS"
3. Siga as instruções para configurar o certificado SSL

## Solução de Problemas

### Erros de CORS
- Verifique se o backend está retornando os cabeçalhos CORS corretos
- Confirme se o domínio do Netlify está na lista de origens permitidas

### Erros de API
- Verifique se a URL da API está correta nas configurações do Netlify
- Confirme se o backend está online e acessível

### Problemas de Autenticação
- Verifique se o `JWT_SECRET` está configurado corretamente no backend
- Confirme se as rotas de autenticação estão funcionando

## Atualizações Futuras

Para atualizar o site após fazer alterações no código:

1. Faça commit e push das alterações para o repositório Git
2. O Netlify fará o deploy automático (se configurado)
3. Ou inicie um deploy manual no painel do Netlify

---

Se precisar de ajuda, consulte a [documentação do Netlify](https://docs.netlify.com/).
