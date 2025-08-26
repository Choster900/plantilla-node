#!/usr/bin/env node

/**
 * Script to rollback the last migration
 * Usage: npm run migrate:rollback
 */

import { testConnection, closePool } from '../database/connection';
import { rollbackLastMigration } from '../database/migrator';

async function rollbackMigration() {
  console.log('Starting migration rollback...\n');

  try {
    // Verify database connection
    const isConnected = await testConnection();

    if (!isConnected) {
      console.error('Could not connect to database');
      process.exit(1);
    }

    // Rollback last migration
    await rollbackLastMigration();

    console.log('\nRollback completed successfully');

  } catch (error) {
    console.error('\Error during rollback:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Execute script if called directly
if (require.main === module) {
  rollbackMigration();
}
