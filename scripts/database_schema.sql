-- =============================================
-- JS FIT APP - POSTGRESQL SCHEMA
-- =============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TABELA DE PERSONAL TRAINERS
-- =============================================
CREATE TABLE personal_trainers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    cref VARCHAR(50),
    specialty TEXT,
    bio TEXT,
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- TABELA DE ALUNOS
-- =============================================
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    birth_date DATE,
    age INTEGER,
    height VARCHAR(10),
    weight VARCHAR(10),
    cpf VARCHAR(14),
    emergency_contact TEXT,
    medical_conditions TEXT,
    fitness_goals TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABELA DE PLANOS DE TREINO
-- =============================================
CREATE TABLE workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    personal_trainer_id UUID NOT NULL REFERENCES personal_trainers(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    objective VARCHAR(255),
    frequency_per_week INTEGER NOT NULL DEFAULT 3,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, completed, paused, cancelled
    difficulty_level VARCHAR(20) DEFAULT 'intermediate', -- beginner, intermediate, advanced
    equipment_type VARCHAR(50) DEFAULT 'gym', -- gym, home, bodyweight, functional
    estimated_duration_minutes INTEGER DEFAULT 60,
    observations JSONB,
    ai_generated BOOLEAN DEFAULT false,
    ai_prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_cycles INTEGER DEFAULT 0,
    
    -- Índices para performance
    CONSTRAINT valid_frequency CHECK (frequency_per_week >= 1 AND frequency_per_week <= 7),
    CONSTRAINT valid_difficulty CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'paused', 'cancelled'))
);

-- =============================================
-- TABELA DE TREINOS INDIVIDUAIS (A, B, C, etc.)
-- =============================================
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    workout_letter VARCHAR(5) NOT NULL, -- A, B, C, D, E, F
    focus_area VARCHAR(255),
    description TEXT,
    estimated_duration_minutes INTEGER DEFAULT 60,
    difficulty_level VARCHAR(20) DEFAULT 'intermediate',
    order_index INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    execution_count INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Garantir ordem única por plano
    UNIQUE(workout_plan_id, order_index),
    UNIQUE(workout_plan_id, workout_letter),
    
    CONSTRAINT valid_workout_difficulty CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'))
);

-- =============================================
-- TABELA DE EXERCÍCIOS
-- =============================================
CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    muscle_groups TEXT[], -- Array de grupos musculares
    equipment VARCHAR(100),
    sets INTEGER NOT NULL,
    reps VARCHAR(50), -- Pode ser "10-12", "30 segundos", etc.
    weight VARCHAR(50),
    rest_time VARCHAR(50),
    order_index INTEGER NOT NULL,
    special_instructions TEXT,
    video_url TEXT,
    image_url TEXT,
    is_completed BOOLEAN DEFAULT false,
    execution_notes TEXT,
    current_weight VARCHAR(50), -- Peso atual do aluno
    rpe_scale INTEGER, -- Rate of Perceived Exertion (1-10)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Garantir ordem única por treino
    UNIQUE(workout_id, order_index),
    
    CONSTRAINT valid_sets CHECK (sets >= 1),
    CONSTRAINT valid_rpe CHECK (rpe_scale IS NULL OR (rpe_scale >= 1 AND rpe_scale <= 10))
);

-- =============================================
-- TABELA DE PLANOS COMPARTILHADOS
-- =============================================
CREATE TABLE shared_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    share_id VARCHAR(10) UNIQUE NOT NULL, -- ID de 6 caracteres
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    personal_trainer_id UUID NOT NULL REFERENCES personal_trainers(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Índice para busca rápida por share_id
    CONSTRAINT share_id_format CHECK (share_id ~ '^[A-Z0-9]{6}$')
);

-- =============================================
-- TABELA DE SESSÕES DE TREINO (LOG)
-- =============================================
CREATE TABLE workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    notes TEXT,
    rating INTEGER, -- 1-5 estrelas
    exercises_completed INTEGER DEFAULT 0,
    total_exercises INTEGER DEFAULT 0,
    calories_burned INTEGER,
    
    CONSTRAINT valid_rating CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5))
);

-- =============================================
-- TABELA DE LOG DE EXERCÍCIOS
-- =============================================
CREATE TABLE exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    sets_completed INTEGER,
    reps_completed VARCHAR(50),
    weight_used VARCHAR(50),
    rest_time_actual VARCHAR(50),
    rpe_rating INTEGER,
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_exercise_rpe CHECK (rpe_rating IS NULL OR (rpe_rating >= 1 AND rpe_rating <= 10))
);

