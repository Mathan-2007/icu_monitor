const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { getAuditLogs, getDashboardStats } = require('../controllers/adminController');

router.use(protect, authorize('admin'));
router.get('/audit-logs', getAuditLogs);
router.get('/stats', getDashboardStats);

module.exports = router;