import { Migration } from '../migrator';

export const migration: Migration = {
  id: '20250827171210_create_users_table',
  description: 'create users table',
  up: async (client) => {
    await client.query(`
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_id INTEGER REFERENCES profiles(id) ON DELETE SET NULL ON UPDATE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  avatar_url VARCHAR(500),
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_email ON users (email);
CREATE UNIQUE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_profile_id ON users (profile_id);
CREATE INDEX idx_users_active ON users (is_active);
CREATE INDEX idx_users_created_at ON users (created_at);
    `);
  },
  down: async (client) => {
    await client.query(`
DROP TABLE IF EXISTS users;
    `);
  }
};
