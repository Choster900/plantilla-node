export interface ColumnDefinition {
  name: string;
  type: string;
  nullable?: boolean;
  default?: string | number | boolean;
  unique?: boolean;
  primaryKey?: boolean;
  autoIncrement?: boolean;
  length?: number;
  references?: {
    table: string;
    column: string;
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  };
}

export interface IndexDefinition {
  name: string;
  columns: string[];
  unique?: boolean;
  type?: 'BTREE' | 'HASH' | 'GIN' | 'GIST';
}

export abstract class BaseTable {
  abstract tableName: string;
  abstract columns: ColumnDefinition[];
  indexes?: IndexDefinition[];

  /**
   * Generate CREATE TABLE SQL statement
   */
  generateCreateTableSQL(): string {
    const columnDefinitions = this.columns.map(col => this.generateColumnSQL(col));

    let sql = `CREATE TABLE ${this.tableName} (\n`;
    sql += columnDefinitions.join(',\n');
    sql += '\n);';

    // Add indexes
    if (this.indexes && this.indexes.length > 0) {
      const indexStatements = this.indexes.map(index => this.generateIndexSQL(index));
      sql += '\n\n' + indexStatements.join('\n');
    }

    return sql;
  }

  /**
   * Generate DROP TABLE SQL statement
   */
  generateDropTableSQL(): string {
    return `DROP TABLE IF EXISTS ${this.tableName};`;
  }

  /**
   * Generate column definition SQL
   */
  private generateColumnSQL(column: ColumnDefinition): string {
    let sql = `  ${column.name}`;

    if (column.primaryKey && column.autoIncrement) {
      sql += ' SERIAL PRIMARY KEY';
    } else {
      sql += ` ${column.type.toUpperCase()}`;

      if (column.length) {
        sql += `(${column.length})`;
      }

      if (column.primaryKey) {
        sql += ' PRIMARY KEY';
      }
    }

    if (!column.nullable && !column.primaryKey) {
      sql += ' NOT NULL';
    }

    if (column.unique && !column.primaryKey) {
      sql += ' UNIQUE';
    }

    if (column.default !== undefined) {
      if (typeof column.default === 'string') {
        // Handle special PostgreSQL functions without quotes
        const pgFunctions = ['CURRENT_TIMESTAMP', 'NOW()', 'CURRENT_DATE', 'CURRENT_TIME'];
        if (pgFunctions.includes(column.default.toUpperCase())) {
          sql += ` DEFAULT ${column.default}`;
        } else {
          sql += ` DEFAULT '${column.default}'`;
        }
      } else if (typeof column.default === 'boolean') {
        sql += ` DEFAULT ${column.default}`;
      } else {
        sql += ` DEFAULT ${column.default}`;
      }
    }

    if (column.references) {
      sql += ` REFERENCES ${column.references.table}(${column.references.column})`;
      if (column.references.onDelete) {
        sql += ` ON DELETE ${column.references.onDelete}`;
      }
      if (column.references.onUpdate) {
        sql += ` ON UPDATE ${column.references.onUpdate}`;
      }
    }

    return sql;
  }

  /**
   * Generate index SQL
   */
  private generateIndexSQL(index: IndexDefinition): string {
    const uniqueStr = index.unique ? 'UNIQUE ' : '';
    const typeStr = index.type ? ` USING ${index.type}` : '';
    const columnsStr = index.columns.join(', ');

    return `CREATE ${uniqueStr}INDEX ${index.name} ON ${this.tableName}${typeStr} (${columnsStr});`;
  }

  /**
   * Get table metadata
   */
  getTableMetadata(): {
    tableName: string;
    columns: ColumnDefinition[];
    indexes?: IndexDefinition[];
  } {
    return {
      tableName: this.tableName,
      columns: this.columns,
      indexes: this.indexes
    };
  }
}
