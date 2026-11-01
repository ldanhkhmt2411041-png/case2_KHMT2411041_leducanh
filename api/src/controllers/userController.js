const User = require('../models/User');

exports.searchUsers = async (req, res) => {
  try {
    const keyword = req.query.q;
    if (!keyword) {
      return res.status(200).json({ success: true, data: [] });
    }

    const users = await User.find({
      _id: { $ne: req.user.id },
      $or: [
        { fullName: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } }
      ]
    }).select('fullName email avatarUrl');

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('fullName email avatarUrl');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Khong tim thay nguoi dung' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
