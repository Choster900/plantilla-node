import fs from 'fs';
import path from 'path';
import { BaseTable } from '../database/BaseTable';

export interface TableRegistry {
  [tableName: string]: new() => BaseTable;
}

export class MigrationGenerator {
  private tablesPath: string;
  private migrationsPath: string;

  constructor(tablesPath: string = './src/tables', migrationsPath: string = './src/database/migrations') {
    this.tablesPath = tablesPath;
    this.migrationsPath = migrationsPath;
  }

  /**
   * Generate migration from table definition
   */
  async generateMigrationFromTable(tableClass: new() => BaseTable, migrationName?: string): Promise<string> {
    const table = new tableClass();
    const timestamp = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0];
    const name = migrationName || `create_${table.tableName}_table`;
    const fileName = `${timestamp}_${name}.ts`;
    const filePath = path.join(this.migrationsPath, fileName);

    const migrationContent = this.generateMigrationContent(table, name);

    // Ensure migrations directory exists
    if (!fs.existsSync(this.migrationsPath)) {
      fs.mkdirSync(this.migrationsPath, { recursive: true });
    }

    // Write migration file
    fs.writeFileSync(filePath, migrationContent);

    console.log(`Migration generated: ${fileName}`);
    return filePath;
  }

  /**
   * Generate migration content from table definition
   */
  private generateMigrationContent(table: BaseTable, migrationName: string): string {
    const upSQL = table.generateCreateTableSQL();
    const downSQL = table.generateDropTableSQL();
    const timestamp = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0];

    return `import { Migration } from '../migrator';

export const migration: Migration = {
  id: '${timestamp}_${migrationName}',
  description: '${migrationName.replace(/_/g, ' ')}',
  up: async (client) => {
    await client.query(\`
${upSQL}
    \`);
  },
  down: async (client) => {
    await client.query(\`
${downSQL}
    \`);
  }
};
`;
  }

  /**
   * Scan tables directory and generate migrations for all tables
   */
  async generateAllMigrations(): Promise<string[]> {
    const generatedMigrations: string[] = [];

    try {
      const tableFiles = fs.readdirSync(this.tablesPath)
        .filter(file => file.endsWith('.ts') && file !== 'index.ts');

      for (const file of tableFiles) {
        try {
          const tablePath = path.join(process.cwd(), this.tablesPath, file);
          const tableModule = await import(tablePath);

          // Find the table class in the module
          const tableClass = this.findTableClass(tableModule);

          if (tableClass) {
            const migrationPath = await this.generateMigrationFromTable(tableClass);
            generatedMigrations.push(migrationPath);
          }
        } catch (error) {
          console.error(`Error processing table file ${file}:`, error);
        }
      }

      console.log(`\nGenerated ${generatedMigrations.length} migrations successfully!`);
      return generatedMigrations;

    } catch (error) {
      console.error('Error scanning tables directory:', error);
      throw error;
    }
  }

  /**
   * Find table class that extends BaseTable in a module
   */
  private findTableClass(module: any): (new() => BaseTable) | null {
    for (const exportName in module) {
      const exportedItem = module[exportName];

      if (typeof exportedItem === 'function' &&
          exportedItem.prototype &&
          this.extendsBaseTable(exportedItem)) {
        return exportedItem;
      }
    }
    return null;
  }

  /**
   * Check if a class extends BaseTable
   */
  private extendsBaseTable(constructor: any): boolean {
    try {
      const instance = new constructor();
      return instance instanceof BaseTable;
    } catch {
      return false;
    }
  }

  /**
   * Generate migration for specific table by name
   */
  async generateMigrationForTable(tableName: string, migrationName?: string): Promise<string> {
    try {
      const tableFiles = fs.readdirSync(this.tablesPath)
        .filter(file => file.endsWith('.ts'));

      for (const file of tableFiles) {
        const tablePath = path.join(process.cwd(), this.tablesPath, file);
        const tableModule = await import(tablePath);
        const tableClass = this.findTableClass(tableModule);

        if (tableClass) {
          const table = new tableClass();
          if (table.tableName === tableName) {
            return await this.generateMigrationFromTable(tableClass, migrationName);
          }
        }
      }

      throw new Error(`Table "${tableName}" not found in ${this.tablesPath}`);
    } catch (error) {
      console.error(`Error generating migration for table ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * List all available tables
   */
  async listAvailableTables(): Promise<string[]> {
    const tables: string[] = [];

    try {
      const tableFiles = fs.readdirSync(this.tablesPath)
        .filter(file => file.endsWith('.ts') && file !== 'index.ts');

      for (const file of tableFiles) {
        try {
          const tablePath = path.join(process.cwd(), this.tablesPath, file);
          const tableModule = await import(tablePath);
          const tableClass = this.findTableClass(tableModule);

          if (tableClass) {
            const table = new tableClass();
            tables.push(table.tableName);
          }
        } catch (error) {
          console.error(`Error reading table file ${file}:`, error);
        }
      }

      return tables;
    } catch (error) {
      console.error('Error listing tables:', error);
      return [];
    }
  }
}
