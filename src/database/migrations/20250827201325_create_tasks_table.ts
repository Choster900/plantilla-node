import { Migration } from '../migrator';
import { DataTypes } from 'sequelize';

export const migration: Migration = {
  id: '20250827201325_create_tasks_table',
  description: 'create tasks table',
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tasks', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      list_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'lists',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    await queryInterface.addIndex('tasks', ['list_id'], {
      name: 'idx_tasks_list_id'
    });

    await queryInterface.addIndex('tasks', ['status'], {
      name: 'idx_tasks_status'
    });

    await queryInterface.addIndex('tasks', ['priority'], {
      name: 'idx_tasks_priority'
    });

    await queryInterface.addIndex('tasks', ['due_date'], {
      name: 'idx_tasks_due_date'
    });

    await queryInterface.addIndex('tasks', ['list_id', 'position'], {
      name: 'idx_tasks_list_position'
    });

    await queryInterface.addIndex('tasks', ['created_at'], {
      name: 'idx_tasks_created_at'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tasks');
  }
};
