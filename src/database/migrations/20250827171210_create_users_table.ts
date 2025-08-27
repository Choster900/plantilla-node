import { Migration } from '../migrator';
import { DataTypes } from 'sequelize';

export const migration: Migration = {
  id: '20250827171210_create_users_table',
  description: 'create users table',
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      profile_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'profiles',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
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

    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'idx_users_email'
    });

    await queryInterface.addIndex('users', ['profile_id'], {
      name: 'idx_users_profile_id'
    });

    await queryInterface.addIndex('users', ['created_at'], {
      name: 'idx_users_created_at'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
