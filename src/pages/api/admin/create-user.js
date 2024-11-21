import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  await dbConnect();

  const { name, username, password, role } = req.body;
  const adminFlag = role === 'admin'; // Boolean for admin status

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document
    const newUser = new User({
      name,
      username,
      password: hashedPassword,
      adminFlag,
    });

    // Save the user in the database
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    // Return an error message if, for instance, the username is already taken
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
}
