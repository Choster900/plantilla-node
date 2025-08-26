import { PoolClient } from 'pg';
import { query, transaction } from './connection';
import fs from 'fs';
import path from 'path';

// Interface to define a migration
export interface Migration {
    id: string;
    description: string;
    up: (client: PoolClient) => Promise<void>;
    down: (client: PoolClient) => Promise<void>;
}

// Create migrations table if it doesn't exist
export const createMigrationsTable = async (): Promise<void> => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS migrations (
      id VARCHAR(255) PRIMARY KEY,
      description TEXT NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

    await query(createTableQuery);
    console.log('Migrations table verified/created');
};

// Get executed migrations
export const getExecutedMigrations = async (): Promise<string[]> => {
    const result = await query('SELECT id FROM migrations ORDER BY executed_at ASC');
    return result.rows.map((row: any) => row.id);
};

// Mark migration as executed
export const markMigrationAsExecuted = async (id: string, description: string): Promise<void> => {
    await query(
        'INSERT INTO migrations (id, description) VALUES ($1, $2)',
        [id, description]
    );
};

// Remove migration from table
export const removeMigrationRecord = async (id: string): Promise<void> => {
    await query('DELETE FROM migrations WHERE id = $1', [id]);
};

// Execute a migration
export const runMigration = async (migration: Migration): Promise<void> => {
    await transaction(async (client) => {
        console.log(`Running migration: ${migration.id} - ${migration.description}`);
        await migration.up(client);
        await markMigrationAsExecuted(migration.id, migration.description);
        console.log(`Migration completed: ${migration.id}`);
    });
};

// Rollback a migration
export const rollbackMigration = async (migration: Migration): Promise<void> => {
    await transaction(async (client) => {
        console.log(`Rolling back migration: ${migration.id} - ${migration.description}`);
        await migration.down(client);
        await removeMigrationRecord(migration.id);
        console.log(`Migration rolled back: ${migration.id}`);
    });
};

// Load migration files from directory
export const loadMigrationFiles = (): Migration[] => {
    const migrationsDir = path.join(__dirname, 'migrations');

    if (!fs.existsSync(migrationsDir)) {
        console.log('Migrations directory does not exist, creating it...');
        fs.mkdirSync(migrationsDir, { recursive: true });
        return [];
    }

    const files = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
        .sort();

    const migrations: Migration[] = [];

    for (const file of files) {
        const filePath = path.join(migrationsDir, file);
        try {
            const migrationModule = require(filePath);

            // Support both export patterns: 'export default' and 'export const migration'
            let migration: Migration | null = null;

            if (migrationModule.migration && typeof migrationModule.migration === 'object') {
                migration = migrationModule.migration;
            } else if (migrationModule.default && typeof migrationModule.default === 'object') {
                migration = migrationModule.default;
            }

            if (migration) {
                migrations.push(migration);
                console.log(`Loaded migration: ${migration.id}`);
            } else {
                console.warn(`Invalid migration file: ${file} - no valid export found`);
            }
        } catch (error) {
            console.error(`Error loading migration file ${file}:`, error);
        }
    }

    return migrations;
};

// Run pending migrations
export const runPendingMigrations = async (): Promise<void> => {
    console.log('Initializing migration process...');

    await createMigrationsTable();

    const allMigrations = loadMigrationFiles();
    const executedMigrations = await getExecutedMigrations();

    const pendingMigrations = allMigrations.filter(
        migration => !executedMigrations.includes(migration.id)
    );

    if (pendingMigrations.length === 0) {
        console.log('No pending migrations');
        return;
    }

    console.log(`${pendingMigrations.length} pending migrations found`);

    for (const migration of pendingMigrations) {
        await runMigration(migration);
    }

    console.log('All migrations completed successfully');
};

// Rollback last migration
export const rollbackLastMigration = async (): Promise<void> => {
    console.log('Starting rollback of last migration...');

    const executedMigrations = await getExecutedMigrations();

    if (executedMigrations.length === 0) {
        console.log('No migrations to rollback');
        return;
    }

    const lastMigrationId = executedMigrations[executedMigrations.length - 1];
    const allMigrations = loadMigrationFiles();
    const lastMigration = allMigrations.find(m => m.id === lastMigrationId);

    if (!lastMigration) {
        throw new Error(`Migration file not found for: ${lastMigrationId}`);
    }

    await rollbackMigration(lastMigration);
    console.log('Rollback completed successfully');
};
