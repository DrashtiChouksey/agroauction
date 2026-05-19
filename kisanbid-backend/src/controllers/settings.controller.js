const PlatformSettings = require('../models/PlatformSettings');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/apiResponse');

class SettingsController {
  async getSettings(req, res) {
     try {
       const settings = await PlatformSettings.getSettings();
       return ApiResponse.success(res, settings);
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async updateSettings(req, res) {
     try {
       const settings = await PlatformSettings.findOne();
       if(!settings) {
          await PlatformSettings.create(req.body);
       } else {
          Object.assign(settings, req.body);
          await settings.save();
       }
       
       await ActivityLog.create({
          adminId: req.user.id, adminName: req.user.name,
          action: 'UPDATE_SETTINGS', targetType: 'settings', targetId: 'platform',
          details: 'Platform settings updated', severity: 'warning'
       });
       
       return ApiResponse.success(res, settings, 'Settings updated successfully');
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }
}

module.exports = new SettingsController();
