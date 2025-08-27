import { Migration } from '../migrator';
import { DataTypes } from 'sequelize';

export const migration: Migration = {
  id: '20250827182528_nombre_migracion',
  description: 'nombre migracion',
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
