const Database = require('better-sqlite3');
const db = new Database('./database.db');



export default function handler(req, res) {
  const { userId, washroomId, activityType } = req.body;
  console.log("User ID:", userId, "Activity Type:", activityType);

  try {
    // Check if the washroom is currently occupied
    const isOccupied = db.prepare(`
      SELECT status FROM washrooms WHERE id = ? AND status = 'occupied'
    `).get(washroomId);

    if (isOccupied) {
      return res.status(400).json({ message: 'Washroom is already occupied' });
    }

    // Update washroom status to 'occupied'
    db.prepare(`
      UPDATE washrooms SET status = 'occupied' WHERE id = ?
    `).run(washroomId);

    // Insert new activity with the user ID and activity type
    db.prepare(`
      INSERT INTO activities (washroom_id, occupied_by, type, status, start_time)
      VALUES (?, ?, ?, 'occupied', datetime('now'))
    `).run(washroomId, userId, activityType);


    res.status(200).json({ message: 'Washroom occupied successfully' });
  } catch (error) {
    console.error('Error occupying washroom:', error);
    res.status(500).json({ message: 'Failed to occupy washroom' });
  }
}
