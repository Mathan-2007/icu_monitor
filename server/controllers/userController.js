const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');
const audit = require('../services/auditService');

const editableFields = ['name', 'email', 'role', 'specialization', 'phone'];
const allowedRoles = ['admin', 'doctor', 'nurse'];
const validId = (id) => mongoose.isValidObjectId(id);

async function protectAdministrator(user, actorId, changes = {}) {
  const removingAdmin = user.role === 'admin' && changes.role && changes.role !== 'admin';
  const disabling = user.isActive && changes.isActive === false;
  if (!removingAdmin && !disabling) return;
  if (String(user._id) === String(actorId)) throw new ApiError(400, 'You cannot deactivate or demote your own account');
  const remaining = await User.countDocuments({ role: 'admin', isActive: true, _id: { $ne: user._id } });
  if (!remaining) throw new ApiError(400, 'The last active administrator cannot be deactivated or demoted');
}

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').populate('assignedPatients', 'name patientId').sort({ name: 1 });
  res.json(users);
});

exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, specialization, phone } = req.body;
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) throw new ApiError(400, 'A valid name and email are required');
  if (!allowedRoles.includes(role)) throw new ApiError(400, 'Role must be admin, doctor, or nurse');
  if (typeof password !== 'string' || password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters');
  const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password, role, specialization, phone });
  await audit.log(req, 'CREATE_USER', 'User', user._id, `Created ${role} account`);
  res.status(201).json(user);
});

exports.updateUser = asyncHandler(async (req, res) => {
  if (!validId(req.params.id)) throw new ApiError(400, 'Invalid user ID');
  const changes = {};
  for (const field of editableFields) if (Object.hasOwn(req.body, field)) changes[field] = req.body[field];
  if (Object.hasOwn(req.body, 'isActive')) {
    if (typeof req.body.isActive !== 'boolean') throw new ApiError(400, 'isActive must be true or false');
    changes.isActive = req.body.isActive;
  }
  if (Object.hasOwn(changes, 'role') && !allowedRoles.includes(changes.role)) throw new ApiError(400, 'Role must be admin, doctor, or nurse');
  if (Object.hasOwn(changes, 'email')) {
    if (typeof changes.email !== 'string' || !/^\S+@\S+\.\S+$/.test(changes.email.trim())) throw new ApiError(400, 'A valid email is required');
    changes.email = changes.email.trim().toLowerCase();
  }
  if (Object.hasOwn(changes, 'name')) changes.name = String(changes.name).trim();
  const current = await User.findById(req.params.id);
  if (!current) throw new ApiError(404, 'User not found');
  await protectAdministrator(current, req.user._id, changes);
  const user = await User.findByIdAndUpdate(req.params.id, { $set: changes }, { new: true, runValidators: true, context: 'query' });
  if (!user) throw new ApiError(404, 'User not found');
  await audit.log(req, 'UPDATE_USER', 'User', user._id, 'Updated account profile or status');
  res.json(user);
});

exports.deactivateUser = asyncHandler(async (req, res) => {
  if (!validId(req.params.id)) throw new ApiError(400, 'Invalid user ID');
  const current = await User.findById(req.params.id);
  if (!current) throw new ApiError(404, 'User not found');
  await protectAdministrator(current, req.user._id, { isActive: false });
  const user = await User.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  await audit.log(req, 'DEACTIVATE_USER', 'User', user._id, 'Deactivated account');
  res.json({ message: 'User deactivated', user });
});
