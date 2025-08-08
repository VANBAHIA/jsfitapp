// netlify/functions/save-workout.js - CORRIGIDO
const fs = require('fs').promises;
const path = require('path');

// Diretório onde os arquivos JSON serão salvos
const WORKOUTS_DIR = path.join(process.cwd(), 'public', 'data', 'workouts');
const INDEX_FILE = path.join(WORKOUTS_DIR, 'index.json');

// Garantir que o diretório existe
async function ensureDirectoryExists() {
  try {
    await fs.access(WORKOUTS_DIR);
  } catch {
    await fs.mkdir(WORKOUTS_DIR, { recursive: true });
    console.log('Diretório criado:', WORKOUTS_DIR);
  }
}

// Ler índice de workouts
async function readIndex() {
  try {
    const data = await fs.readFile(INDEX_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Índice não encontrado, criando novo...');
    return { 
      workouts: [], 
      lastUpdated: null,
      totalWorkouts: 0,
      version: '1.0.0'
    };
  }
}

// Salvar índice de workouts
async function saveIndex(index) {
  try {
    await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2));
    console.log('Índice salvo com sucesso');
  } catch (error) {
    console.error('Erro ao salvar índice:', error);
    throw error;
  }
}

exports.handler = async (event, context) => {
  // Headers CORS mais permissivos
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  };

  // Log da requisição para debug
  console.log('Requisição recebida:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers,
    bodySize: event.body ? event.body.length : 0
  });

  // Preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 200, 
      headers, 
      body: JSON.stringify({ message: 'CORS OK' })
    };
  }

  // Apenas POST permitido
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method not allowed',
        allowedMethods: ['POST'],
        receivedMethod: event.httpMethod
      })
    };
  }

  try {
    // Verificar se há body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Body da requisição vazio',
          received: event.body
        })
      };
    }

    // Parse do body com tratamento de erro
    let data;
    try {
      data = JSON.parse(event.body);
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'JSON inválido no body da requisição',
          details: parseError.message,
          receivedBody: event.body.substring(0, 200)
        })
      };
    }
    
    // Validações básicas
    if (!data.id || !data.plan) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Dados obrigatórios ausentes',
          required: ['id', 'plan'],
          received: Object.keys(data),
          data: data
        })
      };
    }

    // Validar formato do ID (6 caracteres alfanuméricos)
    const shareId = String(data.id).toUpperCase().trim();
    if (!/^[A-Z0-9]{6}$/.test(shareId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'ID deve ter exatamente 6 caracteres alfanuméricos',
          received: shareId,
          length: shareId.length,
          pattern: 'XXXXXX (A-Z, 0-9)'
        })
      };
    }

    // Garantir que o diretório existe
    await ensureDirectoryExists();

    // Preparar documento para salvar
    const document = {
      id: shareId,
      originalId: data.originalId || data.id,
      plan: data.plan,
      timestamp: new Date().toISOString(),
      version: data.version || "1.0",
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        source: 'personal-trainer-app',
        userAgent: event.headers['user-agent'] || 'unknown',
        ip: event.headers['x-forwarded-for'] || 'unknown',
        fileSize: 0 // será calculado após stringify
      }
    };

    // Calcular tamanho do arquivo
    const jsonString = JSON.stringify(document, null, 2);
    document.metadata.fileSize = Buffer.byteLength(jsonString, 'utf8');

    // Caminho do arquivo
    const filePath = path.join(WORKOUTS_DIR, `${shareId}.json`);

    // Verificar se arquivo já existe
    let isUpdate = false;
    try {
      await fs.access(filePath);
      isUpdate = true;
      console.log(`Atualizando arquivo existente: ${shareId}`);
    } catch {
      console.log(`Criando novo arquivo: ${shareId}`);
    }

    // Salvar arquivo JSON
    try {
      await fs.writeFile(filePath, jsonString);
      console.log(`Arquivo salvo: ${filePath}`);
    } catch (writeError) {
      console.error('Erro ao escrever arquivo:', writeError);
      throw new Error(`Falha ao salvar arquivo: ${writeError.message}`);
    }

    // Atualizar índice
    try {
      const index = await readIndex();
      const existingIndex = index.workouts.findIndex(w => w.id === shareId);
      
      const workoutInfo = {
        id: shareId,
        originalId: data.originalId || data.id,
        planName: data.plan.nome || 'Plano sem nome',
        timestamp: document.timestamp,
        lastModified: document.metadata.lastModified,
        fileSize: document.metadata.fileSize,
        treinos: data.plan.treinos ? data.plan.treinos.length : 0
      };

      if (existingIndex >= 0) {
        index.workouts[existingIndex] = workoutInfo;
        console.log(`Índice atualizado para: ${shareId}`);
      } else {
        index.workouts.push(workoutInfo);
        console.log(`Novo item adicionado ao índice: ${shareId}`);
      }

      index.lastUpdated = new Date().toISOString();
      index.totalWorkouts = index.workouts.length;

      await saveIndex(index);
    } catch (indexError) {
      console.error('Erro ao atualizar índice:', indexError);
      // Não falhar a requisição por erro no índice
    }

    console.log(`Workout ${shareId} ${isUpdate ? 'updated' : 'created'} successfully`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        id: shareId,
        message: `Plano ${isUpdate ? 'atualizado' : 'criado'} com sucesso`,
        timestamp: document.timestamp,
        isUpdate: isUpdate,
        fileSize: document.metadata.fileSize,
        filePath: `/data/workouts/${shareId}.json`,
        metadata: {
          processedAt: new Date().toISOString(),
          originalId: data.originalId
        }
      })
    };

  } catch (error) {
    console.error('Error saving workout:', error);
    
    // Log detalhado do erro
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      event: {
        method: event.httpMethod,
        path: event.path,
        body: event.body ? event.body.substring(0, 500) : null
      }
    });
    
    // Tentar limpar arquivo parcialmente criado
    try {
      const data = JSON.parse(event.body || '{}');
      const shareId = data.id?.toUpperCase();
      if (shareId) {
        const filePath = path.join(WORKOUTS_DIR, `${shareId}.json`);
        await fs.unlink(filePath).catch(() => {});
        console.log('Arquivo parcial removido:', filePath);
      }
    } catch (cleanupError) {
      console.error('Erro na limpeza:', cleanupError);
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro interno do servidor ao salvar arquivo',
        message: error.message,
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? {
          stack: error.stack,
          event: event
        } : undefined
      })
    };
  }
};

