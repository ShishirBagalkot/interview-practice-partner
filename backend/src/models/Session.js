const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/connection');

class Session {
  static create(roleId, voiceEnabled = false) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const sessionId = uuidv4();
      
      const sql = `INSERT INTO sessions (id, role_id, voice_enabled) VALUES (?, ?, ?)`;
      
      db.run(sql, [sessionId, roleId, voiceEnabled ? 1 : 0], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ sessionId, roleId, voiceEnabled });
        }
      });
    });
  }

  static getById(sessionId) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const sql = `SELECT * FROM sessions WHERE id = ?`;
      
      db.get(sql, [sessionId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static end(sessionId, score = null) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const sql = `UPDATE sessions 
                   SET ended_at = CURRENT_TIMESTAMP, 
                       duration = (julianday(CURRENT_TIMESTAMP) - julianday(created_at)) * 1440,
                       score = ?
                   WHERE id = ?`;
      
      db.run(sql, [score, sessionId], function(err) {
        if (err) reject(err);
        else resolve({ sessionId, score });
      });
    });
  }

  static getAll() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const sql = `SELECT s.*, rt.title as role_title 
                   FROM sessions s
                   LEFT JOIN role_templates rt ON s.role_id = rt.id
                   ORDER BY s.created_at DESC`;
      
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = Session;
