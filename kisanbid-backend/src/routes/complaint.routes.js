const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaint.controller');
const auth = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');
const { validate } = require('../middleware/validate');
const { fileComplaintSchema } = require('../validators/complaint.validator');

router.use(auth);

router.post('/', validate(fileComplaintSchema), complaintController.fileComplaint);
router.get('/my', complaintController.getMyComplaints);
router.get('/:id', complaintController.getComplaint);

// Admin
router.get('/', adminOnly, complaintController.getAllComplaints);
router.put('/:id/status', adminOnly, complaintController.updateStatus);
router.post('/:id/note', adminOnly, complaintController.addAdminNote);

module.exports = router;
