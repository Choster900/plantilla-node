import fs from 'fs';
import path from 'path';

export class MigrationGenerator {
  private migrationsPath: string;

  constructor(migrationsPath: string = './src/database/migrations') {
    this.migrationsPath = migrationsPath;
  }

  /**
   * Generate a new migration file with Sequelize template
   */
  async generateMigration(migrationName: string, template: 'create-table' | 'add-column' | 'modify-column' | 'drop-column' | 'custom' = 'custom'): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[-T:]/g, '').split('.')[0];
    const fileName = `${timestamp}_${migrationName}.ts`;
    const filePath = path.join(this.migrationsPath, fileName);

    const migrationContent = this.generateMigrationTemplate(migrationName, template, timestamp);

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
   * Generate migration template based on type
   */
  private generateMigrationTemplate(migrationName: string, template: string, timestamp: string): string {
    const baseImports = `import { Migration } from '../migrator';
import { DataTypes } from 'sequelize';`;

    const migrationId = `${timestamp}_${migrationName}`;
    const description = migrationName.replace(/_/g, ' ');

    switch (template) {
      case 'create-table':
        return this.generateCreateTableTemplate(baseImports, migrationId, description);
      case 'add-column':
        return this.generateAddColumnTemplate(baseImports, migrationId, description);
      case 'modify-column':
        return this.generateModifyColumnTemplate(baseImports, migrationId, description);
      case 'drop-column':
        return this.generateDropColumnTemplate(baseImports, migrationId, description);
      default:
        return this.generateCustomTemplate(baseImports, migrationId, description);
    }
  }

  private generateCreateTableTemplate(imports: string, id: string, description: string): string {
    return `${imports}

export const migration: Migration = {
  id: '${id}',
  description: '${description}',
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('table_name', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      // Add your columns here
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes if needed
    // await queryInterface.addIndex('table_name', ['column_name']);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('table_name');
  }
};
`;
  }

  private generateAddColumnTemplate(imports: string, id: string, description: string): string {
    return `${imports}

export const migration: Migration = {
  id: '${id}',
  description: '${description}',
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('table_name', 'column_name', {
      type: DataTypes.STRING(255),
      allowNull: true,
      // Add other column options as needed
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('table_name', 'column_name');
  }
};
`;
  }

  private generateModifyColumnTemplate(imports: string, id: string, description: string): string {
    return `${imports}

export const migration: Migration = {
  id: '${id}',
  description: '${description}',
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('table_name', 'column_name', {
      type: DataTypes.STRING(500), // New type or constraints
      allowNull: false,
      // Add other modifications as needed
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('table_name', 'column_name', {
      type: DataTypes.STRING(255), // Original type
      allowNull: true,
      // Restore original configuration
    });
  }
};
`;
  }

  private generateDropColumnTemplate(imports: string, id: string, description: string): string {
    return `${imports}

export const migration: Migration = {
  id: '${id}',
  description: '${description}',
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('table_name', 'column_name');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('table_name', 'column_name', {
      type: DataTypes.STRING(255),
      allowNull: true,
      // Add original column configuration
    });
  }
};
`;
  }

  private generateCustomTemplate(imports: string, id: string, description: string): string {
    return `${imports}

export const migration: Migration = {
  id: '${id}',
  description: '${description}',
  up: async (queryInterface, Sequelize) => {
    // Add your migration logic here
    // Examples:
    // await queryInterface.createTable('table_name', { ... });
    // await queryInterface.addColumn('table_name', 'column_name', { ... });
    // await queryInterface.addIndex('table_name', ['column_name']);
    // await queryInterface.addConstraint('table_name', { ... });
  },
  down: async (queryInterface, Sequelize) => {
    // Add your rollback logic here
    // Examples:
    // await queryInterface.dropTable('table_name');
    // await queryInterface.removeColumn('table_name', 'column_name');
    // await queryInterface.removeIndex('table_name', 'index_name');
    // await queryInterface.removeConstraint('table_name', 'constraint_name');
  }
};
`;
  }

  /**
   * List all existing migrations
   */
  async listMigrations(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.migrationsPath)) {
        return [];
      }

      const files = fs.readdirSync(this.migrationsPath)
        .filter(file => file.endsWith('.ts'))
        .sort();

      return files;
    } catch (error) {
      console.error('Error listing migrations:', error);
      return [];
    }
  }
}
