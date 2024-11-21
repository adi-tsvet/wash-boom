import dbConnect from '../../../../lib/mongodb';
import Washroom from '../../../models/Washroom';

export default async function handler(req, res) {
  await dbConnect();

  const { name } = req.body;

  try {
    // Create a new washroom with a default status of 'vacant'
    const newWashroom = new Washroom({ name, status: 'vacant' });
    await newWashroom.save();

    res.status(201).json({ message: 'Washroom created successfully' });
  } catch (error) {
    console.error('Error creating washroom:', error);
    // Handle duplicate name error or other issues
    res.status(400).json({ message: 'Error creating washroom', error: error.message });
  }
}
