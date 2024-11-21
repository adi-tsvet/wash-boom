import dbConnect from '../../../../lib/mongodb';
import User from '../../../models/User';
import Activity from '../../../models/Activity';
import Washroom from '../../../models/Washroom';

export default async function handler(req, res) {
  await dbConnect();

  try {
    if (req.method === 'GET') {
      // Fetch all users
      const users = await User.find({});
      
      res.status(200).json(users);
    } else if (req.method === 'DELETE') {
      const { userId } = req.body;

      // Start handling deletion
      const session = await User.startSession();
      session.startTransaction();

      try {
        // Delete activities and assigned washrooms related to the user
        await Activity.deleteMany({ occupiedBy: userId });
        await Washroom.updateMany({ assignedWashrooms: userId }, { $pull: { assignedWashrooms: userId } });
        
        // Delete the user itself
        await User.findByIdAndDelete(userId);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'User deleted successfully' });
      } catch (deleteError) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error deleting user:', deleteError);
        res.status(500).json({ message: 'Failed to delete user' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling users:', error);
    res.status(500).json({ message: 'Failed to handle users' });
  }
}
