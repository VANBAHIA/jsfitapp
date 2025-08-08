// netlify/functions/save-workout.js
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
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Method Not Allowed',
        message: 'Apenas POST é permitido para este endpoint'
      })
    };
  }

  try {
    // Verificar se há body na requisição
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Bad Request',
          message: 'Body da requisição é obrigatório'
        })
      };
    }

    // Parse do JSON
    const requestData = JSON.parse(event.body);
    
    // Validar dados obrigatórios
    if (!requestData.id || !requestData.plan) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Bad Request',
          message: 'Campos obrigatórios: id, plan'
        })
      };
    }

    // Validar ID (deve ter 6 caracteres)
    if (typeof requestData.id !== 'string' || requestData.id.length !== 6) {
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

    // Preparar dados para salvar
    const workoutData = {
      id: requestData.id.toUpperCase(),
      originalId: requestData.originalId || requestData.id,
      plan: requestData.plan,
      timestamp: new Date().toISOString(),
      version: requestData.version || '1.0',
      lastModified: new Date().toISOString()
    };

    // Definir caminho do arquivo
    const dataDir = path.join(process.cwd(), 'public', 'data', 'workouts');
    const filePath = path.join(dataDir, `${workoutData.id}.json`);

    // Criar diretório se não existir
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Salvar arquivo JSON
    fs.writeFileSync(filePath, JSON.stringify(workoutData, null, 2), 'utf8');

    // Calcular tamanho do arquivo
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;

    console.log(`[SaveWorkout] Treino ${workoutData.id} salvo com sucesso (${fileSizeInBytes} bytes)`);

    // Resposta de sucesso
    const response = {
      success: true,
      message: 'Treino salvo com sucesso',
      data: {
        id: workoutData.id,
        timestamp: workoutData.timestamp,
        fileSize: fileSizeInBytes,
        filePath: `/data/workouts/${workoutData.id}.json`
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('[SaveWorkout] Erro ao salvar treino:', error);

    // Verificar se é erro de JSON parse
    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Bad Request',
          message: 'JSON inválido no body da requisição'
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