-- =============================================
-- TABELA DE TEMPLATES DE EXERCÍCIOS
-- =============================================
CREATE TABLE exercise_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    muscle_groups TEXT[],
    equipment VARCHAR(100),
    difficulty_level VARCHAR(20) DEFAULT 'intermediate',
    category VARCHAR(100), -- peito, costas, pernas, etc.
    instructions TEXT,
    video_url TEXT,
    image_url TEXT,
    is_popular BOOLEAN DEFAULT false,
    created_by UUID REFERENCES personal_trainers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_template_difficulty CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'))
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices principais
CREATE INDEX idx_workout_plans_trainer ON workout_plans(personal_trainer_id);
CREATE INDEX idx_workout_plans_student ON workout_plans(student_id);
CREATE INDEX idx_workout_plans_status ON workout_plans(status);
CREATE INDEX idx_workout_plans_dates ON workout_plans(start_date, end_date);

CREATE INDEX idx_workouts_plan ON workouts(workout_plan_id);
CREATE INDEX idx_workouts_order ON workouts(workout_plan_id, order_index);

CREATE INDEX idx_exercises_workout ON exercises(workout_id);
CREATE INDEX idx_exercises_order ON exercises(workout_id, order_index);
CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);

CREATE INDEX idx_shared_plans_share_id ON shared_plans(share_id);
CREATE INDEX idx_shared_plans_active ON shared_plans(is_active);
CREATE INDEX idx_shared_plans_expires ON shared_plans(expires_at);

CREATE INDEX idx_workout_sessions_plan ON workout_sessions(workout_plan_id);
CREATE INDEX idx_workout_sessions_student ON workout_sessions(student_id);
CREATE INDEX idx_workout_sessions_date ON workout_sessions(started_at);

CREATE INDEX idx_exercise_logs_session ON exercise_logs(workout_session_id);
CREATE INDEX idx_exercise_logs_exercise ON exercise_logs(exercise_id);

CREATE INDEX idx_exercise_templates_category ON exercise_templates(category);
CREATE INDEX idx_exercise_templates_muscle_groups ON exercise_templates USING GIN(muscle_groups);

-- =============================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualização automática
CREATE TRIGGER update_personal_trainers_updated_at 
    BEFORE UPDATE ON personal_trainers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at 
    BEFORE UPDATE ON students 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at 
    BEFORE UPDATE ON workout_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at 
    BEFORE UPDATE ON workouts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at 
    BEFORE UPDATE ON exercises 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNÇÕES AUXILIARES
-- =============================================

-- Função para gerar share_id único
CREATE OR REPLACE FUNCTION generate_share_id()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    -- Verificar se já existe
    WHILE EXISTS(SELECT 1 FROM shared_plans WHERE share_id = result) LOOP
        result := '';
        FOR i IN 1..6 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular estatísticas do plano
CREATE OR REPLACE FUNCTION get_plan_statistics(plan_id UUID)
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_workouts', COUNT(w.id),
        'completed_workouts', COUNT(w.id) FILTER (WHERE w.is_completed = true),
        'total_exercises', SUM((SELECT COUNT(*) FROM exercises e WHERE e.workout_id = w.id)),
        'completed_exercises', SUM((SELECT COUNT(*) FROM exercises e WHERE e.workout_id = w.id AND e.is_completed = true)),
        'total_sessions', (SELECT COUNT(*) FROM workout_sessions ws WHERE ws.workout_plan_id = plan_id),
        'avg_session_duration', (SELECT AVG(duration_minutes) FROM workout_sessions ws WHERE ws.workout_plan_id = plan_id AND duration_minutes IS NOT NULL),
        'avg_rating', (SELECT AVG(rating) FROM workout_sessions ws WHERE ws.workout_plan_id = plan_id AND rating IS NOT NULL)
    ) INTO stats
    FROM workouts w
    WHERE w.workout_plan_id = plan_id;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VIEWS ÚTEIS
-- =============================================

-- View para planos com estatísticas
CREATE VIEW workout_plans_with_stats AS
SELECT 
    wp.*,
    pt.name as trainer_name,
    pt.email as trainer_email,
    s.name as student_name,
    s.email as student_email,
    COUNT(w.id) as total_workouts,
    COUNT(w.id) FILTER (WHERE w.is_completed = true) as completed_workouts,
    SUM(w.execution_count) as total_executions,
    (SELECT COUNT(*) FROM shared_plans sp WHERE sp.workout_plan_id = wp.id AND sp.is_active = true) as active_shares
