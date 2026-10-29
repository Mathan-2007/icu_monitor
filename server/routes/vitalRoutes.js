const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { addVitals, getVitals } = require('../controllers/vitalController');

router.use(protect);
router.post('/:patientId', authorize('doctor', 'nurse'), addVitals);
router.get('/:patientId', authorize('admin', 'doctor', 'nurse'), getVitals);

module.exports = router;