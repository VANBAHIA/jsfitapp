// netlify/functions/health.js
exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Verificar método HTTP
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Method Not Allowed',
        message: 'Apenas GET é permitido para este endpoint'
      })
    };
  }

  try {
    // Retornar status de saúde da API
    const response = {
      success: true,
      status: 'online',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      message: 'API funcionando corretamente'
    };

    console.log('[Health] API health check realizado com sucesso');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('[Health] Erro no health check:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        status: 'error',
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
      })
    };
  }
};