// netlify/functions/get-workout.js - CORRIGIDO
const fs2 = require('fs').promises;
const path2 = require('path');

const WORKOUTS_DIR2 = path2.join(process.cwd(), 'public', 'data', 'workouts');

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300'
  };

  console.log('GET Request:', {
    method: event.httpMethod,
    path: event.path,
    queryString: event.queryStringParameters
  });

  // Preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Apenas GET permitido
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        error: 'Method not allowed',
        allowedMethods: ['GET']
      })
    };
  }

  try {
    // Extrair shareId da URL - múltiplas formas
    let shareId = null;
    
    // Tentar extrair do path
    const pathSegments = event.path.split('/').filter(segment => segment.length > 0);
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    if (lastSegment && /^[A-Z0-9]{6}$/i.test(lastSegment)) {
      shareId = lastSegment.toUpperCase();
    }
    
    // Tentar extrair dos query parameters
    if (!shareId && event.queryStringParameters) {
      shareId = event.queryStringParameters.id || event.queryStringParameters.shareId;
    }
    
    // Validar shareId
    if (!shareId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'ID de compartilhamento não fornecido',
          usage: 'Use: /api/get-workout/{ID} ou /api/get-workout?id={ID}',
          path: event.path,
          queryParams: event.queryStringParameters
        })
      };
    }
    
    shareId = shareId.toUpperCase().trim();
    
    if (!/^[A-Z0-9]{6}$/.test(shareId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'ID inválido. Deve ter exatamente 6 caracteres alfanuméricos',
          received: shareId,
          pattern: 'XXXXXX (A-Z, 0-9)'
        })
      };
    }

    // Caminho do arquivo
    const filePath = path2.join(WORKOUTS_DIR2, `${shareId}.json`);
    console.log('Buscando arquivo:', filePath);

    // Verificar se arquivo existe
    try {
      await fs2.access(filePath);
    } catch (accessError) {
      console.log('Arquivo não encontrado:', filePath);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'Plano não encontrado',
          shareId: shareId,
          message: 'O ID informado não corresponde a nenhum plano salvo',
          searchedPath: filePath
        })
      };
    }

    // Ler arquivo JSON
    let fileContent;
    try {
      fileContent = await fs2.readFile(filePath, 'utf8');
    } catch (readError) {
      console.error('Erro ao ler arquivo:', readError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Erro ao acessar arquivo do plano',
          details: 'Arquivo encontrado mas não pôde ser lido'
        })
      };
    }

    // Parse do JSON
    let workoutData;
    try {
      workoutData = JSON.parse(fileContent);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Arquivo de plano corrompido',
          details: 'Por favor, solicite um novo ID ao personal trainer',
          shareId: shareId
        })
      };
    }

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
          source: 'file-storage',
          fileSize: Buffer.byteLength(fileContent, 'utf8'),
          shareId: shareId
        }
      })
    };

  } catch (error) {
    console.error('Error reading workout:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro interno do servidor',
        timestamp: new Date().toISOString(),
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};

// netlify/functions/health.js - MELHORADO
const fs3 = require('fs').promises;
const path3 = require('path');

const WORKOUTS_DIR3 = path3.join(process.cwd(), 'public', 'data', 'workouts');
const INDEX_FILE3 = path3.join(WORKOUTS_DIR3, 'index.json');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

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
    let directoryError = null;
    try {
      const stats = await fs3.stat(WORKOUTS_DIR3);
      directoryExists = stats.isDirectory();
    } catch (error) {
      directoryExists = false;
      directoryError = error.message;
    }

    // Ler informações do índice se existir
    let indexInfo = null;
    if (directoryExists) {
      try {
        const indexData = await fs3.readFile(INDEX_FILE3, 'utf8');
        const index = JSON.parse(indexData);
        indexInfo = {
          totalWorkouts: index.totalWorkouts || index.workouts?.length || 0,
          lastUpdated: index.lastUpdated,
          hasIndex: true,
          version: index.version
        };
      } catch (indexError) {
        // Contar arquivos manualmente se índice não existir
        try {
          const files = await fs3.readdir(WORKOUTS_DIR3);
          const jsonFiles = files.filter(file => 
            file.endsWith('.json') && 
            file !== 'index.json' &&
            /^[A-Z0-9]{6}\.json$/i.test(file)
          );
          
          indexInfo = {
            totalWorkouts: jsonFiles.length,
            lastUpdated: null,
            hasIndex: false,
            files: jsonFiles.slice(0, 5), // primeiros 5 arquivos para debug
            indexError: indexError.message
          };
        } catch (dirError) {
          indexInfo = {
            totalWorkouts: 0,
            lastUpdated: null,
            hasIndex: false,
            error: dirError.message
          };
        }
      }
    }

    // Informações do sistema
    const systemInfo = {
      status: 'online',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      netlify: {
        region: process.env.AWS_REGION || 'unknown',
        functionName: context.functionName || 'unknown',
        functionVersion: context.functionVersion || 'unknown'
      },
      storage: {
        type: 'file-system',
        directory: directoryExists,
        path: '/public/data/workouts/',
        error: directoryError,
        ...indexInfo
      },
      api: {
        endpoints: {
          save: '/.netlify/functions/save-workout',
          get: '/.netlify/functions/get-workout/{id}',
          health: '/.netlify/functions/health'
        }
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'production',
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal
      }
    };

    console.log('Health check performed successfully:', systemInfo);

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
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};