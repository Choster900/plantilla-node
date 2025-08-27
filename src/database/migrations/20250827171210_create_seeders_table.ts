import { Migration } from '../migrator';

export const migration: Migration = {
  id: '20250827171210_create_seeders_table',
  description: 'create seeders table',
  up: async (client) => {
    await client.query(`
CREATE TABLE seeders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_seeders_name ON seeders (name);
CREATE INDEX idx_seeders_executed_at ON seeders (executed_at);
    `);
  },
  down: async (client) => {
    await client.query(`
DROP TABLE IF EXISTS seeders;
    `);
  }
};
