/**
 * Modelo de dados para planos de treino
 * @module PlanModel
 */

import { DEFAULT_VALUES } from '../core/Config.js';
import { generateId, calculateAge } from '../core/Utils.js';

/**
 * Classe representando um plano de treino
 */
export class PlanModel {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.nome = data.nome || '';
        this.aluno = this.createStudent(data.aluno);
        this.dias = data.dias || 1;
        this.dataInicio = data.dataInicio || this.getDefaultStartDate();
        this.dataFim = data.dataFim || this.getDefaultEndDate();
        this.perfil = this.createProfile(data.perfil, data.aluno);
        this.treinos = this.createWorkouts(data.treinos);
        this.observacoes = this.createObservations(data.observacoes);
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Cria objeto do aluno
     * @param {Object} studentData - Dados do aluno
     * @returns {Object} Objeto do aluno
     */
    createStudent(studentData = {}) {
        return {
            nome: studentData.nome || '',
            dataNascimento: studentData.dataNascimento || '',
            cpf: studentData.cpf || '',
            idade: studentData.idade || calculateAge(studentData.dataNascimento) || DEFAULT_VALUES.age,
            altura: studentData.altura || DEFAULT_VALUES.height,
            peso: studentData.peso || DEFAULT_VALUES.weight
        };
    }

    /**
     * Cria perfil do plano
     * @param {Object} profileData - Dados do perfil
     * @param {Object} studentData - Dados do aluno para fallback
     * @returns {Object} Objeto do perfil
     */
    createProfile(profileData = {}, studentData = {}) {
        return {
            idade: profileData.idade || studentData?.idade || DEFAULT_VALUES.age,
            altura: profileData.altura || studentData?.altura || DEFAULT_VALUES.height,
            peso: profileData.peso || studentData?.peso || DEFAULT_VALUES.weight,
            porte: profileData.porte || 'médio',
            objetivo: profileData.objetivo || 'Condicionamento geral'
        };
    }

    /**
     * Cria array de treinos
     * @param {Array} workoutData - Dados dos treinos
     * @returns {Array} Array de treinos
     */
    createWorkouts(workoutData = []) {
        if (workoutData.length === 0) {
            return this.generateDefaultWorkouts();
        }

        return workoutData.map(workout => new WorkoutModel(workout));
    }

    /**
     * Gera treinos padrão baseado no número de dias
     * @returns {Array} Treinos padrão
     */
    generateDefaultWorkouts() {
        const workouts = [];
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        
        for (let i = 0; i < this.dias; i++) {
            workouts.push(new WorkoutModel({
                id: letters[i],
                nome: `Treino ${letters[i]}`,
                foco: 'Treino geral'
            }));
        }

        return workouts;
    }

    /**
     * Cria observações do plano
     * @param {Object} observationsData - Dados das observações
     * @returns {Object} Objeto de observações
     */
    createObservations(observationsData = {}) {
        return {
            geral: observationsData.geral || '',
            frequencia: observationsData.frequencia || `${this.dias}x por semana`,
            progressao: observationsData.progressao || 'Aumente a carga gradualmente',
            descanso: observationsData.descanso || DEFAULT_VALUES.restTime,
            hidratacao: observationsData.hidratacao || 'Mantenha-se bem hidratado',
            alimentacao: observationsData.alimentacao || '',
            suplementacao: observationsData.suplementacao || '',
            sono: observationsData.sono || '',
            aquecimento: observationsData.aquecimento || '',
            tecnica: observationsData.tecnica || '',
            periodizacao: observationsData.periodizacao || '',
            consulta: observationsData.consulta || 'Acompanhamento profissional recomendado'
        };
    }

    /**
     * Obtém data de início padrão (hoje)
     * @returns {string} Data no formato YYYY-MM-DD
     */
    getDefaultStartDate() {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Obtém data de fim padrão (6 meses)
     * @returns {string} Data no formato YYYY-MM-DD
     */
    getDefaultEndDate() {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 6);
        return endDate.toISOString().split('T')[0];
    }

