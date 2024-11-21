import dbConnect from '../../../../lib/mongodb';
import Washroom from '../../../models/Washroom';
import Activity from '../../../models/Activity';
import User from '../../../models/User';

export default async function handler(req, res) {
  await dbConnect();

  try {
    if (req.method === 'GET') {
      // Fetch all washrooms
      const washrooms = await Washroom.find({});
      res.status(200).json(washrooms);
    } else if (req.method === 'DELETE') {
      const { washroomId } = req.body;

      const session = await Washroom.startSession();
      session.startTransaction();

      try {
        // Remove all activities associated with this washroom
        await Activity.deleteMany({ washroom: washroomId });
        
        // Remove the washroom from any user's assigned washrooms
        await User.updateMany({ assignedWashrooms: washroomId }, { $pull: { assignedWashrooms: washroomId } });
        
        // Finally, delete the washroom itself
        await Washroom.findByIdAndDelete(washroomId);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Washroom deleted successfully' });
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error deleting washroom:', error);
        res.status(500).json({ message: 'Failed to delete washroom' });
      }
    } else {
      res.setHeader('Allow', ['GET', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling washrooms:', error);
    res.status(500).json({ message: 'Failed to handle washrooms' });
  }
}
