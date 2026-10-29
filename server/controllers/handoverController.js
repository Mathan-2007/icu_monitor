const ShiftHandover = require('../models/ShiftHandover');
const asyncHandler = require('../utils/asyncHandler');

exports.createHandover = asyncHandler(async (req, res) => {
  const handover = await ShiftHandover.create({ ...req.body, fromNurse: req.user._id });
  res.status(201).json(handover);
});

exports.getHandovers = asyncHandler(async (req, res) => {
  const handovers = await ShiftHandover.find()
    .populate('fromNurse', 'name').populate('toNurse', 'name')
    .sort({ createdAt: -1 }).limit(50);
  res.json(handovers);
});