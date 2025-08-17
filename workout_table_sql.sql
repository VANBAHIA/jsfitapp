-- Criar tabela workouts no PostgreSQL
CREATE TABLE IF NOT EXISTS workouts (
  id VARCHAR(6) PRIMARY KEY,
  original_id VARCHAR(6) NOT NULL,
  plan JSONB NOT NULL,
  version VARCHAR(10) DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_workouts_original_id ON workouts(original_id);
CREATE INDEX IF NOT EXISTS idx_workouts_created_at ON workouts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_updated_at ON workouts(updated_at DESC);

-- Adicionar comentários para documentação
COMMENT ON TABLE workouts IS 'Tabela para armazenar planos de treino';
COMMENT ON COLUMN workouts.id IS 'ID único do treino (6 caracteres)';
COMMENT ON COLUMN workouts.original_id IS 'ID original do treino';
COMMENT ON COLUMN workouts.plan IS 'Dados do plano de treino em formato JSON';
COMMENT ON COLUMN workouts.version IS 'Versão do plano de treino';
COMMENT ON COLUMN workouts.created_at IS 'Data e hora de criação';
COMMENT ON COLUMN workouts.updated_at IS 'Data e hora da última atualização';