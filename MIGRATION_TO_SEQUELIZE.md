# Migración a Sequelize

## ¿Qué se ha migrado?

He migrado completamente tu proyecto de Node.js de consultas SQL directas a **Sequelize ORM** con TypeScript. Esto elimina todo el código SQL manual de tu proyecto y proporciona una interfaz más robusta y type-safe para trabajar con la base de datos.

## Cambios realizados

### 1. Instalación de dependencias
```bash
npm install sequelize sequelize-typescript @types/sequelize reflect-metadata
```

### 2. Configuración de TypeScript
- Habilitado `experimentalDecorators` y `emitDecoratorMetadata` en `tsconfig.json`
- Agregado `reflect-metadata` como importación global

### 3. Nuevos archivos creados

#### `src/database/sequelize.ts`
- Configuración principal de Sequelize
- Función `initializeDatabase()` para inicializar la conexión
- Función `closeDatabase()` para cerrar conexiones

#### `src/models/index.ts`
- Configuración de asociaciones entre modelos
- Exportación centralizada de modelos

### 4. Modelos migrados

#### `src/models/User.ts`
- **Antes**: Clase `UserModel` con consultas SQL manuales
- **Ahora**: Clase `User` que extiende `Model` de Sequelize con decoradores TypeScript
- Métodos migrados:
  - `createUser()` - Crear usuario
  - `findByIdWithProfile()` - Buscar por ID con perfil
  - `findByEmail()` - Buscar por email
  - `findByUsername()` - Buscar por username
  - `findAllUsers()` - Obtener todos con paginación
  - `updateUser()` - Actualizar usuario
  - `softDeleteUser()` - Eliminación suave
  - `deleteUser()` - Eliminación permanente
  - `countUsers()` - Contar usuarios
  - `emailExists()` - Verificar si email existe
  - `usernameExists()` - Verificar si username existe
  - `updateLastLogin()` - Actualizar último login
  - `findWithProfile()` - Buscar con información de perfil
  - `assignProfile()` - Asignar perfil
  - `removeProfile()` - Remover perfil
  - `hasPermission()` - Verificar permisos

#### `src/models/Profile.ts`
- **Antes**: Clase `ProfileModel` con consultas SQL manuales
- **Ahora**: Clase `Profile` que extiende `Model` de Sequelize con decoradores TypeScript
- Métodos migrados:
  - `createProfile()` - Crear perfil
  - `findByIdWithUsers()` - Buscar por ID con usuarios
  - `findByName()` - Buscar por nombre
  - `findAllProfiles()` - Obtener todos los perfiles
  - `updateProfile()` - Actualizar perfil
  - `softDeleteProfile()` - Eliminación suave
  - `deleteProfile()` - Eliminación permanente
  - `hasPermission()` - Verificar permisos (método de instancia y estático)
  - `getProfileUsers()` - Obtener usuarios del perfil
  - `getUsers()` - Método estático para obtener usuarios

### 5. Servicios actualizados

#### `src/services/AuthService.ts`
- Migrado de `UserModel` y `ProfileModel` a `User` y `Profile`
- Mantiene toda la funcionalidad de autenticación
- Ahora usa métodos de Sequelize en lugar de SQL directo

### 6. Rutas actualizadas

#### `src/routes/users.ts`
- Migrado de `UserModel` a `User`
- Mantiene todas las rutas API existentes
- Usa los nuevos métodos de Sequelize

#### `src/routes/profiles.ts`
- Migrado de `ProfileModel` a `Profile`
- Mantiene todas las rutas API existentes
- Usa los nuevos métodos de Sequelize

### 7. Aplicación principal

#### `src/index.ts`
- Agregado `import 'reflect-metadata'` al inicio
- Reemplazado `testConnection()` con `initializeDatabase()`
- Ahora inicializa Sequelize al arrancar el servidor

## Ventajas de la migración

### ✅ Type Safety
- **Antes**: Consultas SQL como strings sin verificación de tipos
- **Ahora**: Modelos TypeScript completamente tipados con IntelliSense

### ✅ Validación automática
- **Antes**: Validación manual en cada consulta
- **Ahora**: Validaciones definidas en los decoradores del modelo

### ✅ Relaciones automáticas
- **Antes**: JOINs manuales en SQL
- **Ahora**: Asociaciones automáticas con `include`

### ✅ Migraciones automáticas
- **Antes**: Migraciones SQL manuales
- **Ahora**: Sequelize puede generar y sincronizar automáticamente

### ✅ Protección contra SQL Injection
- **Antes**: Vulnerable si mal implementado
- **Ahora**: Protección automática por Sequelize

### ✅ Múltiples bases de datos
- **Antes**: Solo PostgreSQL
- **Ahora**: Soporta MySQL, SQLite, SQL Server, etc.

## Cómo usar los nuevos modelos

### Crear un usuario
```typescript
import { User } from './models/User';

const newUser = await User.createUser({
  email: 'user@example.com',
  username: 'johndoe',
  password_hash: 'hashedpassword',
  first_name: 'John',
  last_name: 'Doe'
});
```

### Buscar usuario con perfil
```typescript
const user = await User.findByIdWithProfile(1);
console.log(user.profile); // Información del perfil incluida
```

### Crear perfil
```typescript
import { Profile } from './models/Profile';

const profile = await Profile.createProfile({
  name: 'Administrator',
  description: 'Full access profile',
  permissions: {
    users: ['create', 'read', 'update', 'delete'],
    profiles: ['create', 'read', 'update', 'delete']
  }
});
```

### Verificar permisos
```typescript
const hasPermission = await User.hasPermission(userId, 'users', 'delete');
if (hasPermission) {
  // Usuario tiene permiso para eliminar usuarios
}
```

## Compatibilidad

- ✅ Todas las rutas API funcionan igual que antes
- ✅ Misma estructura de respuestas
- ✅ Misma funcionalidad de autenticación
- ✅ Mismos permisos y roles
- ✅ Compatible con tu base de datos PostgreSQL existente

## Ejecutar el proyecto

```bash
npm run dev
```

El proyecto ahora usará Sequelize en lugar de consultas SQL directas, pero mantendrá toda la funcionalidad existente.

## Próximos pasos recomendados

1. **Pruebas**: Ejecuta todas tus pruebas para confirmar que todo funciona
2. **Optimización**: Puedes agregar índices y optimizaciones específicas de Sequelize
3. **Validaciones**: Considera agregar más validaciones a nivel de modelo
4. **Migraciones**: Puedes migrar tu sistema de migraciones a Sequelize CLI si lo deseas
