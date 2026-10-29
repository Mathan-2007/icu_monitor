const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const audit = require('../services/auditService');

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password required');

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw new ApiError(401, 'Invalid credentials');
  if (!user.isActive) throw new ApiError(403, 'Account deactivated');

  user.lastLoginAt = new Date();
  await user.save();
  req.user = user;
  audit.log(req, 'LOGIN', 'User', user._id);

  res.json({ token: generateToken(user._id), user: user.toJSON() });
});

exports.getMe = asyncHandler(async (req, res) => res.json(req.user));