FROM workout_plans wp
LEFT JOIN personal_trainers pt ON wp.personal_trainer_id = pt.id
LEFT JOIN students s ON wp.student_id = s.id
LEFT JOIN workouts w ON wp.id = w.workout_plan_id
GROUP BY wp.id, pt.id, s.id;

-- View para exercícios populares
CREATE VIEW popular_exercises AS
SELECT 
    et.name,
    et.category,
    et.muscle_groups,
    COUNT(e.id) as usage_count,
    AVG(el.rpe_rating) as avg_rpe,
    COUNT(DISTINCT wp.personal_trainer_id) as used_by_trainers
FROM exercise_templates et
LEFT JOIN exercises e ON e.name = et.name
LEFT JOIN workouts w ON e.workout_id = w.id
LEFT JOIN workout_plans wp ON w.workout_plan_id = wp.id
LEFT JOIN exercise_logs el ON e.id = el.exercise_id
GROUP BY et.id, et.name, et.category, et.muscle_groups
HAVING COUNT(e.id) > 0
ORDER BY usage_count DESC;

-- =============================================
-- COMENTÁRIOS DAS TABELAS
-- =============================================

COMMENT ON TABLE personal_trainers IS 'Personal trainers que criam planos de treino';
COMMENT ON TABLE students IS 'Alunos que recebem planos de treino';
COMMENT ON TABLE workout_plans IS 'Planos de treino criados pelos personal trainers';
COMMENT ON TABLE workouts IS 'Treinos individuais dentro de um plano (A, B, C, etc.)';
COMMENT ON TABLE exercises IS 'Exercícios específicos dentro de cada treino';
COMMENT ON TABLE shared_plans IS 'Planos compartilhados via ID único';
COMMENT ON TABLE workout_sessions IS 'Sessões de treino executadas pelos alunos';
COMMENT ON TABLE exercise_logs IS 'Log detalhado da execução de exercícios';
COMMENT ON TABLE exercise_templates IS 'Templates de exercícios para reutilização';

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Inserir templates de exercícios populares
INSERT INTO exercise_templates (name, description, muscle_groups, equipment, difficulty_level, category, instructions) VALUES
('Supino Reto com Barra', 'Exercício fundamental para desenvolvimento do peitoral', '{"peito", "tríceps", "ombros"}', 'Barra olímpica, banco', 'intermediate', 'peito', 'Deitar no banco, pegar a barra com pegada média, descer controladamente até o peito e empurrar para cima'),
('Agachamento Livre', 'Exercício fundamental para membros inferiores', '{"quadríceps", "glúteos", "core"}', 'Barra olímpica, rack', 'intermediate', 'pernas', 'Posicionar a barra nas costas, descer até 90 graus mantendo as costas retas'),
('Puxada Frontal', 'Exercício para desenvolvimento do latíssimo do dorso', '{"costas", "bíceps"}', 'Polia alta', 'beginner', 'costas', 'Puxar a barra até o peito, contraindo as escápulas'),
('Flexão de Braços', 'Exercício básico de peso corporal', '{"peito", "tríceps", "core"}', 'Peso corporal', 'beginner', 'peito', 'Posição de prancha, descer até quase tocar o peito no chão'),
('Rosca Direta', 'Exercício básico para bíceps', '{"bíceps"}', 'Barra reta ou EZ', 'beginner', 'braços', 'Flexionar os cotovelos mantendo-os fixos ao lado do corpo');

-- Criar índice de texto completo para busca
CREATE INDEX idx_exercise_templates_search ON exercise_templates USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(description, '')));

-- Função para busca de exercícios
CREATE OR REPLACE FUNCTION search_exercises(search_term TEXT)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    muscle_groups TEXT[],
    category VARCHAR(100),
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        et.id,
        et.name,
        et.description,
        et.muscle_groups,
        et.category,
        ts_rank(to_tsvector('portuguese', et.name || ' ' || COALESCE(et.description, '')), plainto_tsquery('portuguese', search_term)) as rank
    FROM exercise_templates et
    WHERE to_tsvector('portuguese', et.name || ' ' || COALESCE(et.description, '')) @@ plainto_tsquery('portuguese', search_term)
    ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;