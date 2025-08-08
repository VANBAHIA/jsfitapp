// netlify/functions/get-workout.js
const fs = require('fs');
const path = require('path');

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
    // Extrair ID da URL path
    const pathParts = event.path.split('/');
    const workoutId = pathParts[pathParts.length - 1];

    // Validar ID
    if (!workoutId || workoutId === 'get-workout') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Bad Request',
          message: 'ID do treino é obrigatório na URL'
        })
      };
    }

    // Validar formato do ID (6 caracteres)
    if (workoutId.length !== 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Bad Request',
          message: 'ID deve ter exatamente 6 caracteres'
        })
      };
    }

    // Definir caminho do arquivo
    const dataDir = path.join(process.cwd(), 'public', 'data', 'workouts');
    const filePath = path.join(dataDir, `${workoutId.toUpperCase()}.json`);

    // Verificar se arquivo existe
    if (!fs.existsSync(filePath)) {
      console.log(`[GetWorkout] Treino ${workoutId} não encontrado`);
      
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Not Found',
          message: `Treino com ID ${workoutId} não encontrado`
        })
      };
    }

    // Ler arquivo JSON
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const workoutData = JSON.parse(fileContent);

    // Verificar integridade dos dados
    if (!workoutData.id || !workoutData.plan) {
      console.error(`[GetWorkout] Dados corrompidos para treino ${workoutId}`);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Internal Server Error',
          message: 'Dados do treino estão corrompidos'
        })
      };
    }

    console.log(`[GetWorkout] Treino ${workoutId} encontrado e retornado com sucesso`);

    // Resposta de sucesso
    const response = {
      success: true,
      message: 'Treino encontrado',
      data: workoutData,
      timestamp: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('[GetWorkout] Erro ao buscar treino:', error);

    // Verificar se é erro de JSON parse
    if (error instanceof SyntaxError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Internal Server Error',
          message: 'Arquivo de treino corrompido'
        })
      };
    }

    // Erro interno do servidor
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal Server Error',
        message: 'Erro interno do servidor',
        details: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};