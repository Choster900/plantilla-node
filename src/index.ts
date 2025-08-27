import 'reflect-metadata';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { initializeDatabase } from './database/sequelize';
import usersRouter from './routes/users';
import profilesRouter from './routes/profiles';
import authRouter from './routes/auth';
import tasksRouter from './routes/tasks';
import subtasksRouter from './routes/subtasks';
import listsRouter from './routes/lists';
const app = express();

// CORS configuration
app.use(cors({
    origin: config.api.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// Middleware to parse URL encoded
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/lists', listsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/subtasks', subtasksRouter);

// Basic route
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Hello! Express server with TypeScript running correctly',
        timestamp: new Date().toISOString()
    });
});

// Healthcheck
app.get('/health', async (req: Request, res: Response) => {
    try {
        // Validación de DB (ejemplo: simple query con Sequelize)
        await initializeDatabase(); // si solo quieres probar conexión
        return res.status(200).json({
            status: 'ok',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Database connection failed',
            timestamp: new Date().toISOString(),
            error: (error as Error).message
        });
    }
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
        // Initialize Sequelize database connection
        await initializeDatabase();

        app.listen(config.port, () => {
            console.log(`Server running on http://localhost:${config.port}`);
            console.log(`Environment: ${config.env}`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();
