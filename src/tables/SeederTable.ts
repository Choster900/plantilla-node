import { BaseTable, ColumnDefinition, IndexDefinition } from '../database/BaseTable';

export class SeederTable extends BaseTable {
  tableName = 'seeders';

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
      length: 255,
      nullable: false,
      unique: true
    },
    {
      name: 'description',
      type: 'TEXT',
      nullable: true
    },
    {
      name: 'executed_at',
      type: 'TIMESTAMP',
      nullable: false,
      default: 'CURRENT_TIMESTAMP'
    }
  ];

  indexes: IndexDefinition[] = [
    {
      name: 'idx_seeders_name',
      columns: ['name'],
      unique: true
    },
    {
      name: 'idx_seeders_executed_at',
      columns: ['executed_at']
    }
  ];
}
