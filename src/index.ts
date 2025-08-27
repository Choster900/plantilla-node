import express, { Request, Response } from 'express';
import { config } from './config';
import { testConnection } from './database/connection';
import usersRouter from './routes/users';
import profilesRouter from './routes/profiles';
import authRouter from './routes/auth';

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Middleware to parse URL encoded
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/profiles', profilesRouter);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Hello! Express server with TypeScript running correctly',
    timestamp: new Date().toISOString()
  });
});

// Example route
app.get('/api/hello', (req: Request, res: Response) => {
  res.json({
    message: 'Hello from Express with TypeScript!',
    status: 'success',
    environment: config.env,
    database: {
      host: config.database.host,
      name: config.database.name
    }
  });
});

// Route to show configuration (development only)
app.get('/api/config', (req: Request, res: Response) => {
  if (config.env !== 'development') {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json({
    environment: config.env,
    port: config.port,
    corsOrigin: config.api.corsOrigin,
    logLevel: config.logging.level
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('Could not connect to database');
      console.log('Make sure PostgreSQL is running and credentials are correct');
      console.log('You can run "npm run migrate:status" to verify configuration');
    }

    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
      console.log(`Environment: ${config.env}`);
      console.log(`Database: ${dbConnected ? 'Connected' : 'Not connected'}`);
      console.log('\nAvailable API routes:');
      console.log('');
      console.log('Authentication:');
      console.log('   POST   /api/auth/register     - Register new user');
      console.log('   POST   /api/auth/login        - Login user');
      console.log('   GET    /api/auth/me           - Get current user (auth required)');
      console.log('   POST   /api/auth/refresh      - Refresh token (auth required)');
      console.log('   POST   /api/auth/logout       - Logout user');
      console.log('   GET    /api/auth/verify       - Verify token');
      console.log('');
      console.log('Users:');
      console.log('   GET    /api/users            - List users');
      console.log('   GET    /api/users/:id        - Get user by ID');
      console.log('   POST   /api/users            - Create user');
      console.log('   PUT    /api/users/:id        - Update user');
      console.log('   DELETE /api/users/:id        - Delete user');
      console.log('');
      console.log('Profiles:');
      console.log('   GET    /api/profiles         - List profiles');
      console.log('   GET    /api/profiles/:id     - Get profile by ID');
      console.log('   POST   /api/profiles         - Create profile');
      console.log('   PUT    /api/profiles/:id     - Update profile');
      console.log('   DELETE /api/profiles/:id     - Delete profile');
      console.log('');
      console.log('\nAvailable migration scripts:');
      console.log('   npm run migrate              - Run migrations');
      console.log('   npm run migrate:status       - View migration status');
      console.log('   npm run migrate:rollback     - Rollback last migration');
      console.log('');
      console.log('\nAvailable seeding scripts:');
      console.log('   npm run seed                 - Run all seeders');
      console.log('   npm run seed:status          - View seeding status');
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
