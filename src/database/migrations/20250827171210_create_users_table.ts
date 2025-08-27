import { Migration } from '../migrator';
import { DataTypes } from 'sequelize';

export const migration: Migration = {
  id: '20250827171210_create_users_table',
  description: 'create users table',
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: true
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
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      avatar_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      last_login_at: {
        type: DataTypes.DATE,
        allowNull: true
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

    // Create indexes
    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'idx_users_email'
    });

    await queryInterface.addIndex('users', ['username'], {
      unique: true,
      name: 'idx_users_username'
    });

    await queryInterface.addIndex('users', ['profile_id'], {
      name: 'idx_users_profile_id'
    });

    await queryInterface.addIndex('users', ['is_active'], {
      name: 'idx_users_active'
    });

    await queryInterface.addIndex('users', ['created_at'], {
      name: 'idx_users_created_at'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
