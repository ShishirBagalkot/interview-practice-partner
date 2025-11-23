#!/usr/bin/env node

const { seedRoleTemplates } = require('../data/database/seeds/roleTemplates');
const { initializeDatabase } = require('../backend/src/database/connection');

async function seed() {
  console.log('Seeding database...');
  
  try {
    await initializeDatabase();
    await seedRoleTemplates();
    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
