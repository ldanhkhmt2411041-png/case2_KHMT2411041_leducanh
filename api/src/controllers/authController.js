const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'Email nay da duoc su dung' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    user = await User.create({
      name,
      email,
      password,
      verificationCode,
      verificationCodeExpires
    });

    try {
      await sendEmail({
        email: user.email,
        subject: 'Ma xac thuc tai khoan TaskManager',
        html: `<h3>Xin chao ${user.name},</h3><p>Ma xac thuc dang ky tai khoan cua ban la: <b>${verificationCode}</b> (Co hieu luc trong 10 phut).</p>`
      });
      res.status(201).json({ success: true, message: 'Dang ky thanh cong. Vui long kiem tra email de lay ma kich hoat.' });
    } catch (mailError) {
      res.status(201).json({ 
        success: true, 
        message: 'Dang ky thanh cong (Chua gui duoc mail, ma xac thuc test: ' + verificationCode + ')' 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ 
      email, 
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Ma xac thuc khong dung hoac da het han' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Kich hoat tai khoan thanh cong! Ban co the dang nhap.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Email hoac mat khau khong dung' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Tai khoan chua duoc kich hoat. Vui long xac thuc email.' });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Khong tim thay tai khoan voi email nay' });
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: 'Yeu cau dat lai mat khau TaskManager',
        html: `<h3>Xin chao ${user.name},</h3><p>Ma OTP dat lai mat khau cua ban la: <b>${resetToken}</b> (Het han sau 10 phut).</p>`
      });
      res.status(200).json({ success: true, message: 'Ma xac nhan da duoc gui vao email' });
    } catch (mailError) {
      res.status(200).json({ 
        success: true, 
        message: 'Ma xac nhan dat lai mat khau test: ' + resetToken 
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedCode,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Ma xac nhan khong dung hoac da het han' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Dat lai mat khau thanh cong! Ban co the dang nhap ngay.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Mat khau hien tai khong dung' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Doi mat khau thanh cong' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
