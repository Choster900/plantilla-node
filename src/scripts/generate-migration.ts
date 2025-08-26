#!/usr/bin/env node

import { program } from 'commander';
import { MigrationGenerator } from '../database/MigrationGenerator';
import { UserTable } from '../tables/UserTable';
import { ProfileTable } from '../tables/ProfileTable';

program
  .version('1.0.0')
  .description('Migration generator for table definitions');

program
  .command('generate [migrationName]')
  .alias('gen')
  .description('Generate migrations from table definitions')
  .option('-t, --table <tableName>', 'Generate migration for specific table')
  .option('-a, --all', 'Generate migrations for all tables')
  .action(async (migrationName?: string, options?: { table?: string; all?: boolean }) => {
    const generator = new MigrationGenerator();

    try {
      if (options?.all) {
        console.log('Generating migrations for all tables...\n');
        await generator.generateAllMigrations();
      } else if (options?.table) {
        console.log(`Generating migration for table: ${options.table}\n`);
        await generator.generateMigrationForTable(options.table, migrationName);
      } else {
        // Default: generate for UserTable
        console.log('Generating migration for User table...\n');
        await generator.generateMigrationFromTable(UserTable, migrationName);
      }
    } catch (error) {
      console.error('Migration generation failed:', error);
      process.exit(1);
    }
  });

program
  .command('list')
  .alias('ls')
  .description('List all available table definitions')
  .action(async () => {
    const generator = new MigrationGenerator();

    try {
      console.log('Available table definitions:\n');
      const tables = await generator.listAvailableTables();

      if (tables.length === 0) {
        console.log('No table definitions found.');
      } else {
        tables.forEach((table, index) => {
          console.log(`  ${index + 1}. ${table}`);
        });
      }
    } catch (error) {
      console.error('Error listing tables:', error);
      process.exit(1);
    }
  });

program
  .command('table')
  .description('Generate migration for a specific table class')
  .option('-c, --class <className>', 'Table class name (e.g., UserTable)')
  .option('-n, --name <migrationName>', 'Custom migration name')
  .action(async (options: { class?: string; name?: string }) => {
    if (!options.class) {
      console.error('Please specify a table class with --class option');
      process.exit(1);
    }

    const generator = new MigrationGenerator();

    try {
      // Map known table classes
      const tableClasses: { [key: string]: any } = {
        'UserTable': UserTable,
        'User': UserTable,
        'ProfileTable': ProfileTable,
        'Profile': ProfileTable
      };

      const TableClass = tableClasses[options.class];

      if (!TableClass) {
        console.error(`Table class "${options.class}" not found. Available classes: ${Object.keys(tableClasses).join(', ')}`);
        process.exit(1);
      }

      console.log(`Generating migration for ${options.class}...\n`);
      await generator.generateMigrationFromTable(TableClass, options.name);
    } catch (error) {
      console.error('Migration generation failed:', error);
      process.exit(1);
    }
  });

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse(process.argv);
