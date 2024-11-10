const Database = require('better-sqlite3');
const db = new Database('./database.db');

export default function handler(req, res) {
  const { name } = req.body;

  try {
    db.prepare('INSERT INTO washrooms (name, status) VALUES (?, ?)').run(name, 'vacant');
    res.status(201).json({ message: 'Washroom created successfully' });
  } catch (error) {
    console.error('Error creating washroom:', error);
    res.status(400).json({ message: 'Error creating washroom' });
  }
}
