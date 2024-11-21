import dbConnect from '../../../../lib/mongodb';
import User from '../../../models/User';
import Washroom from '../../../models/Washroom';
import Activity from '../../../models/Activity';

export default async function handler(req, res) {
  const { userId } = req.query;

  try {
    await dbConnect();

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Retrieve washrooms assigned to the user, along with current activity and occupancy status
    const user = await User.findById(userId).populate({
      path: 'assignedWashrooms',
      model: 'Washroom',
      populate: {
        path: 'activities',
        model: 'Activity',
        match: { endTime: { $eq: null } }, // Only fetch active (ongoing) activities
        select: 'status occupiedBy', // Select occupancy status and occupant
        populate: {
          path: 'occupiedBy',
          model: 'User',
          select: 'username' // Select the occupant's username
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format assigned washrooms with occupancy details
    const assignedWashrooms = user.assignedWashrooms.map((washroom) => {
      const activeActivity = washroom.activities?.find(activity => !activity.endTime); // Ensure only active activity
      console.log("Active Activity:", activeActivity); // For debugging
      return {
        id: washroom._id.toString(),
        name: washroom.name,
        status: washroom.status,
        occupied_by: activeActivity?.occupiedBy?.username || null
      };
    });

    res.status(200).json(assignedWashrooms);
  } catch (error) {
    console.error('Error fetching assigned washrooms:', error);
    res.status(500).json({ message: 'Failed to fetch assigned washrooms' });
  }
}
