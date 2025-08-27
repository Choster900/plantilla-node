# Ejemplo: Agregando una columna 'phone' a la tabla users

## 1. Crear la migración

```bash
npx ts-node src/scripts/generate-migration.ts create add_phone_to_users --template add-column
```

Esto generará un archivo como: `20250827XXXXXX_add_phone_to_users.ts`

## 2. Editar la migración generada

Edita el archivo generado para especificar los detalles de la columna:

```typescript
import { Migration } from '../migrator';
import { DataTypes } from 'sequelize';

export const migration: Migration = {
  id: '20250827XXXXXX_add_phone_to_users',
  description: 'add phone to users',
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'phone', {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'User phone number'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'phone');
  }
};
```

## 3. Aplicar la migración

```bash
npm run migrate
```

## 4. Actualizar el modelo Sequelize

Agrega la nueva columna al modelo User:

```typescript
// En src/models/User.ts
@Column({
  type: DataType.STRING(20),
  allowNull: true,
  comment: 'User phone number'
})
phone?: string;
```

## 5. Actualizar los DTOs (opcional)

Si necesitas incluir el phone en las operaciones, actualiza los DTOs:

```typescript
// En src/dtos/user.dto.ts
export interface CreateUserData {
  email: string;
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string; // Nuevo campo
  profile_id?: number;
}
```

## 6. Verificar los cambios

```bash
# Verificar estado de migraciones
npm run migrate:status

# Si hay problemas, hacer rollback
npm run migrate:rollback
```

¡Listo! Tu tabla users ahora tiene una columna `phone` y el modelo está actualizado.
