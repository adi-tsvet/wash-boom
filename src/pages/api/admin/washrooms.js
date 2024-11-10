const Database = require('better-sqlite3');
const db = new Database('./database.db');

export default function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Fetch all washrooms
      const washrooms = db.prepare('SELECT * FROM washrooms').all();
      res.status(200).json(washrooms);
    } else if (req.method === 'DELETE') {
      // Delete washroom by ID and handle dependencies
      const { washroomId } = req.body;

      db.transaction(() => {
        // Delete from dependent tables (e.g., activities, assigned_washrooms)
        db.prepare('DELETE FROM activities WHERE washroom_id = ?').run(washroomId);
        db.prepare('DELETE FROM assigned_washrooms WHERE washroom_id = ?').run(washroomId);
        db.prepare('DELETE FROM washrooms WHERE id = ?').run(washroomId);
      })();

      res.status(200).json({ message: 'Washroom deleted successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling washrooms:', error);
    res.status(500).json({ message: 'Failed to handle washrooms' });
  }
}
