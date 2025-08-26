#!/usr/bin/env node

/**
 * Script to run database migrations
 * Usage: npm run migrate
 */

import { testConnection, closePool } from '../database/connection';
import { runPendingMigrations } from '../database/migrator';

async function runMigrations() {
  console.log('Starting migration process...\n');

  try {
    // Verify database connection
    const isConnected = await testConnection();

    if (!isConnected) {
      console.error('Could not connect to database');
      process.exit(1);
    }

    // Run pending migrations
    await runPendingMigrations();

    console.log('\nMigration process completed successfully');

  } catch (error) {
    console.error('\nError during migrations:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Execute script if called directly
if (require.main === module) {
  runMigrations();
}
