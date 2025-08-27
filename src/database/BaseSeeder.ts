import { sequelize } from './sequelize';
import { QueryTypes } from 'sequelize';

export interface SeederInterface {
  name: string;
  description: string;
  run(): Promise<void>;
}

export abstract class BaseSeeder implements SeederInterface {
  abstract name: string;
  abstract description: string;

  abstract run(): Promise<void>;

  /**
   * Check if this seeder has already been executed
   */
  async hasBeenExecuted(): Promise<boolean> {
    try {
      const results = await sequelize.query(
        'SELECT COUNT(*) as count FROM seeders WHERE name = :name',
        {
          replacements: { name: this.name },
          type: QueryTypes.SELECT
        }
      ) as { count: string }[];
      
      return parseInt(results[0].count) > 0;
    } catch (error) {
      console.error('Error checking seeder execution status:', error);
      return false;
    }
  }

  /**
   * Mark this seeder as executed
   */
  async markAsExecuted(): Promise<void> {
    try {
      await sequelize.query(
        'INSERT INTO seeders (name, description) VALUES (:name, :description)',
        {
          replacements: { 
            name: this.name, 
            description: this.description 
          },
          type: QueryTypes.INSERT
        }
      );
    } catch (error) {
      console.error('Error marking seeder as executed:', error);
      throw error;
    }
  }

  /**
   * Execute the seeder if it hasn't been run before
   */
  async execute(): Promise<boolean> {
    try {
      if (await this.hasBeenExecuted()) {
        console.log(`Seeder "${this.name}" has already been executed, skipping...`);
        return false;
      }

      console.log(`Running seeder: ${this.name} - ${this.description}`);
      await this.run();
      await this.markAsExecuted();
      console.log(`Seeder "${this.name}" completed successfully`);
      return true;
    } catch (error) {
      console.error(`Error executing seeder "${this.name}":`, error);
      throw error;
    }
  }
}
