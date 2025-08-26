import { BaseTable, ColumnDefinition, IndexDefinition } from '../database/BaseTable';

export class ProfileTable extends BaseTable {
  tableName = 'profiles';

  columns: ColumnDefinition[] = [
    {
      name: 'id',
      type: 'SERIAL',
      primaryKey: true,
      autoIncrement: true,
      nullable: false
    },
    {
      name: 'name',
      type: 'VARCHAR',
      length: 100,
      nullable: false,
      unique: true
    },
    {
      name: 'description',
      type: 'TEXT',
      nullable: true
    },
    {
      name: 'permissions',
      type: 'JSONB',
      nullable: false,
      default: '{}'
    },
    {
      name: 'is_active',
      type: 'BOOLEAN',
      nullable: false,
      default: true
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
      name: 'idx_profiles_name',
      columns: ['name'],
      unique: true
    },
    {
      name: 'idx_profiles_active',
      columns: ['is_active']
    }
  ];
}
