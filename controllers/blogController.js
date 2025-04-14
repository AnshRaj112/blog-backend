const Blog = require("../models/blog");
const slugify = require("slugify");

// 🛡️ Admin check (mock version or token decoded req.user)
const isAdmin = (req) => {
  return req.headers.authorization === "Bearer admin"; // Change this to your token logic
};

// 📖 Get blogs
const getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 15;
    const skip = (page - 1) * limit;

    const query = { isPublic: true };

    if (req.query.title)
      query.title = { $regex: req.query.title, $options: "i" };

    if (req.query.tag) {
      query.tags = Array.isArray(req.query.tag)
        ? { $in: req.query.tag }
        : req.query.tag;
    }

    const sortField = req.query.sort || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    const blogs = await Blog.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    res.json({ blogs });
  } catch (err) {
    res.status(500).json({ message: "Error fetching blogs", err });
  }
};

// ✍️ Create Blog
const createBlog = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      content,
      tags,
      thumbnail,
      isPublic,
      reactions,
      comments,
    } = req.body;

    const slug = slugify(title, { lower: true, strict: true });

    const blog = new Blog({
      title,
      shortDescription,
      content,
      slug,
      tags,
      thumbnail,
      isPublic: isPublic !== undefined ? isPublic : true,
      reactions: reactions || { heart: 0 },
      comments: comments || [],
    });

    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ message: "Error creating blog", err });
  }
};

// ✏️ Update Blog
const updateBlog = async (req, res) => {
  try {
    const updates = req.body;

    if (updates.title)
      updates.slug = slugify(updates.title, { lower: true, strict: true });

    const blog = await Blog.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json(blog);
  } catch (err) {
    res.status(400).json({ message: "Error updating blog", err });
  }
};

// 🗑️ Delete Blog
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting blog", err });
  }
};

// 👁️ Toggle Visibility
const toggleVisibility = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.isPublic = !blog.isPublic;
    await blog.save();

    res.json(blog);
  } catch (err) {
    res.status(400).json({ message: "Error toggling visibility", err });
  }
};

// ❤️ Toggle Heart Reaction
const toggleHeart = async (req, res) => {
  const { remove } = req.body;
  try {
    const blog = await Blog.findById(req.params.id);
    if (remove) {
      blog.likes -= 1;
      blog.userHasLiked = false;
    } else {
      blog.likes += 1;
      blog.userHasLiked = true;
    }
    await blog.save();
    res
      .status(200)
      .json({ likes: blog.likes, userHasLiked: blog.userHasLiked });
  } catch (error) {
    res.status(500).json({ message: "Error toggling like", error });
  }
};

// 💬 Add Comment
const addComment = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const { body } = req.body;
    if (!body)
      return res.status(400).json({ message: "Comment cannot be empty" });

    blog.comments.push({ body, replies: [] });
    await blog.save();

    res.json(blog.comments);
  } catch (err) {
    res.status(400).json({ message: "Error adding comment", err });
  }
};

// 💬 Add Reply
const addReply = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments[req.params.index];
    if (!comment)
      return res.status(400).json({ message: "Invalid comment index" });

    const { reply } = req.body;
    if (!reply)
      return res.status(400).json({ message: "Reply cannot be empty" });

    comment.replies.push(reply);
    await blog.save();

    res.json(comment.replies);
  } catch (err) {
    res.status(400).json({ message: "Error adding reply", err });
  }
};

// ❌ Delete Comment (Admin Only)
const deleteComment = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res
        .status(403)
        .json({ message: "Only admins can delete comments" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const index = parseInt(req.params.index);
    if (index < 0 || index >= blog.comments.length) {
      return res.status(400).json({ message: "Invalid comment index" });
    }

    blog.comments.splice(index, 1);
    await blog.save();

    res.json(blog.comments);
  } catch (err) {
    res.status(500).json({ message: "Error deleting comment", err });
  }
};

// ❌ Delete Reply (Admin Only)
const deleteReply = async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res
        .status(403)
        .json({ message: "Only admins can delete replies" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const commentIndex = parseInt(req.params.commentIndex);
    const replyIndex = parseInt(req.params.replyIndex);

    const comment = blog.comments[commentIndex];
    if (!comment || replyIndex < 0 || replyIndex >= comment.replies.length) {
      return res
        .status(400)
        .json({ message: "Invalid comment or reply index" });
    }

    comment.replies.splice(replyIndex, 1);
    await blog.save();

    res.json(comment.replies);
  } catch (err) {
    res.status(500).json({ message: "Error deleting reply", err });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: "Error fetching blog", err });
  }
};

module.exports = {
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleVisibility,
  toggleHeart,
  addComment,
  addReply,
  deleteComment,
  deleteReply,
  getBlogById,
};
