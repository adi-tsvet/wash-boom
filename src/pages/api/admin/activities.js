const Database = require('better-sqlite3');
const db = new Database('./database.db');

export default function handler(req, res) {
  try {
    const activities = db.prepare(`
      SELECT 
        a.id, 
        u.username AS occupied_by, 
        w.name AS washroom, 
        a.type, 
        a.status, 
        a.start_time, 
        a.end_time
      FROM activities a
      JOIN users u ON a.occupied_by = u.id
      JOIN washrooms w ON a.washroom_id = w.id
      ORDER BY a.start_time DESC
    `).all();

    res.status(200).json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
}
