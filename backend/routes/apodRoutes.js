const express = require('express');
const {
  getApodForDate,
  getRecentApods
} = require('../controllers/apodController');

const router = express.Router();

router.get('/recent', getRecentApods);
router.get('/', getApodForDate);

module.exports = router;
