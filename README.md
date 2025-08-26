# Node.js Project Template

A complete Node.js project template with Express, TypeScript, PostgreSQL, and automatic migration generation.

## Features

- **Express.js** with TypeScript
- **PostgreSQL** database with connection pooling
- **Environment validation** with Joi
- **Database migrations** system
- **Automatic migration generation** from table definitions
- **User authentication** system with bcrypt
- **RESTful API** with CRUD operations
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

2. Generate migrations from table definitions:
```bash
npm run migration:generate
```

3. Run migrations:
```bash
npm run migrate
```

4. Check migration status:
```bash
npm run migrate:status
```

## Table Definitions

This project uses a class-based approach to define database tables. Table definitions are located in `src/tables/`.

### Creating a New Table

1. Create a new file in `src/tables/` (e.g., `ProductTable.ts`):

```typescript
import { BaseTable, ColumnDefinition, IndexDefinition } from '../database/BaseTable';

export class ProductTable extends BaseTable {
  tableName = 'products';

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
      nullable: false
    },
    {
      name: 'price',
      type: 'DECIMAL',
      nullable: false
    },
    {
      name: 'created_at',
      type: 'TIMESTAMP',
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
