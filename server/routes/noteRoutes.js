const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { addNote, getNotes } = require('../controllers/noteController');

router.use(protect, authorize('admin', 'doctor', 'nurse'));
router.post('/:patientId', addNote);
router.get('/:patientId', getNotes);

module.exports = router;