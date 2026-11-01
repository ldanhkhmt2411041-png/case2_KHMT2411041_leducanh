const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
  try {
    const { status, priority, q, sortBy, order } = req.query;
    let query = {
      $or: [
        { createdBy: req.user.id },
        { assigneeIds: req.user.id }
      ]
    };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (q) {
      query.title = { $regex: q, $options: 'i' };
    }

    let sortOption = { createdAt: -1 };
    if (sortBy) {
      sortOption[sortBy] = order === 'asc' ? 1 : -1;
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'fullName email')
      .populate('assigneeIds', 'fullName email')
      .populate('primaryAssigneeId', 'fullName email')
      .sort(sortOption);

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, assigneeIds, primaryAssigneeId, startDate, dueDate, priority, status } = req.body;

    const task = await Task.create({
      title,
      description,
      createdBy: req.user.id,
      assigneeIds: assigneeIds || [],
      primaryAssigneeId: primaryAssigneeId || null,
      startDate: startDate || null,
      dueDate: dueDate || null,
      priority: priority || 'medium',
      status: status || 'todo'
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'fullName email')
      .populate('assigneeIds', 'fullName email')
      .populate('primaryAssigneeId', 'fullName email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Khong tim thay cong viec' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Khong tim thay cong viec' });
    }

    if (task.createdBy.toString() !== req.user.id && !task.assigneeIds.includes(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Ban khong co quyen chinh sua cong viec nay' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Khong tim thay cong viec' });
    }

    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Chi nguoi tao moi co quyen xoa cong viec nay' });
    }

    await task.deleteOne();
    res.status(200).json({ success: true, message: 'Xoa cong viec thanh cong' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Khong tim thay cong viec' });
    }

    task.status = status;
    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
