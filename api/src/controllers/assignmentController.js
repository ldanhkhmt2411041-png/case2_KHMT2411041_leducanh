const Task = require('../models/Task');

exports.getAssignees = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assigneeIds', 'fullName email')
      .populate('primaryAssigneeId', 'fullName email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Khong tim thay cong viec' });
    }

    res.status(200).json({
      success: true,
      primaryAssignee: task.primaryAssigneeId,
      assignees: task.assigneeIds
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addAssignees = async (req, res) => {
  try {
    const { userIds, primaryAssigneeId } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Khong tim thay cong viec' });
    }

    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Chi nguoi tao moi co quyen giao viec' });
    }

    if (userIds && Array.isArray(userIds)) {
      userIds.forEach(uid => {
        if (!task.assigneeIds.includes(uid)) {
          task.assigneeIds.push(uid);
        }
      });
    }

    if (primaryAssigneeId) {
      task.primaryAssigneeId = primaryAssigneeId;
      if (!task.assigneeIds.includes(primaryAssigneeId)) {
        task.assigneeIds.push(primaryAssigneeId);
      }
    }

    await task.save();
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePrimaryAssignee = async (req, res) => {
  try {
    const { userId } = req.params;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Khong tim thay cong viec' });
    }

    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Chi nguoi tao moi co quyen cap nhat' });
    }

    task.primaryAssigneeId = userId;
    if (!task.assigneeIds.includes(userId)) {
      task.assigneeIds.push(userId);
    }

    await task.save();
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeAssignee = async (req, res) => {
  try {
    const { userId } = req.params;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Khong tim thay cong viec' });
    }

    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Chi nguoi tao moi co quyen huy giao viec' });
    }

    task.assigneeIds = task.assigneeIds.filter(id => id.toString() !== userId);
    if (task.primaryAssigneeId && task.primaryAssigneeId.toString() === userId) {
      task.primaryAssigneeId = null;
    }

    await task.save();
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
