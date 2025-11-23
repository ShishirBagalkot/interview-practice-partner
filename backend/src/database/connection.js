const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/database/interview.db');

let db = null;

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    // Ensure database directory exists
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Connected to SQLite database');
        runMigrations()
          .then(resolve)
          .catch(reject);
      }
    });
  });
};

const runMigrations = async () => {
  const migrations = [
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      role_id TEXT NOT NULL,
      voice_enabled INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      duration INTEGER,
      score INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS transcripts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      audio_url TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions (id)
    )`,
    `CREATE TABLE IF NOT EXISTS role_templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      difficulty TEXT,
      questions_pool TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      overall_score INTEGER,
      strengths TEXT,
      areas_for_improvement TEXT,
      detailed_feedback TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions (id)
    )`
  ];

  for (const migration of migrations) {
    await new Promise((resolve, reject) => {
      db.run(migration, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  console.log('Database migrations completed');
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

module.exports = {
  initializeDatabase,
  getDb
};
