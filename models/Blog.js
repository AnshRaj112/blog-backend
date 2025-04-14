const mongoose = require("mongoose");
const slugify = require('slugify');

// Schema for replies to comments
const replySchema = new mongoose.Schema({
  body: String,
  user: { type: String, default: "Anonymous" },  // Default user for replies is Anonymous
  createdAt: { type: Date, default: Date.now },
});

// Schema for comments on the blog
const commentSchema = new mongoose.Schema({
  body: { type: String, required: true },
  user: { type: String, default: "Anonymous" },  // Default user is Anonymous
  createdAt: { type: Date, default: Date.now },
  replies: [replySchema],  // Replies to the comment
});

// Blog schema that includes comments
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: String,
  content: { type: String, required: true },
  slug: { type: String, unique: true, lowercase: true, index: true },
  tags: [String],
  thumbnail: String,
  views: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 }
  },
  comments: [commentSchema],  // Array of comments on the blog
});

// Automatically generate a slug for the blog
blogSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
