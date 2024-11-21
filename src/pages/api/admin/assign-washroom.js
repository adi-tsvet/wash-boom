import dbConnect from '../../../../lib/mongodb';
import User from '../../../models/User';
import Washroom from '../../../models/Washroom';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await dbConnect();

  const { userId, washroomId } = req.body;
  console.log(userId, washroomId )

  try {
    // Validate ObjectId format for userId and washroomId
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(washroomId)) {
      return res.status(400).json({ message: 'Invalid user or washroom ID format' });
    }

    // Find user and washroom documents by their ObjectIds
    const user = await User.findById(userId);
    const washroom = await Washroom.findById(washroomId);

    if (!user) {
      console.error(`User with ID ${userId} not found.`);
      return res.status(404).json({ message: 'User not found' });
    }
    if (!washroom) {
      console.error(`Washroom with ID ${washroomId} not found.`);
      return res.status(404).json({ message: 'Washroom not found' });
    }

    // Check if washroom is already assigned to the user
    const isAlreadyAssigned = user.assignedWashrooms.some(
      (assignedId) => assignedId.toString() === washroomId
    );
    if (isAlreadyAssigned) {
      console.warn(`Washroom with ID ${washroomId} is already assigned to user ${userId}.`);
      return res.status(400).json({ message: 'Washroom is already assigned to this user' });
    }

    // Assign washroom to the user and save
    user.assignedWashrooms.push(washroomId);
    const updatedUser = await user.save();

    // Verify if washroom was successfully assigned
    const hasAssignedWashroom = updatedUser.assignedWashrooms.includes(washroomId);
    if (!hasAssignedWashroom) {
      console.error('Failed to add washroom to user’s assigned washrooms.');
      return res.status(500).json({ message: 'Failed to assign washroom' });
    }

    res.status(201).json({ message: 'Washroom assigned successfully!' });
  } catch (error) {
    console.error('Error assigning washroom:', error);
    res.status(500).json({ message: 'Failed to assign washroom' });
  }
}
