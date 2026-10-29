const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { analyzePatient, aiHandoverDraft } = require('../controllers/aiController');

router.use(protect, authorize('admin', 'doctor', 'nurse'));
router.post('/analyze/:patientId', analyzePatient);
router.post('/handover-draft', aiHandoverDraft);

module.exports = router;