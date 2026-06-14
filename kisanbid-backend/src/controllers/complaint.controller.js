const Complaint = require('../models/Complaint');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const notificationService = require('../services/notification.service');
const { getIo } = require('../socket/socket');
const ApiResponse = require('../utils/apiResponse');

class ComplaintController {
  async fileComplaint(req, res) {
    try {
      const { type, severity, accusedId, cropId, bidId, amount, description, evidence } = req.body;

      let accusedName = '';
      if (accusedId) {
        const accusedUser = await User.findById(accusedId);
        if (accusedUser) accusedName = accusedUser.name;
      }

      const complaint = await Complaint.create({
        type,
        severity: severity || 'medium',
        complainantId: req.user.id,
        complainantName: req.user.name,
        accusedId,
        accusedName,
        cropId,
        bidId,
        amount,
        description,
        evidence: evidence || []
      });

      // Notify Admins
      const io = getIo();
      if (io) {
        io.to('admin:room').emit('admin:complaint:new', { complaint });
      }

      return ApiResponse.created(res, complaint, 'Complaint filed successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getAllComplaints(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.type) filter.type = req.query.type;
      if (req.query.severity) filter.severity = req.query.severity;

      const complaints = await Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Complaint.countDocuments(filter);

      return ApiResponse.paginated(res, complaints, total, page, limit);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getMyComplaints(req, res) {
    try {
      const complaints = await Complaint.find({ complainantId: req.user.id }).sort({ createdAt: -1 });
      return ApiResponse.success(res, complaints);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getComplaint(req, res) {
    try {
      const complaint = await Complaint.findById(req.params.id);
      if (!complaint) return ApiResponse.notFound(res, 'Complaint not found');

      if (complaint.complainantId.toString() !== req.user.id && req.user.role !== 'admin') {
        return ApiResponse.forbidden(res, 'Not authorized to view this complaint');
      }

      return ApiResponse.success(res, complaint);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async updateStatus(req, res) {
    try {
      const { status, resolution } = req.body;
      
      const updateData = { status };
      if (['resolved', 'dismissed'].includes(status)) {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = req.user.id;
        if (resolution) updateData.resolution = resolution;
      }

      const complaint = await Complaint.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!complaint) return ApiResponse.notFound(res, 'Complaint not found');

      // Notify the complainant
      await notificationService.sendSystemNotification(
        complaint.complainantId,
        'Complaint Update',
        `Your complaint (${complaint._id.toString().substring(0,6)}) status changed to ${status}.`
      );

      await ActivityLog.create({
        adminId: req.user.id,
        adminName: req.user.name,
        action: 'UPDATE_STATUS',
        targetType: 'complaint',
        targetId: complaint._id,
        targetName: `Complaint ${complaint._id.toString().substring(0,6)}`,
        details: `Status updated to ${status}`,
        severity: 'info'
      });

      return ApiResponse.success(res, complaint, 'Status updated successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async addAdminNote(req, res) {
    try {
      const { note } = req.body;
      const complaint = await Complaint.findByIdAndUpdate(
        req.params.id,
        { adminNote: note },
        { new: true }
      );
      if (!complaint) return ApiResponse.notFound(res, 'Complaint not found');
      return ApiResponse.success(res, complaint, 'Note added successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }
}

module.exports = new ComplaintController();
