/**
 * Configurações centralizadas da aplicação
 * @module Config
 */

export const API_CONFIG = {
    baseUrl: 'https://jsfitapp.netlify.app/api',
    timeout: 10000,
    retries: 3,
    endpoints: {
        shareWorkout: '/share-workout',
        health: '/health'
    }
};

export const APP_CONFIG = {
    name: 'JS Fit App Personal',
    version: '1.0.0',
    defaultPlanDuration: 180, // 6 meses em dias
    minPasswordLength: 6,
    maxExercisesPerWorkout: 10
};

export const STORAGE_KEYS = {
    plans: 'jsfitapp_plans',
    sharedPlans: 'jsfitapp_shared_plans',
    userPreferences: 'jsfitapp_user_prefs',
    tempData: 'jsfitapp_temp'
};

export const UI_CONFIG = {
    messageTimeout: 5000,
    modalAnimationDuration: 300,
    progressUpdateInterval: 200,
    debounceDelay: 300
};

export const VALIDATION_RULES = {
    requiredFields: ['studentName', 'planName'],
    minAge: 13,
    maxAge: 100,
    minWeight: 30,
    maxWeight: 300
};

export const DEFAULT_VALUES = {
    age: 25,
    height: '1,75m',
    weight: '75kg',
    restTime: '90 segundos',
    sets: 3,
    reps: '10-12'
};