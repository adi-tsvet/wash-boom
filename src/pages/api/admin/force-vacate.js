import dbConnect from '../../../../lib/mongodb';
import Washroom from '../../../models/Washroom';
import Activity from '../../../models/Activity';

export default async function handler(req, res) {
  await dbConnect();
  
  const { washroomId } = req.body; // Only the washroom ID is needed for admin override

  try {
    // Find any active activity for the washroom
    const activity = await Activity.findOne({ washroom: washroomId, endTime: null });

    if (!activity) {
      return res.status(400).json({ message: 'No active occupation found for this washroom' });
    }

    // Start a session for atomic operations
    const session = await Activity.startSession();
    session.startTransaction();

    try {
      // Update the washroom's status to 'vacant'
      await Washroom.findByIdAndUpdate(
        washroomId,
        { status: 'vacant' },
        { session }
      );

      // Set end time on the active activity and mark it as vacated
      activity.status = 'vacant';
      activity.endTime = new Date();
      await activity.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({ message: 'Washroom vacated successfully by admin' });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error vacating washroom:', error);
      res.status(500).json({ message: 'Failed to vacate washroom' });
    }
  } catch (error) {
    console.error('Error handling vacate request:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
}
