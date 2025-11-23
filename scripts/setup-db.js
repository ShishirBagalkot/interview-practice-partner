#!/usr/bin/env node

const { initializeDatabase } = require('../backend/src/database/connection');
const { seedRoleTemplates } = require('../data/database/seeds/roleTemplates');

async function setup() {
  console.log('Setting up database...');
  
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    await seedRoleTemplates();
    console.log('Database setup complete!');
    
    process.exit(0);
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setup();
