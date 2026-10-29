const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getAlerts, acknowledgeAlert, resolveAlert } = require('../controllers/alertController');

router.use(protect, authorize('admin', 'doctor', 'nurse'));
router.get('/', getAlerts);
router.patch('/:id/ack', acknowledgeAlert);
router.patch('/:id/resolve', authorize('doctor'), resolveAlert);

module.exports = router;