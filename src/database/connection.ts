import { Pool, PoolClient } from 'pg';
import { config } from '../config';

// Connection pool configuration
const poolConfig = {
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    user: config.database.user,
    password: config.database.password,
    max: 20, // maximum number of connections in pool
    idleTimeoutMillis: 30000, // time before closing idle connections
    connectionTimeoutMillis: 2000, // maximum time to establish connection
};

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
    console.error('Unexpected error in connection pool:', err);
    process.exit(-1);
});

// Function to get a connection from the pool
export const getConnection = (): Promise<PoolClient> => {
    return pool.connect();
};

// Function to execute simple queries
export const query = async (text: string, params?: any[]): Promise<any> => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (config.env === 'development') {
        console.log('Query executed:', { text, duration: `${duration}ms`, rows: res.rowCount });
    }

    return res;
};

// Function to execute transactions
export const transaction = async (callback: (client: PoolClient) => Promise<any>): Promise<any> => {
    const client = await getConnection();

    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Function to test connection
export const testConnection = async (): Promise<boolean> => {
    try {
        const client = await getConnection();
        await client.query('SELECT NOW()');
        client.release();
        console.log('Database connection successful');
        return true;
    } catch (error) {
        console.error('Error connecting to database:', error);
        return false;
    }
};

// Function to close all connections
export const closePool = async (): Promise<void> => {
    await pool.end();
    console.log('Connection pool closed');
};
