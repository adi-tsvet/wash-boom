const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

// Open the database
const db = new Database('./database.db');

async function createDummyData() {
  try {
    // Define admin and user credentials
    const users = [
      { username: 'admin', password: 'admin123', name: 'Admin User', admin_flag: 1 },
      { username: 'user1', password: 'password1', name: 'User One', admin_flag: 0 },
      { username: 'user2', password: 'password2', name: 'User Two', admin_flag: 0 },
      { username: 'user3', password: 'password3', name: 'User Three', admin_flag: 0 },
      { username: 'user4', password: 'password4', name: 'User Four', admin_flag: 0 },
    ];

    // Define washrooms
    const washrooms = [
      { name: 'Washroom A', status: 'vacant' },
      { name: 'Washroom B', status: 'vacant' },
    ];

    // Create Users
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      db.prepare(
        `INSERT OR IGNORE INTO users (username, password, name, admin_flag, date_joined) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
      ).run(user.username, hashedPassword, user.name, user.admin_flag);
    }
    console.log('Users created successfully!');

    // Create Washrooms
    for (const washroom of washrooms) {
      db.prepare(
        `INSERT OR IGNORE INTO washrooms (name, status) VALUES (?, ?)`
      ).run(washroom.name, washroom.status);
    }
    console.log('Washrooms created successfully!');
    
  } catch (error) {
    console.error('Error creating dummy data:', error);
  } finally {
    db.close(); // Close the database connection
  }
}

// Run the function
createDummyData();
