import { BaseTable, ColumnDefinition, IndexDefinition } from '../database/BaseTable';

export class UserTable extends BaseTable {
  tableName = 'users';

  columns: ColumnDefinition[] = [
    {
      name: 'id',
      type: 'SERIAL',
      primaryKey: true,
      autoIncrement: true,
      nullable: false
    },
    {
      name: 'email',
      type: 'VARCHAR',
      length: 255,
      nullable: false,
      unique: true
    },
    {
      name: 'username',
      type: 'VARCHAR',
      length: 50,
      nullable: false,
      unique: true
    },
    {
      name: 'password_hash',
      type: 'VARCHAR',
      length: 255,
      nullable: false
    },
    {
      name: 'first_name',
      type: 'VARCHAR',
      length: 100,
      nullable: true
    },
    {
      name: 'last_name',
      type: 'VARCHAR',
      length: 100,
      nullable: true
    },
    {
      name: 'profile_id',
      type: 'INTEGER',
      nullable: true,
      references: {
        table: 'profiles',
        column: 'id',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      }
    },
    {
      name: 'is_active',
      type: 'BOOLEAN',
      nullable: false,
      default: true
    },
    {
      name: 'is_verified',
      type: 'BOOLEAN',
      nullable: false,
      default: false
    },
    {
      name: 'avatar_url',
      type: 'VARCHAR',
      length: 500,
      nullable: true
    },
    {
      name: 'last_login_at',
      type: 'TIMESTAMP',
      nullable: true
    },
    {
      name: 'created_at',
      type: 'TIMESTAMP',
      nullable: false,
      default: 'CURRENT_TIMESTAMP'
    },
    {
      name: 'updated_at',
      type: 'TIMESTAMP',
      nullable: false,
      default: 'CURRENT_TIMESTAMP'
    }
  ];

  indexes: IndexDefinition[] = [
    {
      name: 'idx_users_email',
      columns: ['email'],
      unique: true
    },
    {
      name: 'idx_users_username',
      columns: ['username'],
      unique: true
    },
    {
      name: 'idx_users_profile_id',
      columns: ['profile_id']
    },
    {
      name: 'idx_users_active',
      columns: ['is_active']
    },
    {
      name: 'idx_users_created_at',
      columns: ['created_at']
    }
  ];
}
