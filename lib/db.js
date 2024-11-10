const Database = require('better-sqlite3');
const path = require('path');

// Use absolute path to ensure correct database path
const dbPath = path.resolve(__dirname, '../database.db');
const db = new Database(dbPath);

function initializeDB() {
  db.exec(`


    -- Drop existing tables if they exist
    DROP TABLE IF EXISTS activities;
    DROP TABLE IF EXISTS assigned_washrooms;
    DROP TABLE IF EXISTS washrooms;
    DROP TABLE IF EXISTS users;

    -- Create Users Table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_flag BOOLEAN NOT NULL DEFAULT 0,  -- true/false to indicate admin
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      date_joined TEXT DEFAULT CURRENT_TIMESTAMP  -- Record when user joined
    );

    -- Create Washrooms Table
    CREATE TABLE IF NOT EXISTS washrooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      status TEXT CHECK(status IN ('occupied', 'vacant')) DEFAULT 'vacant'
    );

    -- Many-to-many relationship table for assigning users to washrooms
    CREATE TABLE IF NOT EXISTS assigned_washrooms (
      washroom_id INTEGER,
      user_id INTEGER,
      PRIMARY KEY (washroom_id, user_id),
      FOREIGN KEY (washroom_id) REFERENCES washrooms(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Create Activity Table for tracking usage
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      occupied_by INTEGER,  -- References user_id of user occupying
      type TEXT NOT NULL,  -- Activity type
      washroom_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('occupied', 'vacant')) DEFAULT 'vacant',
      start_time TEXT DEFAULT CURRENT_TIMESTAMP,
      end_time TEXT,
      FOREIGN KEY (occupied_by) REFERENCES users(id),
      FOREIGN KEY (washroom_id) REFERENCES washrooms(id)
    );
  `);

  console.log('Database initialized with updated schema!');
}

module.exports = { initializeDB };
// Execute with: node -e "require('./lib/db').initializeDB()"
