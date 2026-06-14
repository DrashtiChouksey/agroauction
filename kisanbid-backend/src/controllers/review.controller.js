const Review = require('../models/Review');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

class ReviewController {
  async submitReview(req, res) {
    try {
      const { toId, rating, comment, cropId, transactionId } = req.body;

      if (toId === req.user.id) {
        return ApiResponse.validationError(res, 'You cannot review yourself');
      }

      // Check if already reviewed for this transaction
      if (transactionId) {
        const existingReview = await Review.findOne({ fromId: req.user.id, transactionId });
        if (existingReview) {
          return ApiResponse.validationError(res, 'You have already reviewed this transaction');
        }
      }

      const toUser = await User.findById(toId);
      if (!toUser) return ApiResponse.notFound(res, 'User to review not found');

      const review = await Review.create({
        fromId: req.user.id,
        fromName: req.user.name,
        fromRole: req.user.role,
        toId,
        toName: toUser.name,
        cropId,
        transactionId,
        rating,
        comment
      });

      // Update user average rating
      const allReviews = await Review.find({ toId });
      const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

      toUser.rating = Number(avgRating.toFixed(1));
      toUser.reviewCount = allReviews.length;
      await toUser.save();

      return ApiResponse.created(res, review, 'Review submitted successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getUserReviews(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const reviews = await Review.find({ toId: req.params.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Review.countDocuments({ toId: req.params.userId });

      return ApiResponse.paginated(res, reviews, total, page, limit);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async editReview(req, res) {
    try {
      const review = await Review.findOne({ _id: req.params.id, fromId: req.user.id });
      if (!review) return ApiResponse.notFound(res, 'Review not found or unauthorized');

      review.rating = req.body.rating || review.rating;
      review.comment = req.body.comment || review.comment;
      await review.save();

      // Update average rating
      const allReviews = await Review.find({ toId: review.toId });
      const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
      
      await User.findByIdAndUpdate(review.toId, { 
        rating: Number(avgRating.toFixed(1))
      });

      return ApiResponse.success(res, review, 'Review updated successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async deleteReview(req, res) {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) return ApiResponse.notFound(res, 'Review not found');

      if (review.fromId.toString() !== req.user.id && req.user.role !== 'admin') {
        return ApiResponse.forbidden(res, 'Not authorized');
      }

      const toId = review.toId;
      await Review.findByIdAndDelete(req.params.id);

      // Update average rating
      const allReviews = await Review.find({ toId });
      const newRating = allReviews.length > 0 
        ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length 
        : 0;
        
      await User.findByIdAndUpdate(toId, { 
        rating: Number(newRating.toFixed(1)),
        reviewCount: allReviews.length
      });

      return ApiResponse.success(res, null, 'Review deleted');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }
}

module.exports = new ReviewController();
