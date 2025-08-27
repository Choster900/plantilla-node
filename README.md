# Node.js Project Template

A complete Node.js project template with Express, TypeScript, PostgreSQL, and Sequelize ORM.

## Features

- **Express.js** with TypeScript
- **PostgreSQL** database with Sequelize ORM
- **Environment validation** with Joi
- **Sequelize migrations** system with templates
- **User authentication** system with bcrypt
- **RESTful API** with CRUD operations
- **DTOs** for type-safe data transfer
- **Comprehensive error handling**

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database configuration
```

4. Validate environment:
```bash
npm run validate-env
```

### Database Setup

1. Create database:
```bash
npm run db:create
```

2. Run existing migrations:
```bash
npm run migrate
```

3. Check migration status:
```bash
npm run migrate:status
```

## Project Architecture

This project follows a clean architecture pattern with the following structure:

```
src/
├── models/          # Sequelize models with TypeScript decorators
├── dtos/           # Data Transfer Objects for type-safe API contracts
├── routes/         # Express route handlers
├── services/       # Business logic layer
├── middleware/     # Express middleware (auth, validation, etc.)
├── database/       # Database configuration and migrations
│   ├── migrations/ # Sequelize migration files
│   ├── seeds/      # Database seeders
│   └── sequelize.ts # Sequelize configuration
├── scripts/        # Utility scripts (migrate, seed, etc.)
└── config/         # Application configuration
```

### Key Components

- **Models**: Define database schema using Sequelize decorators
- **DTOs**: Type-safe interfaces for API requests/responses
- **Migrations**: Database schema changes using Sequelize API
- **Services**: Business logic separated from route handlers
- **Middleware**: Cross-cutting concerns like authentication

## Sequelize Migrations

This project uses Sequelize for database operations and migrations. The migration system provides templates for common operations.

### Creating a New Migration

Generate migrations using the built-in templates:

```bash
# Create a new table
npx ts-node src/scripts/generate-migration.ts create create_posts_table --template create-table

# Add a column
npx ts-node src/scripts/generate-migration.ts create add_phone_to_users --template add-column

# Modify a column
npx ts-node src/scripts/generate-migration.ts create modify_user_email --template modify-column

# Drop a column
npx ts-node src/scripts/generate-migration.ts create remove_old_field --template drop-column

# Custom migration
npx ts-node src/scripts/generate-migration.ts create custom_changes --template custom
```

### Available Templates

1. **create-table**: Creates a new table with basic structure
2. **add-column**: Adds a new column to an existing table
3. **modify-column**: Modifies an existing column
4. **drop-column**: Removes a column from a table
5. **custom**: Empty template for custom migrations

### Migration Commands

```bash
# List existing migrations
npx ts-node src/scripts/generate-migration.ts list

# Show template help
npx ts-node src/scripts/generate-migration.ts help-templates

# Run migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Check migration status
npm run migrate:status
```

## Sequelize Models

Models are defined using Sequelize with TypeScript decorators in `src/models/`.

### Example Model

```typescript
import { Table, Column, Model, DataType, HasOne } from 'sequelize-typescript';
import { Profile } from './Profile';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true
})
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true
  })
  email!: string;

  @HasOne(() => Profile, 'user_id')
  profile?: Profile;
}
      nullable: false,
      default: 'CURRENT_TIMESTAMP'
    }
  ];

  indexes: IndexDefinition[] = [
    {
      name: 'idx_products_name',
      columns: ['name']
    }
  ];
}
```

2. Export it in `src/tables/index.ts`:
```typescript
export { ProductTable } from './ProductTable';
```

3. Generate migration:
```bash
npm run migration:generate -- --table products
```

## Migration Commands

### Generate Migrations

```bash
# Generate migration for default table (users)
npm run migration:generate

# Generate migration with custom name
npm run migration:generate create_users_v2

# Generate migration for specific table
npm run migration:generate -- --table products

# Generate migrations for all tables
npm run migration:generate:all

# List available table definitions
npm run migration:list
```

### Run Migrations

```bash
# Run pending migrations
npm run migrate

# Check migration status
npm run migrate:status

# Rollback last migration
npm run migrate:rollback
```

## Development

```bash
# Start development server
npm run dev

# Build project
npm run build

# Start production server
npm start
```

## API Endpoints

### Users

- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (soft delete)

### Example Usage

```bash
# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "securepassword",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Get all users
curl http://localhost:3000/api/users

# Get user by ID
curl http://localhost:3000/api/users/1
```

## Project Structure

```
src/
├── config/           # Configuration and environment validation
├── database/         # Database connection and migrations
│   ├── migrations/   # Generated migration files
│   └── seeds/        # Database seed files
├── models/           # Data models with CRUD operations
├── routes/           # Express route handlers
├── scripts/          # Utility scripts
├── tables/           # Table definition classes
└── index.ts          # Application entry point
```

## Environment Variables

Required environment variables:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_username
DB_PASSWORD=your_password

# Server
PORT=3000
NODE_ENV=development
```

## License

ISC
