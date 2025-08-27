#!/usr/bin/env node

/**
 * Script to create a development database
 * Uses PostgreSQL by default according to environment variables
 */

import { Pool } from 'pg';
import { config } from '../config';

async function createDatabase() {
  console.log('Attempting to create development database...\n');

  // Connect to PostgreSQL system (without specifying database)
  const systemPool = new Pool({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: 'postgres' // Default system database
  });

  try {
    console.log('🔌 Connecting to PostgreSQL server...');

    // Check if database already exists
    const checkDbQuery = `
      SELECT 1 FROM pg_database WHERE datname = $1;
    `;

    const result = await systemPool.query(checkDbQuery, [config.database.name]);

    if (result.rows.length > 0) {
      console.log(`Database '${config.database.name}' already exists`);
    } else {
      // Create the database
      const createDbQuery = `CREATE DATABASE "${config.database.name}";`;
      await systemPool.query(createDbQuery);
      console.log(`Database '${config.database.name}' created successfully`);
    }

    console.log('\nDatabase configuration completed');
    console.log('\nNext steps:');
    console.log('   1. npm run migrate          - Run migrations');
    console.log('   2. npm run seed:users       - Create test users');
    console.log('   3. npm run dev              - Start server');

  } catch (error: any) {
    console.error('\nError creating database:');

    if (error.code === '28P01') {
      console.error('Authentication error: incorrect credentials');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to PostgreSQL');
    } else {
      console.error(error.message);
    }

    process.exit(1);
  } finally {
    await systemPool.end();
  }
}

// Execute script if called directly
if (require.main === module) {
  createDatabase();
}
