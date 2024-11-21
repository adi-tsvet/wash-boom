import dbConnect from '../../../../lib/mongodb';
import User from '../../../models/User';
import Washroom from '../../../models/Washroom';
import Activity from '../../../models/Activity';

export default async function handler(req, res) {
  const { userId, washroomId, activityType } = req.body;
  console.log("User ID:", userId, "Activity Type:", activityType);

  try {
    await dbConnect();

    // Check if the washroom is currently occupied
    const washroom = await Washroom.findById(washroomId);
    if (!washroom) {
      return res.status(404).json({ message: 'Washroom not found' });
    }

    if (washroom.status === 'occupied') {
      return res.status(400).json({ message: 'Washroom is already occupied' });
    }

    // Update washroom status to 'occupied'
    washroom.status = 'occupied';
    await washroom.save();

    // Insert new activity with the user ID and activity type
    const newActivity = new Activity({
      washroom: washroomId,
      occupiedBy: userId,
      type: activityType,
      status: 'occupied',
      startTime: new Date()
    });

    await newActivity.save();

    res.status(200).json({ message: 'Washroom occupied successfully' });
  } catch (error) {
    console.error('Error occupying washroom:', error);
    res.status(500).json({ message: 'Failed to occupy washroom' });
  }
}
