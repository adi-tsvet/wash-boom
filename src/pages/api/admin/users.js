const Database = require('better-sqlite3');
const db = new Database('./database.db');

export default function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Fetch all users
      const users = db.prepare('SELECT * FROM users').all();
      res.status(200).json(users);
    } else if (req.method === 'DELETE') {
      // Delete user by ID and handle dependencies
      const { userId } = req.body;

      db.transaction(() => {
        // Delete from dependent tables (e.g., activities, user_washrooms)
        db.prepare('DELETE FROM activities WHERE occupied_by = ?').run(userId);
        db.prepare('DELETE FROM assigned_washrooms WHERE user_id = ?').run(userId);
        db.prepare('DELETE FROM users WHERE id = ?').run(userId);
      })();

      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling users:', error);
    res.status(500).json({ message: 'Failed to handle users' });
  }
}
