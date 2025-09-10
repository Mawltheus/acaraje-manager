// Edge Function para adicionar cabeçalhos CORS
export default async (request, context) => {
  const response = await context.next();
  
  // Adicionar cabeçalhos CORS
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
};

// Configuração para ativar a Edge Function
export const config = {
  path: '/*', // Aplicar a todas as rotas
};
