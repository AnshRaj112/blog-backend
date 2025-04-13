const express = require('express');
const router = express.Router();
const {
  getBlogs, createBlog, updateBlog, deleteBlog, toggleVisibility,
  toggleHeart, addComment, addReply, deleteComment, deleteReply
} = require('../controllers/blogController.js');

// Basic CRUD
router.get('/', getBlogs);
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);

// Visibility toggle
router.patch('/:id/visibility', toggleVisibility);

// Reactions
router.patch('/:id/reaction', toggleHeart); // body: { remove: true } to undo

// Comments
router.post('/:id/comments', addComment);
router.post('/:id/comments/:index/replies', addReply);

// Admin only
router.delete('/:id/comments/:index', deleteComment);
router.delete('/:id/comments/:commentIndex/replies/:replyIndex', deleteReply);

module.exports = router;
