import dbConnect from '../../../../lib/mongodb';
import Activity from '../../../models/Activity';

export default async function handler(req, res) {
  await dbConnect();

  try {
    // Query to fetch activities with populated user and washroom data
    const activities = await Activity.find()
      .populate('occupiedBy', 'username') // Populate with only the 'username' field from the User model
      .populate('washroom', 'name')       // Populate with only the 'name' field from the Washroom model
      .sort({ startTime: -1 });           // Sort by start time in descending order

    // Format the response to match the original structure
    const formattedActivities = activities.map(activity => ({
      id: activity._id,
      occupied_by: activity.occupiedBy?.username || 'N/A',
      washroom: activity.washroom?.name || 'N/A',
      type: activity.type,
      status: activity.status,
      start_time: activity.startTime,
      end_time: activity.endTime
    }));

    res.status(200).json(formattedActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
}