    /**
     * Valida o plano
     * @returns {Object} Resultado da validação
     */
    validate() {
        const errors = [];

        if (!this.nome || this.nome.trim() === '') {
            errors.push('Nome do plano é obrigatório');
        }

        if (!this.aluno.nome || this.aluno.nome.trim() === '') {
            errors.push('Nome do aluno é obrigatório');
        }

        if (this.dias < 1 || this.dias > 6) {
            errors.push('Número de dias deve estar entre 1 e 6');
        }

        if (new Date(this.dataFim) <= new Date(this.dataInicio)) {
            errors.push('Data de fim deve ser posterior à data de início');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Atualiza dados do plano
     * @param {Object} updateData - Dados para atualização
     */
    update(updateData) {
        Object.assign(this, updateData);
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Converte para objeto simples
     * @returns {Object} Objeto simples
     */
    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            aluno: this.aluno,
            dias: this.dias,
            dataInicio: this.dataInicio,
            dataFim: this.dataFim,
            perfil: this.perfil,
            treinos: this.treinos.map(workout => workout.toJSON()),
            observacoes: this.observacoes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Clona o plano
     * @param {Object} overrides - Valores a sobrescrever
     * @returns {PlanModel} Novo plano clonado
     */
    clone(overrides = {}) {
        const clonedData = {
            ...this.toJSON(),
            ...overrides,
            id: Date.now() + Math.random(), // Novo ID
            nome: `${this.nome} (Cópia)`,
            createdAt: new Date().toISOString()
        };

        return new PlanModel(clonedData);
    }
}

/**
 * Classe representando um treino
 */
export class WorkoutModel {
    constructor(data = {}) {
        this.id = data.id || generateId(1);
        this.nome = data.nome || `Treino ${this.id}`;
        this.foco = data.foco || 'Treino geral';
        this.exercicios = this.createExercises(data.exercicios);
        this.concluido = data.concluido || false;
        this.execucoes = data.execucoes || 0;
        this.observacoes = data.observacoes || '';
    }

    /**
     * Cria array de exercícios
     * @param {Array} exerciseData - Dados dos exercícios
     * @returns {Array} Array de exercícios
     */
    createExercises(exerciseData = []) {
        if (exerciseData.length === 0) {
            return [this.createWarmupExercise()];
        }

        return exerciseData.map(exercise => new ExerciseModel(exercise));
    }

    /**
     * Cria exercício de aquecimento padrão
     * @returns {ExerciseModel} Exercício de aquecimento
     */
    createWarmupExercise() {
        return new ExerciseModel({
            nome: 'Aquecimento',
            descricao: 'Aquecimento geral de 5-10 minutos',
            series: 1,
            repeticoes: '8-10 min',
            carga: 'Leve',
            descanso: '0'
        });
    }

    /**
     * Adiciona exercício ao treino
     * @param {Object} exerciseData - Dados do exercício
     */
    addExercise(exerciseData) {
        const exercise = new ExerciseModel(exerciseData);
        this.exercicios.push(exercise);
    }

    /**
     * Remove exercício do treino
     * @param {number} index - Índice do exercício
     */
    removeExercise(index) {
        if (index >= 0 && index < this.exercicios.length) {
            this.exercicios.splice(index, 1);
        }
    }

    /**
     * Atualiza exercício específico
     * @param {number} index - Índice do exercício
     * @param {Object} updateData - Dados para atualização
     */
    updateExercise(index, updateData) {
        if (index >= 0 && index < this.exercicios.length) {
            this.exercicios[index].update(updateData);
        }
    }

    /**
     * Calcula duração estimada do treino
     * @returns {number} Duração em minutos
     */
    getEstimatedDuration() {
        let totalMinutes = 0;

        this.exercicios.forEach(exercise => {
            const sets = exercise.series;
            const restTime = this.parseRestTime(exercise.descanso);
            
            // Estimativa: 1 minuto por série + tempo de descanso
            totalMinutes += sets * 1 + (sets - 1) * restTime;
        });

        return Math.round(totalMinutes);
    }

    /**
     * Converte tempo de descanso em minutos
     * @param {string} restTime - Tempo de descanso
     * @returns {number} Tempo em minutos
     */
    parseRestTime(restTime) {
        if (typeof restTime !== 'string') return 1.5;

        const timeStr = restTime.toLowerCase();
        if (timeStr.includes('min')) {
            return parseFloat(timeStr) || 1.5;
        } else if (timeStr.includes('s')) {
            return (parseFloat(timeStr) || 90) / 60;
        }
        
        return 1.5; // Padrão: 1.5 minutos
    }

    /**
     * Valida o treino
     * @returns {Object} Resultado da validação
     */
    validate() {
        const errors = [];

        if (!this.nome || this.nome.trim() === '') {
            errors.push('Nome do treino é obrigatório');
        }

        if (this.exercicios.length === 0) {
            errors.push('Treino deve ter pelo menos um exercício');
        }

        // Validar exercícios
        this.exercicios.forEach((exercise, index) => {
            const exerciseValidation = exercise.validate();
            if (!exerciseValidation.isValid) {
                errors.push(`Exercício ${index + 1}: ${exerciseValidation.errors.join(', ')}`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Converte para objeto simples
     * @returns {Object} Objeto simples
     */
    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            foco: this.foco,
            exercicios: this.exercicios.map(ex => ex.toJSON()),
            concluido: this.concluido,
            execucoes: this.execucoes,
            observacoes: this.observacoes
        };
    }
}

/**
 * Classe representando um exercício
 */
export class ExerciseModel {
    constructor(data = {}) {
        this.id = data.id || Date.now() + Math.random();
        this.nome = data.nome || 'Novo Exercício';
        this.descricao = data.descricao || 'Descrição do exercício';
        this.series = data.series || DEFAULT_VALUES.sets;
        this.repeticoes = data.repeticoes || DEFAULT_VALUES.reps;
        this.carga = data.carga || '20kg';
        this.descanso = data.descanso || DEFAULT_VALUES.restTime;
        this.observacoesEspeciais = data.observacoesEspeciais || '';
        this.concluido = data.concluido || false;
        this.grupoMuscular = data.grupoMuscular || '';
    }

    /**
     * Atualiza dados do exercício
     * @param {Object} updateData - Dados para atualização
     */
    update(updateData) {
        Object.assign(this, updateData);
    }

    /**
     * Valida o exercício
     * @returns {Object} Resultado da validação
     */
    validate() {
        const errors = [];

        if (!this.nome || this.nome.trim() === '') {
            errors.push('Nome do exercício é obrigatório');
        }

        if (!this.series || this.series < 1) {
            errors.push('Número de séries deve ser maior que 0');
        }

        if (!this.repeticoes || this.repeticoes.trim() === '') {
            errors.push('Repetições são obrigatórias');
        }

        if (!this.carga || this.carga.trim() === '') {
            errors.push('Carga é obrigatória');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Converte para objeto simples
     * @returns {Object} Objeto simples
     */
    toJSON() {
        return {
            id: this.id,
            nome: this.nome,
            descricao: this.descricao,
            series: this.series,
            repeticoes: this.repeticoes,
            carga: this.carga,
            descanso: this.descanso,
            observacoesEspeciais: this.observacoesEspeciais,
            concluido: this.concluido,
            grupoMuscular: this.grupoMuscular
        };
    }
}