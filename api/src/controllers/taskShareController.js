const TaskShare = require('../models/TaskShare');
const Task = require('../models/Task');

exports.getShares = async (req, res) => {
  try {
    const shares = await TaskShare.find({ taskId: req.params.id })
      .populate('userId', 'fullName email')
      .populate('sharedBy', 'fullName email');

    res.status(200).json({ success: true, data: shares });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addShare = async (req, res) => {
  try {
    const { userId, permission } = req.body;
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Khong tim thay cong viec' });
    }

    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Chi nguoi tao moi co quyen chia se' });
    }

    const share = await TaskShare.findOneAndUpdate(
      { taskId, userId },
      { permission: permission || 'viewer', sharedBy: req.user.id },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: share });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSharePermission = async (req, res) => {
  try {
    const { shareId } = req.params;
    const { permission } = req.body;

    const share = await TaskShare.findById(shareId);
    if (!share) {
      return res.status(404).json({ success: false, message: 'Khong tim thay ban ghi chia se' });
    }

    share.permission = permission;
    await share.save();

    res.status(200).json({ success: true, data: share });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeShare = async (req, res) => {
  try {
    const { shareId } = req.params;
    const share = await TaskShare.findById(shareId);

    if (!share) {
      return res.status(404).json({ success: false, message: 'Khong tim thay ban ghi chia se' });
    }

    await share.deleteOne();
    res.status(200).json({ success: true, message: 'Thu hoi quyen chia se thanh cong' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
