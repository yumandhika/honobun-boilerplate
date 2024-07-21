import { companyBranchTable } from '../schema/company-branch';
import { db } from '..'; 

const seeder = async () => {
  const companyBranches = [
    {
      name: 'Branch 1',
      description: 'Description for Branch 1',
      address: 'Address 1',
      lat: '12.345',
      long: '67.890',
      open_time: '09:00:00',
      close_time: '18:00:00',
      day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      image: 'image1.png',
      // supervisor_id: 'supervisor-id-1',
    },
    // Tambahkan data lainnya di sini
  ];

  try {
    for (const branch of companyBranches) {
      await db.insert(companyBranchTable).values(branch);
    }
    console.log('Seeder completed!');
  } catch (error) {
    console.error('Seeder failed:', error);
  }
};

seeder();
