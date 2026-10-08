const express = require('express');
const { getHistory, addHistory, clearHistory } = require('../controllers/storageController');

const router = express.Router();

router.get('/', getHistory);
router.post('/', addHistory);
router.delete('/', clearHistory);

module.exports = router;
