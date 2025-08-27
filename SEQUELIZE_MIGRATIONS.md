# Migraciones con Sequelize

## Descripción

El sistema de migraciones ha sido migrado de SQL crudo a usar la API de Sequelize, proporcionando mayor consistencia, seguridad de tipos y mejor integración con el ORM.

## Estructura de Migraciones

### Nueva Interface
```typescript
export interface Migration {
    id: string;
    description: string;
    up: (queryInterface: QueryInterface, Sequelize: any) => Promise<void>;
    down: (queryInterface: QueryInterface, Sequelize: any) => Promise<void>;
}
```

### Ejemplo de Migración
```typescript
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
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
```

## Comandos Disponibles

### Crear una nueva migración
```bash
# Migración personalizada
npm run generate:migration create add_phone_to_users

# Con template específico
npm run generate:migration create add_phone_to_users -- --template add-column
npm run generate:migration create create_posts_table -- --template create-table
npm run generate:migration create modify_user_email -- --template modify-column
npm run generate:migration create remove_old_column -- --template drop-column
```

### Listar migraciones existentes
```bash
npm run generate:migration list
```

### Ver ayuda de templates
```bash
npm run generate:migration help-templates
```

### Ejecutar migraciones
```bash
npm run migrate
```

### Hacer rollback
```bash
npm run migrate:rollback
```

### Ver estado de migraciones
```bash
npm run migrate:status
```

## Templates Disponibles

### 1. create-table
Crea una nueva tabla con estructura básica:
- ID auto-incremental
- Timestamps (created_at, updated_at)
- Ejemplo de columnas básicas

### 2. add-column
Agrega una nueva columna a una tabla existente:
- Estructura para agregar columna
- Rollback que elimina la columna

### 3. modify-column
Modifica una columna existente:
- Cambiar tipo de datos
- Modificar restricciones
- Rollback con configuración original

### 4. drop-column
Elimina una columna de una tabla:
- Eliminar columna
- Rollback que restaura la columna

### 5. custom
Template vacío para migraciones personalizadas con ejemplos comentados.

## Operaciones Comunes con QueryInterface

### Crear tabla
```typescript
await queryInterface.createTable('table_name', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
});
```

### Agregar columna
```typescript
await queryInterface.addColumn('users', 'phone', {
  type: DataTypes.STRING(20),
  allowNull: true
});
```

### Modificar columna
```typescript
await queryInterface.changeColumn('users', 'email', {
  type: DataTypes.STRING(500),
  allowNull: false
});
```

### Eliminar columna
```typescript
await queryInterface.removeColumn('users', 'old_column');
```

### Agregar índice
```typescript
await queryInterface.addIndex('users', ['email'], {
  unique: true,
  name: 'idx_users_email'
});
```

### Eliminar índice
```typescript
await queryInterface.removeIndex('users', 'idx_users_email');
```

### Agregar constraint
```typescript
await queryInterface.addConstraint('users', {
  fields: ['profile_id'],
  type: 'foreign key',
  name: 'fk_users_profile',
  references: {
    table: 'profiles',
    field: 'id'
  },
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
```

### Eliminar constraint
```typescript
await queryInterface.removeConstraint('users', 'fk_users_profile');
```

## Tipos de Datos Sequelize

### Tipos Básicos
- `DataTypes.STRING(length)` - VARCHAR
- `DataTypes.TEXT` - TEXT
- `DataTypes.INTEGER` - INTEGER
- `DataTypes.BIGINT` - BIGINT
- `DataTypes.BOOLEAN` - BOOLEAN
- `DataTypes.DATE` - TIMESTAMP
- `DataTypes.DECIMAL(precision, scale)` - DECIMAL
- `DataTypes.FLOAT` - FLOAT
- `DataTypes.DOUBLE` - DOUBLE

### Tipos Especiales
- `DataTypes.UUID` - UUID
- `DataTypes.JSONB` - JSONB (PostgreSQL)
- `DataTypes.ENUM('value1', 'value2')` - ENUM
- `DataTypes.ARRAY(DataTypes.STRING)` - ARRAY

### Opciones de Columna
- `allowNull: boolean` - Permite NULL
- `defaultValue: any` - Valor por defecto
- `unique: boolean` - Único
- `primaryKey: boolean` - Clave primaria
- `autoIncrement: boolean` - Auto-incremento
- `references: { model: string, key: string }` - Clave foránea

## Migración de SQL Crudo a Sequelize

### Antes (SQL Crudo)
```typescript
up: async (client) => {
  await client.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE
    );
  `);
}
```

### Después (Sequelize)
```typescript
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
    }
  });
}
```

## Beneficios de Sequelize Migrations

1. **Seguridad de tipos**: TypeScript completo
2. **Consistencia**: Mismo syntax que los modelos
3. **Portabilidad**: Funciona en diferentes bases de datos
4. **Validación**: Sequelize valida los tipos y restricciones
5. **Integración**: Mejor integración con el resto del ORM
6. **Documentación**: Mejor documentación y autocompletado

## Buenas Prácticas

1. **Nombres descriptivos**: Usa nombres claros para las migraciones
2. **Rollbacks seguros**: Siempre implementa rollbacks que funcionen
3. **Cambios pequeños**: Una migración por cambio conceptual
4. **Pruebas**: Prueba tanto up como down en desarrollo
5. **Backup**: Siempre haz backup antes de aplicar en producción
6. **Orden**: Las migraciones se ejecutan en orden cronológico

## Troubleshooting

### Error: "Migration already exists"
- Verifica que no haya duplicados en la carpeta migrations
- Revisa la tabla migrations en la base de datos

### Error: "Table already exists"
- Verifica el estado actual con `npm run migrate:status`
- Considera hacer rollback y recrear

### Error: "Column already exists"
- Verifica la estructura actual de la tabla
- Ajusta la migración para el estado actual
