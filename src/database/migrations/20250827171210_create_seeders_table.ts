import { Migration } from '../migrator';
import { DataTypes } from 'sequelize';

export const migration: Migration = {
  id: '20250827171210_create_seeders_table',
  description: 'create seeders table',
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('seeders', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      executed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create indexes
    await queryInterface.addIndex('seeders', ['name'], {
      unique: true,
      name: 'idx_seeders_name'
    });

    await queryInterface.addIndex('seeders', ['executed_at'], {
      name: 'idx_seeders_executed_at'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('seeders');
  }
};
