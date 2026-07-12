const express = require('express');
const router = express.Router();
const {
  getTemples,
  getTempleById,
  createTemple,
  updateTemple,
  deleteTemple,
  addTempleReview,
  addTempleEvent,
  deleteTempleEvent,
  addMaintenanceRequest,
  updateMaintenanceStatus
} = require('../controllers/templeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(getTemples)
  .post(protect, adminOnly, createTemple);

router.route('/:id')
  .get(getTempleById)
  .put(protect, adminOnly, updateTemple)
  .delete(protect, adminOnly, deleteTemple);

router.post('/:id/reviews', protect, addTempleReview);

router.post('/:id/events', protect, adminOnly, addTempleEvent);
router.delete('/:id/events/:eventId', protect, adminOnly, deleteTempleEvent);

router.post('/:id/maintenance', protect, adminOnly, addMaintenanceRequest);
router.put('/:id/maintenance/:maintenanceId', protect, adminOnly, updateMaintenanceStatus);

module.exports = router;
