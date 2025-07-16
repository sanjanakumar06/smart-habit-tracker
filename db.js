// db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./habittracker.db');

db.serialize(() => {
  // Enable foreign key constraints
  db.run("PRAGMA foreign_keys = ON;"); // IMPORTANT: This must be run for FKs to work

  // Updated users table with password_hash
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  )`);

  // Updated habits table with category and description
  db.run(`CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    habit_name TEXT NOT NULL,
    category TEXT,          -- New: Optional category for habits
    description TEXT,       -- New: Optional description for habits
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    status INTEGER NOT NULL, -- 0 for missed, 1 for done
    FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE(habit_id, date)
  )`);

  console.log('Database tables ensured to exist.');
});

module.exports = db;
