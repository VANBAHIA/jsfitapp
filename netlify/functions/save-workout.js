// netlify/functions/save-workout.js
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
  }
}

// Ler índice de workouts
async function readIndex() {
  try {
    const data = await fs.readFile(INDEX_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return { workouts: [], lastUpdated: null };
  }
}

// Salvar índice de workouts
async function saveIndex(index) {
  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2));
}

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Preflight request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Apenas POST permitido
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse do body
    const data = JSON.parse(event.body);
    
    // Validações básicas
    if (!data.id || !data.plan || !data.originalId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Dados obrigatórios: id, plan, originalId' 
        })
      };
    }

    // Validar formato do ID (6 caracteres alfanuméricos)
    const shareId = data.id.toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(shareId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'ID deve ter exatamente 6 caracteres alfanuméricos' 
        })
      };
    }

    // Garantir que o diretório existe
    await ensureDirectoryExists();

    // Preparar documento para salvar
    const document = {
      id: shareId,
      originalId: data.originalId,
      plan: data.plan,
      timestamp: new Date().toISOString(),
      version: data.version || "1.0",
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        source: 'personal-trainer-app',
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
    } catch {
      // Arquivo não existe, é criação nova
    }

    // Salvar arquivo JSON
    await fs.writeFile(filePath, jsonString);

    // Atualizar índice
    const index = await readIndex();
    const existingIndex = index.workouts.findIndex(w => w.id === shareId);
    
    const workoutInfo = {
      id: shareId,
      originalId: data.originalId,
      planName: data.plan.nome || 'Plano sem nome',
      timestamp: document.timestamp,
      lastModified: document.metadata.lastModified,
      fileSize: document.metadata.fileSize
    };

    if (existingIndex >= 0) {
      index.workouts[existingIndex] = workoutInfo;
    } else {
      index.workouts.push(workoutInfo);
    }

    index.lastUpdated = new Date().toISOString();
    index.totalWorkouts = index.workouts.length;

    await saveIndex(index);

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
        fileSize: document.metadata.fileSize
      })
    };

  } catch (error) {
    console.error('Error saving workout:', error);
    
    // Tentar limpar arquivo parcialmente criado
    try {
      const shareId = JSON.parse(event.body)?.id?.toUpperCase();
      if (shareId) {
        const filePath = path.join(WORKOUTS_DIR, `${shareId}.json`);
        await fs.unlink(filePath).catch(() => {});
      }
    } catch {}
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro interno do servidor ao salvar arquivo',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};