const express = require('express');
const router = express.Router();
const { getInsights } = require('../controllers/insightsController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getInsights);

module.exports = router;
