const Database = require('better-sqlite3');
const db = new Database('./database.db');

export default function handler(req, res) {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Retrieve assigned washrooms with current occupancy status and occupant's name
    const assignedWashrooms = db.prepare(`
      SELECT 
        w.id, 
        w.name, 
        w.status,
        CASE 
          WHEN a.status = 'occupied' THEN u2.username 
          ELSE NULL 
        END AS occupied_by -- Use name instead of ID
      FROM washrooms w
      JOIN assigned_washrooms aw ON w.id = aw.washroom_id
      LEFT JOIN activities a ON w.id = a.washroom_id AND a.end_time IS NULL -- only current active records
      LEFT JOIN users u2 ON a.occupied_by = u2.id -- get the name of the occupant
      WHERE aw.user_id = ?
    `).all(userId);
    console.log(assignedWashrooms)
    res.status(200).json(assignedWashrooms);
  } catch (error) {
    console.error('Error fetching assigned washrooms:', error);
    res.status(500).json({ message: 'Failed to fetch assigned washrooms' });
  }
}
