// /api/admin/vacate-washroom.js
const Database = require('better-sqlite3');
const db = new Database('./database.db');

export default function handler(req, res) {
  const { washroomId } = req.body; // Only the washroom ID is needed for admin override

  try {
    // Check if the washroom is currently occupied
    const activity = db.prepare(`
      SELECT * FROM activities 
      WHERE washroom_id = ? AND end_time IS NULL
    `).get(washroomId);

    if (!activity) {
      return res.status(400).json({ message: 'No active occupation found for this washroom' });
    }

    // Set the washroom status to vacant and update the activity end time
    db.prepare(`
      UPDATE washrooms SET status = 'vacant' WHERE id = ?
    `).run(washroomId);

    db.prepare(`
      UPDATE activities SET status = 'vacant', end_time = datetime('now')
      WHERE id = ?
    `).run(activity.id);

    res.status(200).json({ message: 'Washroom vacated successfully by admin' });
  } catch (error) {
    console.error('Error vacating washroom:', error);
    res.status(500).json({ message: 'Failed to vacate washroom' });
  }
}
