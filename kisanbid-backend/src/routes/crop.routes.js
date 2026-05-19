const express = require('express');
const router = express.Router();
const cropController = require('../controllers/crop.controller');
const auth = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');
const { farmerOrBuyer } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate');
const { createCropSchema, updateCropSchema } = require('../validators/crop.validator');

// Public read routes
router.get('/', cropController.getAllCrops);
router.get('/trending', cropController.getTrendingCrops);
router.get('/expiring-soon', cropController.getExpiringSoon);
router.get('/:id', cropController.getCrop);
router.get('/:id/bids', cropController.getCropBids);
router.get('/farmer/:farmerId', cropController.getFarmerCrops);

// Protected routes
router.use(auth);

// Farmer only actions
router.post('/', validate(createCropSchema), cropController.createCrop);
router.put('/:id', validate(updateCropSchema), cropController.updateCrop);
router.delete('/:id', cropController.deleteCrop);
router.post('/:id/extend', cropController.extendAuction);
router.post('/:id/mark-sold', cropController.markSold);

// Admin only actions
router.post('/:id/flag', adminOnly, cropController.flagCrop);
router.post('/:id/approve', adminOnly, cropController.approveCrop);

module.exports = router;
