import { Migration } from '../migrator';
import { DataTypes } from 'sequelize';

export const migration: Migration = {
  id: '20250827201144_create_lists_table',
  description: 'create lists table',
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('lists', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      owner_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      is_archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

    // Add indexes
    await queryInterface.addIndex('lists', ['owner_id'], {
      name: 'idx_lists_owner_id'
    });

    await queryInterface.addIndex('lists', ['is_archived'], {
      name: 'idx_lists_archived'
    });

    await queryInterface.addIndex('lists', ['created_at'], {
      name: 'idx_lists_created_at'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('lists');
  }
};
