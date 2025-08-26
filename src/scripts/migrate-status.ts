#!/usr/bin/env node

/**
 * Script to verify migration status
 * Usage: npm run migrate:status
 */

import { testConnection, closePool, query } from '../database/connection';
import { createMigrationsTable, getExecutedMigrations, loadMigrationFiles } from '../database/migrator';

async function checkMigrationStatus() {
  console.log('Checking migration status...\n');

  try {
    // Verify database connection
    const isConnected = await testConnection();

    if (!isConnected) {
      console.error('Could not connect to database');
      process.exit(1);
    }

    // Ensure migrations table exists
    await createMigrationsTable();

    // Get available and executed migrations
    const allMigrations = loadMigrationFiles();
    const executedMigrations = await getExecutedMigrations();

    console.log('Migration status:');
    console.log(`   Total migration files: ${allMigrations.length}`);
    console.log(`   Executed migrations: ${executedMigrations.length}`);

    if (allMigrations.length === 0) {
      console.log('\nNo migration files found');
      return;
    }

    console.log('\nMigration details:');

    for (const migration of allMigrations) {
      const isExecuted = executedMigrations.includes(migration.id);
      const status = isExecuted ? 'Executed' : 'Pending';
      console.log(`   ${status} - ${migration.id}: ${migration.description}`);
    }

    const pendingCount = allMigrations.length - executedMigrations.length;

    if (pendingCount > 0) {
      console.log(`\n${pendingCount} pending migrations`);
      console.log('   Execute: npm run migrate');
    } else {
      console.log('\nAll migrations are up to date');
    }

    // Show additional database information
    console.log('\nDatabase information:');
    const tablesResult = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const tables = tablesResult.rows.map((row: any) => row.table_name);
    console.log(`   Existing tables: ${tables.join(', ')}`);

  } catch (error) {
    console.error('\nError checking status:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Execute script if called directly
if (require.main === module) {
  checkMigrationStatus();
}
