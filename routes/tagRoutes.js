const express = require('express');
const { getTags } = require('../controllers/tagController.js');

const router = express.Router();
router.get('/', getTags);

module.exports = router;
