// Export all seeders
export { profilesSeeder } from './profiles';
export { usersSeeder } from './users';

// Add new seeders here as you create them
// export { productsSeeder } from './products';
// export { ordersSeeder } from './orders';

// Export all seeders as an array for bulk execution
import { profilesSeeder } from './profiles';
import { usersSeeder } from './users';

export const allSeeders = [
  profilesSeeder,
  usersSeeder
];
