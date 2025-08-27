// Export all seeders
export { ProfilesSeeder } from './profiles';
export { UsersSeeder } from './users';
export { ListsTasksSeeder } from './lists';

// Add new seeders here as you create them
// export { ProductsSeeder } from './products';
// export { OrdersSeeder } from './orders';

// Create instances for export
import { ProfilesSeeder } from './profiles';
import { UsersSeeder } from './users';
import { ListsTasksSeeder } from './lists';

export const profilesSeeder = new ProfilesSeeder();
export const usersSeeder = new UsersSeeder();
export const listsTasksSeeder = new ListsTasksSeeder();

export const allSeeders = [
  profilesSeeder,
  usersSeeder,
  listsTasksSeeder
];
