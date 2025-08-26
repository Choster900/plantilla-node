import dotenv from 'dotenv';
import Joi from 'joi';

// Cargar variables de entorno
dotenv.config();

// Esquema de validación con Joi
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number()
    .port()
    .default(3000),

  // Base de datos
  DB_HOST: Joi.string()
    .required()
    .description('Host de la base de datos'),

  DB_PORT: Joi.number()
    .port()
    .default(5432),

  DB_NAME: Joi.string()
    .required()
    .description('Nombre de la base de datos'),

  DB_USER: Joi.string()
    .required()
    .description('Database user'),

  DB_PASSWORD: Joi.string()
    .required()
    .description('Database password'),

  // JWT
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('Secret key for JWT'),

  JWT_EXPIRES_IN: Joi.string()
    .default('24h')
    .description('JWT expiration time'),

  // API
  API_KEY: Joi.string()
    .required()
    .description('API key'),

  CORS_ORIGIN: Joi.string()
    .uri()
    .default('http://localhost:3000')
    .description('Allowed origin for CORS'),

  // Logs
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info')
    .description('Logging level')
}).unknown(true); // Allow other undefined variables

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Error in environment variables configuration: ${error.message}`);
}

// Export validated configuration
export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,

  database: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    name: envVars.DB_NAME,
    user: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
  },

  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },

  api: {
    key: envVars.API_KEY,
    corsOrigin: envVars.CORS_ORIGIN,
  },

  logging: {
    level: envVars.LOG_LEVEL,
  }
};

// Function to check if we're in production
export const isProduction = () => config.env === 'production';
export const isDevelopment = () => config.env === 'development';
export const isTest = () => config.env === 'test';

console.log('Environment variables loaded and validated successfully');
console.log(`Environment: ${config.env}`);
console.log(`Port: ${config.port}`);
