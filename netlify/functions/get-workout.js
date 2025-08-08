// netlify/functions/get-workout.js
const fs = require('fs').promises;
const path = require('path');

// Diretório onde os arquivos JSON estão salvos
const WORKOUTS_DIR = path.join(process.cwd(), 'public', 'data', 'workouts');

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Apenas GET permitido
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Extrair shareId da URL
    const pathSegments = event.path.split('/');
    const shareId = pathSegments[pathSegments.length - 1]?.toUpperCase();

    // Validar shareId
    if (!shareId || !/^[A-Z0-9]{6}$/.test(shareId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'ID inválido. Deve ter exatamente 6 caracteres alfanuméricos'
        })
      };
    }

    // Caminho do arquivo
    const filePath = path.join(WORKOUTS_DIR, `${shareId}.json`);

    // Verificar se arquivo existe
    try {
      await fs.access(filePath);
    } catch {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'Plano não encontrado',
          shareId: shareId
        })
      };
    }

    // Ler arquivo JSON
    const fileContent = await fs.readFile(filePath, 'utf8');
    const workoutData = JSON.parse(fileContent);

    // Registrar acesso (log)
    console.log(`Workout ${shareId} accessed successfully`);

    // Retornar dados do plano
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: {
          id: workoutData.id,
          plan: workoutData.plan,
          timestamp: workoutData.timestamp,
          version: workoutData.version,
          lastModified: workoutData.metadata?.lastModified
        },
        metadata: {
          accessedAt: new Date().toISOString(),
          source: 'file-storage'
        }
      })
    };

  } catch (error) {
    console.error('Error reading workout:', error);
    
    // Se erro de parsing JSON
    if (error instanceof SyntaxError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Arquivo de plano corrompido',
          details: 'Por favor, solicite um novo ID ao personal trainer'
        })
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro interno do servidor ao ler arquivo',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};