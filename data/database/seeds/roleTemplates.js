const { getDb } = require('../../backend/src/database/connection');
const fs = require('fs');
const path = require('path');

async function seedRoleTemplates() {
  const db = getDb();
  
  // Read roles from JSON file
  const rolesPath = path.join(__dirname, '../../shared/constants/roles.json');
  const rolesData = JSON.parse(fs.readFileSync(rolesPath, 'utf8'));
  
  console.log('Seeding role templates...');
  
  for (const role of rolesData) {
    await new Promise((resolve, reject) => {
      const sql = `INSERT OR REPLACE INTO role_templates 
                   (id, title, description, difficulty, questions_pool) 
                   VALUES (?, ?, ?, ?, ?)`;
      
      db.run(sql, [
        role.id,
        role.title,
        role.description,
        role.difficulty,
        JSON.stringify(role.questionsPool)
      ], (err) => {
        if (err) reject(err);
        else {
          console.log(`Seeded: ${role.title}`);
          resolve();
        }
      });
    });
  }
  
  console.log('Role templates seeding completed!');
}

module.exports = { seedRoleTemplates };

// Run if called directly
if (require.main === module) {
  const { initializeDatabase } = require('../../backend/src/database/connection');
  initializeDatabase()
    .then(seedRoleTemplates)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
