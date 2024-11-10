const Database = require('better-sqlite3');
const db = new Database('./database.db');

export default function handler(req, res) {
  const { userId, washroomId } = req.body;

  try {
    // Check if the washroom is already assigned to the user
    const existingAssignment = db
      .prepare('SELECT * FROM assigned_washrooms WHERE washroom_id = ? AND user_id = ?')
      .get(washroomId, userId);

    if (existingAssignment) {
      return res.status(400).json({ message: 'Washroom is already assigned to this user' });
    }

    // Insert the new assignment into the assigned_washrooms table
    db.prepare(
      'INSERT INTO assigned_washrooms (washroom_id, user_id) VALUES (?, ?)'
    ).run(washroomId, userId);

    // // Optionally, update the washroom status if it should change when assigned
    // db.prepare('UPDATE washrooms SET status = ? WHERE id = ?').run('occupied', washroomId);

    res.status(201).json({ message: 'Washroom assigned successfully!' });
  } catch (error) {
    console.error('Error assigning washroom:', error);
    res.status(500).json({ message: 'Failed to assign washroom' });
  }
}
