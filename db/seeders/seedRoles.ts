import { rolesTable } from '../schema/roles';
import { db } from '..'; 

const seeder = async () => {
  const roles = [
    { name: 'admin' },
    { name: 'superadmin' },
    { name: 'supervisor' },
    { name: 'customer' },
    { name: 'mechanic' },
  ];

  try {
    for (const role of roles) {
      await db.insert(rolesTable).values(role);
    }
    console.log('Roles seeder completed!');
  } catch (error) {
    console.error('Roles seeder failed:', error);
  }
};

seeder();
