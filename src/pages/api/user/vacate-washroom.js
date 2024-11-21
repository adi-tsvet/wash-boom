import dbConnect from '../../../../lib/mongodb';
import User from '../../../models/User';
import Washroom from '../../../models/Washroom';
import Activity from '../../../models/Activity';

export default async function handler(req, res) {
  const { userId, washroomId } = req.body;

  try {
    await dbConnect();

    // Check if the washroom is currently occupied by this user
    const activeActivity = await Activity.findOne({
      washroom: washroomId,
      occupiedBy: userId,
      endTime: null,  // Only find ongoing activities
    });

    if (!activeActivity) {
      return res.status(400).json({ message: 'No active occupation by this user found' });
    }

    // Update the washroom's status to 'vacant'
    await Washroom.findByIdAndUpdate(washroomId, { status: 'vacant' });

    // Update the activity's status to 'vacant' and set the end time
    activeActivity.status = 'vacant';
    activeActivity.endTime = new Date();
    await activeActivity.save();

    res.status(200).json({ message: 'Washroom vacated successfully' });
  } catch (error) {
    console.error('Error vacating washroom:', error);
    res.status(500).json({ message: 'Failed to vacate washroom' });
  }
}
