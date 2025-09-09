// Exemplo de função Netlify
// Pode ser usada para criar APIs serverless

exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Netlify Function!" })
  };
};
