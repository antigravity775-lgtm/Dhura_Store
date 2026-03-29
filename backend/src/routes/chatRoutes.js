const express = require('express');
const router = express.Router();
const { processChat } = require('../controllers/chatController');

// POST /api/chat
router.post('/', processChat);

module.exports = router;
