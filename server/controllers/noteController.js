const Note = require('../models/Note');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

exports.addNote = asyncHandler(async (req, res) => {
  const { content, category } = req.body;
  if (!content) throw new ApiError(400, 'Note content required');
  const categoryByRole = req.user.role === 'nurse' ? 'nursing' : 'clinical';
  const note = await Note.create({
    patient: req.params.patientId, author: req.user._id, authorRole: req.user.role,
    category: req.user.role === 'admin' ? category : categoryByRole, content
  });
  res.status(201).json(note);
});

exports.getNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find({ patient: req.params.patientId })
    .populate('author', 'name role').sort({ createdAt: -1 });
  res.json(notes);
});