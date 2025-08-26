import { config } from './env';

// Configuraciones específicas por entorno
export const getDatabaseUrl = (): string => {
  return `postgresql://${config.database.user}:${config.database.password}@${config.database.host}:${config.database.port}/${config.database.name}`;
};

// Configuración de CORS
export const getCorsOptions = () => {
  return {
    origin: config.api.corsOrigin,
    credentials: true,
    optionsSuccessStatus: 200
  };
};

// Configuración de logging
export const getLoggerConfig = () => {
  return {
    level: config.logging.level,
    format: config.env === 'production' ? 'json' : 'simple',
    timestamp: true
  };
};

// Configuración de seguridad
export const getSecurityConfig = () => {
  return {
    jwt: {
      secret: config.jwt.secret,
      expiresIn: config.jwt.expiresIn,
      algorithm: 'HS256' as const
    },
    bcrypt: {
      saltRounds: config.env === 'production' ? 12 : 10
    }
  };
};

// Validar configuración crítica
export const validateCriticalConfig = (): boolean => {
  const critical = [
    config.jwt.secret,
    config.database.host,
    config.database.user,
    config.database.password
  ];

  return critical.every(value => value && value.length > 0);
};

// Obtener configuración para diferentes servicios
export const getServiceConfig = (service: 'database' | 'auth' | 'api') => {
  switch (service) {
    case 'database':
      return {
        url: getDatabaseUrl(),
        host: config.database.host,
        port: config.database.port,
        name: config.database.name
      };

    case 'auth':
      return getSecurityConfig();

    case 'api':
      return {
        port: config.port,
        corsOrigin: config.api.corsOrigin,
        apiKey: config.api.key
      };

    default:
      throw new Error(`Servicio desconocido: ${service}`);
  }
};
