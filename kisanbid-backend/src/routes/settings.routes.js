const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const auth = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');

router.get('/', settingsController.getSettings);
router.put('/', auth, adminOnly, settingsController.updateSettings);

module.exports = router;
