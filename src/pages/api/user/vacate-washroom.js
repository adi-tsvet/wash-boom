const Database = require('better-sqlite3');
const db = new Database('./database.db');

export default function handler(req, res) {
  const { userId, washroomId } = req.body;

  try {
    // Check if the washroom is occupied by this user
    const activity = db.prepare(`
      SELECT * FROM activities 
      WHERE washroom_id = ? AND occupied_by = ? AND end_time IS NULL
    `).get(washroomId, userId);

    if (!activity) {
      return res.status(400).json({ message: 'No active occupation by this user found' });
    }

    // Set the washroom status to vacant and update the activity end time
    db.prepare(`
      UPDATE washrooms SET status = 'vacant' WHERE id = ?
    `).run(washroomId);

    db.prepare(`
      UPDATE activities SET status = 'vacant', end_time = datetime('now')
      WHERE id = ?
    `).run(activity.id);

    res.status(200).json({ message: 'Washroom vacated successfully' });
  } catch (error) {
    console.error('Error vacating washroom:', error);
    res.status(500).json({ message: 'Failed to vacate washroom' });
  }
}
