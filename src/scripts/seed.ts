#!/usr/bin/env node

import 'dotenv/config';
import { testConnection, closePool } from '../database/connection';
import { query } from '../database/connection';
import { allSeeders } from '../database/seeds';

/**
 * Main seeder script that runs all seeders
 */
async function runSeeders() {
  try {
    console.log('Starting database seeding process...\n');

    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Database connection failed');
      process.exit(1);
    }

    console.log('Database connection successful\n');

    // Ensure seeders table exists
    await ensureSeedersTable();

    let seedersRun = 0;
    let seedersSkipped = 0;

    // Run all seeders
    for (const seeder of allSeeders) {
      try {
        const wasExecuted = await seeder.execute();
        if (wasExecuted) {
          seedersRun++;
        } else {
          seedersSkipped++;
        }
      } catch (error) {
        console.error(`Fatal error running seeder "${seeder.name}":`, error);
        throw error;
      }
    }

    console.log('\n--- Seeding Summary ---');
    console.log(`Total seeders: ${allSeeders.length}`);
    console.log(`Seeders executed: ${seedersRun}`);
    console.log(`Seeders skipped: ${seedersSkipped}`);
    console.log('Database seeding completed successfully!');

  } catch (error) {
    console.error('\nSeeding process failed:', error);
    process.exit(1);
  } finally {
    await closePool();
    console.log('\nDatabase connection closed');
  }
}

/**
 * Ensure the seeders table exists
 */
async function ensureSeedersTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS seeders (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Seeders table verified/created');
  } catch (error) {
    console.error('Error creating seeders table:', error);
    throw error;
  }
}

/**
 * Show seeding status
 */
async function showSeedingStatus() {
  try {
    console.log('Checking seeding status...\n');

    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Database connection failed');
      process.exit(1);
    }

    // Check if seeders table exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'seeders'
      );
    `);

    if (!tableExists.rows[0].exists) {
      console.log('Seeders table does not exist. No seeders have been run.');
      return;
    }

    // Get executed seeders
    const executedSeeders = await query(`
      SELECT name, description, executed_at
      FROM seeders
      ORDER BY executed_at ASC
    `);

    if (executedSeeders.rows.length === 0) {
      console.log('No seeders have been executed yet.');
    } else {
      console.log('Executed seeders:');
      executedSeeders.rows.forEach((seeder: any, index: number) => {
        console.log(`  ${index + 1}. ${seeder.name} - ${seeder.description}`);
        console.log(`     Executed at: ${seeder.executed_at}`);
      });
    }

    console.log(`\nTotal available seeders: ${allSeeders.length}`);
    console.log(`Total executed seeders: ${executedSeeders.rows.length}`);
    console.log(`Pending seeders: ${allSeeders.length - executedSeeders.rows.length}`);

  } catch (error) {
    console.error('Error checking seeding status:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'status':
    showSeedingStatus();
    break;
  case 'run':
  case undefined:
    runSeeders();
    break;
  default:
    console.log('Usage:');
    console.log('  npm run seed          - Run all seeders');
    console.log('  npm run seed status   - Show seeding status');
    process.exit(1);
}
