const { getDb } = require('../database/connection');

class RoleTemplate {
  static getAll() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const sql = `SELECT * FROM role_templates ORDER BY title`;
      
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static getById(roleId) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const sql = `SELECT * FROM role_templates WHERE id = ?`;
      
      db.get(sql, [roleId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static create(id, title, description, difficulty, questionsPool) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const sql = `INSERT INTO role_templates (id, title, description, difficulty, questions_pool) 
                   VALUES (?, ?, ?, ?, ?)`;
      
      db.run(sql, [id, title, description, difficulty, JSON.stringify(questionsPool)], function(err) {
        if (err) reject(err);
        else resolve({ id, title, description, difficulty });
      });
    });
  }
}

module.exports = RoleTemplate;
