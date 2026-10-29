const Bed = require('../models/Bed');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const audit = require('../services/auditService');
const {
  getBeds,
  getBedById,
  createBed,
  updateBed,
  deleteBed,
  getBedStats,
  assignNursesToBed
} = require('../services/bedService');

// Get all beds with optional filtering
exports.getBeds = asyncHandler(async (req, res) => {
  const { status, ward, room, occupied, page = 1, limit = 100 } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  if (ward) filter.ward = ward;
  if (room) filter.room = room;
  if (occupied !== undefined) filter.occupied = occupied === 'true';

  const options = {
    skip: (page - 1) * limit,
    limit: Math.min(limit, 100)
  };

  const beds = await getBeds(filter, options);
  const total = await Bed.countDocuments(filter);

  const response = {
    items: beds,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit)
  };

  res.json(req.query.page || req.query.limit ? response : beds);
});

// Get a single bed by ID
exports.getBed = asyncHandler(async (req, res) => {
  const bed = await getBedById(req.params.id);
  if (!bed) throw new ApiError(404, 'Bed not found');
  res.json(bed);
});

// Get bed statistics
exports.getBedStats = asyncHandler(async (req, res) => {
  const stats = await getBedStats();
  res.json(stats);
});

// Create a new bed
exports.createBed = asyncHandler(async (req, res) => {
  const bed = await createBed(req.body, req.user?._id);
  audit.log(req, 'CREATE_BED', 'Bed', bed._id, `Bed ${bed.bedNumber} created`);
  res.status(201).json(bed);
});

// Update a bed
exports.updateBed = asyncHandler(async (req, res) => {
  const bed = await updateBed(req.params.id, req.body, req.user?._id);
  audit.log(req, 'UPDATE_BED', 'Bed', bed._id, `Bed ${bed.bedNumber} updated`);
  res.json(bed);
});

// Delete a bed
exports.deleteBed = asyncHandler(async (req, res) => {
  const bed = await deleteBed(req.params.id, req.user?._id);
  audit.log(req, 'DELETE_BED', 'Bed', bed._id, `Bed ${bed.bedNumber} deleted`);
  res.json({ message: 'Bed deleted', bed });
});

// Assign nurses to a bed
exports.assignNursesToBed = asyncHandler(async (req, res) => {
  const { bedId } = req.params;
  const { nurseIds } = req.body;
  
  const bed = await assignNursesToBed(bedId, nurseIds, req.user?._id);
  audit.log(req, 'ASSIGN_NURSES_TO_BED', 'Bed', bed._id, `Assigned ${nurseIds.length} nurses to bed ${bed.bedNumber}`);
  res.json(bed);
});