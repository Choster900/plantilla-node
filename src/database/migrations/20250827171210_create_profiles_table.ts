import { Migration } from '../migrator';

export const migration: Migration = {
  id: '20250827171210_create_profiles_table',
  description: 'create profiles table',
  up: async (client) => {
    await client.query(`
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_profiles_name ON profiles (name);
CREATE INDEX idx_profiles_active ON profiles (is_active);
    `);
  },
  down: async (client) => {
    await client.query(`
DROP TABLE IF EXISTS profiles;
    `);
  }
};
