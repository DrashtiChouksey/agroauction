const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);

router.post('/', reviewController.submitReview);
router.get('/user/:userId', reviewController.getUserReviews);
router.put('/:id', reviewController.editReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
