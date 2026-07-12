const express = require('express');
const router = express.Router();
const { getDashboardAnalytics, getUsers, updateUser, deleteUser } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/analytics', protect, adminOnly, getDashboardAnalytics);

router.route('/users')
  .get(protect, adminOnly, getUsers);

router.route('/users/:id')
  .put(protect, adminOnly, updateUser)
  .delete(protect, adminOnly, deleteUser);

module.exports = router;
