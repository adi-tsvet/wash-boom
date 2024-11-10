const Database = require('better-sqlite3');
const db = new Database('./database.db');
const bcrypt = require('bcryptjs');

export default async function handler(req, res) {
  const { name, username, password, role } = req.body;
  
  // Set admin_flag based on role
  const admin_flag = role === 'admin' ? 1 : 0;
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Insert user with current timestamp for `date_joined`
    db.prepare(
      'INSERT INTO users (name, username, password, admin_flag) VALUES (?, ?, ?, ?)'
    ).run(name, username, hashedPassword, admin_flag);
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
}
