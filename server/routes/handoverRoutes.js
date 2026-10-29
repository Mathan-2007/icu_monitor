const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { createHandover, getHandovers } = require('../controllers/handoverController');

router.use(protect, authorize('admin', 'nurse', 'doctor'));
router.post('/', createHandover);
router.get('/', getHandovers);

module.exports = router;