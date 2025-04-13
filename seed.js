const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin.js');

dotenv.config();

const createAdmin = async () => {
  try {
    const username = process.env.ADMIN_USERNAME;
    const plainPassword = process.env.ADMIN_PASSWORD;

    if (!username || !plainPassword) {
      throw new Error("⚠️ ADMIN_USERNAME or ADMIN_PASSWORD not set in .env");
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const admin = await Admin.create({
      username,
      password: hashedPassword,
    });

    console.log('✅ Admin created:', {
      _id: admin._id,
      username: admin.username,
    });

    const allAdmins = await Admin.find().select('-password'); // show admins, exclude passwords
    console.log('📜 All Admins:\n', allAdmins);
  } catch (err) {
    console.error('❌ Error creating admin:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

const connectAndCreateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB');
    await createAdmin();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
};

connectAndCreateAdmin();