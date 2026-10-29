const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { createUser, getUsers, updateUser, deactivateUser } = require('../controllers/userController');

router.use(protect, authorize('admin'));
router.route('/').get(getUsers).post(createUser);
router.route('/:id').patch(updateUser).delete(deactivateUser);

module.exports = router;