const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { validateBedDeletion, validateBedUpdate } = require('../middleware/bedValidation');
const {
  getBeds,
  getBed,
  getBedStats,
  createBed,
  updateBed,
  deleteBed,
  assignNursesToBed
} = require('../controllers/bedController');

router.use(protect);

// Public read endpoints (available to all authenticated users)
router.get('/', authorize('admin', 'doctor', 'nurse'), getBeds);
router.get('/stats', authorize('admin', 'doctor', 'nurse'), getBedStats);
router.get('/:id', authorize('admin', 'doctor', 'nurse'), getBed);

// Admin-only endpoints
router.post('/', authorize('admin'), createBed);
router.patch('/:id', authorize('admin'), validateBedUpdate, updateBed);
router.delete('/:id', authorize('admin'), validateBedDeletion, deleteBed);

// Assign nurses to bed (admin or doctor)
router.patch('/:id/assign-nurses', authorize('admin', 'doctor'), assignNursesToBed);

module.exports = router;