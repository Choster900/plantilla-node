#!/usr/bin/env node

import { program } from 'commander';
import { MigrationGenerator } from '../database/MigrationGenerator';

program
  .version('1.0.0')
  .description('Sequelize migration generator');

program
  .command('create <migrationName>')
  .alias('gen')
  .description('Create a new Sequelize migration')
  .option('-t, --template <type>', 'Migration template: create-table, add-column, modify-column, drop-column, custom', 'custom')
  .action(async (migrationName: string, options: { template: string }) => {
    const generator = new MigrationGenerator();

    try {
      console.log(`Creating migration: ${migrationName}\n`);
      const filePath = await generator.generateMigration(migrationName, options.template as any);
      console.log(`\nMigration created successfully at: ${filePath}`);
      console.log('\nRemember to:');
      console.log('1. Edit the migration file to add your specific changes');
      console.log('2. Run "npm run migrate" to apply the migration');
    } catch (error) {
      console.error('Migration creation failed:', error);
      process.exit(1);
    }
  });

program
  .command('list')
  .alias('ls')
  .description('List all existing migrations')
  .action(async () => {
    const generator = new MigrationGenerator();

    try {
      console.log('Existing migrations:\n');
      const migrations = await generator.listMigrations();

      if (migrations.length === 0) {
        console.log('No migrations found.');
      } else {
        migrations.forEach((migration, index) => {
          console.log(`${index + 1}. ${migration}`);
        });
      }
    } catch (error) {
      console.error('Error listing migrations:', error);
      process.exit(1);
    }
  });

program
  .command('help-templates')
  .description('Show migration template examples')
  .action(() => {
    console.log('Available migration templates:\n');
    console.log('1. create-table: Creates a new table with basic structure');
    console.log('2. add-column: Adds a new column to an existing table');
    console.log('3. modify-column: Modifies an existing column');
    console.log('4. drop-column: Removes a column from a table');
    console.log('5. custom: Empty template for custom migrations\n');

    console.log('Examples:');
    console.log('  npm run generate:migration create add_email_to_users -- --template add-column');
    console.log('  npm run generate:migration create create_posts_table -- --template create-table');
    console.log('  npm run generate:migration create modify_user_email -- --template modify-column');
  });

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse(process.argv);
