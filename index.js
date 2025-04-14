const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const blogRoutes = require("./routes/blogRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const tagRoutes = require("./routes/tagRoutes.js");

dotenv.config();

const app = express();

// ----- CORS CONFIGURATION -----
const FRONTEND_URL = process.env.FRONTEND_URL; // Get allowed frontend URL from env

app.use(
  cors({
    origin: [FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);

// ----- MIDDLEWARE -----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ----- ROUTES -----
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", authRoutes);
app.use("/api/tags", tagRoutes);

// ----- PORT & DATABASE -----
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect("https://" + req.headers.host + req.url);
    }
    next();
  });
}
