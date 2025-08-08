// netlify/functions/health.js
const fs = require('fs').promises;
const path = require('path');

// Diretório onde os arquivos JSON estão salvos
const WORKOUTS_DIR = path.join(process.cwd(), 'public', 'data', 'workouts');
const INDEX_FILE = path.join(WORKOUTS_DIR, 'index.json');

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
    // Verificar se diretório existe
    let directoryExists = true;
    try {
      await fs.access(WORKOUTS_DIR);
    } catch {
      directoryExists = false;
    }

    // Ler informações do índice se existir
    let indexInfo = null;
    if (directoryExists) {
      try {
        const indexData = await fs.readFile(INDEX_FILE, 'utf8');
        const index = JSON.parse(indexData);
        indexInfo = {
          totalWorkouts: index.totalWorkouts || index.workouts?.length || 0,
          lastUpdated: index.lastUpdated,
          hasIndex: true
        };
      } catch {
        // Contar arquivos manualmente se índice não existir
        try {
          const files = await fs.readdir(WORKOUTS_DIR);
          const jsonFiles = files.filter(file => file.endsWith('.json') && file !== 'index.json');
          indexInfo = {
            totalWorkouts: jsonFiles.length,
            lastUpdated: null,
            hasIndex: false
          };
        } catch {
          indexInfo = {
            totalWorkouts: 0,
            lastUpdated: null,
            hasIndex: false
          };
        }
      }
    }

    // Informações do sistema
    const systemInfo = {
      status: 'online',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      storage: {
        type: 'file-system',
        directory: directoryExists,
        path: '/public/data/workouts/',
        ...indexInfo
      },
      api: {
        endpoints: {
          save: '/api/save-workout',
          get: '/api/get-workout/{id}',
          health: '/api/health'
        }
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'production'
    };

    console.log('Health check performed successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(systemInfo)
    };

  } catch (error) {
    console.error('Health check error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};