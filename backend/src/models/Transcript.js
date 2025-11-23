const { getDb } = require('../database/connection');

class Transcript {
  static add(sessionId, role, content, audioUrl = null) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const sql = `INSERT INTO transcripts (session_id, role, content, audio_url) 
                   VALUES (?, ?, ?, ?)`;
      
      db.run(sql, [sessionId, role, content, audioUrl], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ 
            id: this.lastID, 
            sessionId, 
            role, 
            content, 
            audioUrl 
          });
        }
      });
    });
  }

  static getBySessionId(sessionId) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const sql = `SELECT * FROM transcripts WHERE session_id = ? ORDER BY timestamp ASC`;
      
      db.all(sql, [sessionId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static getLatest(sessionId, limit = 10) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const sql = `SELECT * FROM transcripts 
                   WHERE session_id = ? 
                   ORDER BY timestamp DESC 
                   LIMIT ?`;
      
      db.all(sql, [sessionId, limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows.reverse());
      });
    });
  }
}

module.exports = Transcript;
