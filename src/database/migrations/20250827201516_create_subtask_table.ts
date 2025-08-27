import { Migration } from '../migrator';
import { DataTypes } from 'sequelize';

export const migration: Migration = {
  id: '20250827201516_create_subtask_table',
  description: 'create subtask table',
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subtasks', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      task_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'tasks',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      done: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.addIndex('subtasks', ['task_id'], {
      name: 'idx_subtasks_task_id'
    });

    await queryInterface.addIndex('subtasks', ['done'], {
      name: 'idx_subtasks_done'
    });

    await queryInterface.addIndex('subtasks', ['task_id', 'position'], {
      name: 'idx_subtasks_task_position'
    });

    await queryInterface.addIndex('subtasks', ['created_at'], {
      name: 'idx_subtasks_created_at'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('subtasks');
  }
};
