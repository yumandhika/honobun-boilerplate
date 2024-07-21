import { db } from '..'; 
import { v4 as uuidv4 } from 'uuid';
import { provincesTable } from '../schema/provinces';
import { citiesTable } from '../schema/cities';
import { districtsTable } from '../schema/districts';

const seeder = async () => {

  const provinces = [
    { id: uuidv4(), name: 'Province A' },
    { id: uuidv4(), name: 'Province B' },
  ];

  for (const province of provinces) {
    await db.insert(provincesTable).values(province);
  }

  // Seed cities
  const cities = [
    { id: uuidv4(), name: 'City A1', province_id: provinces[0].id },
    { id: uuidv4(), name: 'City A2', province_id: provinces[0].id },
    { id: uuidv4(), name: 'City B1', province_id: provinces[1].id },
  ];

  for (const city of cities) {
    await db.insert(citiesTable).values(city);
  }

  // Seed districts
  const districts = [
    { id: uuidv4(), name: 'District A1-1', city_id: cities[0].id },
    { id: uuidv4(), name: 'District A1-2', city_id: cities[0].id },
    { id: uuidv4(), name: 'District B1-1', city_id: cities[2].id },
  ];

  for (const district of districts) {
    await db.insert(districtsTable).values(district);
  }
};

seeder();
