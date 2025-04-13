const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const blogRoutes = require('./routes/blogRoutes.js');
const authRoutes = require('./routes/authRoutes.js');
const tagRoutes = require('./routes/tagRoutes.js');

dotenv.config();

const app = express();

// ----- CORS CONFIGURATION -----
const frontendUrl = process.env.FRONTEND_URL; // Get allowed frontend URL from env

app.use(cors({
  origin: frontendUrl, // Only allow requests from this frontend URL
  credentials: true,
}));

// ----- MIDDLEWARE -----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----- ROUTES -----
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', authRoutes);
app.use('/api/tags', tagRoutes);

// ----- PORT & DATABASE -----
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));
