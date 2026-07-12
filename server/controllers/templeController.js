const Temple = require('../models/Temple');

// @desc    Get all temples
// @route   GET /api/temples
// @access  Public
const getTemples = async (req, res) => {
  const { search, location } = req.query;
  let query = {};
  
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }
  
  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  try {
    const temples = await Temple.find(query);
    res.json({ success: true, data: temples });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single temple by ID
// @route   GET /api/temples/:id
// @access  Public
const getTempleById = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);
    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }
    res.json({ success: true, data: temple });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a temple
// @route   POST /api/temples
// @access  Private/Admin
const createTemple = async (req, res) => {
  const { name, location, description, image, videoBg, deityImage, deityAudio, darshanStartTime, darshanEndTime, amenities } = req.body;

  try {
    const temple = await Temple.create({
      name,
      location,
      description,
      image: image || '',
      videoBg: videoBg || '',
      deityImage: deityImage || '',
      deityAudio: deityAudio || '',
      darshanStartTime,
      darshanEndTime,
      amenities: amenities || []
    });

    res.status(201).json({ success: true, data: temple });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a temple
// @route   PUT /api/temples/:id
// @access  Private/Admin
const updateTemple = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);

    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }

    temple.name = req.body.name || temple.name;
    temple.location = req.body.location || temple.location;
    temple.description = req.body.description !== undefined ? req.body.description : temple.description;
    temple.image = req.body.image !== undefined ? req.body.image : temple.image;
    temple.videoBg = req.body.videoBg !== undefined ? req.body.videoBg : temple.videoBg;
    temple.deityImage = req.body.deityImage !== undefined ? req.body.deityImage : temple.deityImage;
    temple.deityAudio = req.body.deityAudio !== undefined ? req.body.deityAudio : temple.deityAudio;
    temple.darshanStartTime = req.body.darshanStartTime || temple.darshanStartTime;
    temple.darshanEndTime = req.body.darshanEndTime || temple.darshanEndTime;
    temple.amenities = req.body.amenities || temple.amenities;

    const updatedTemple = await temple.save();
    res.json({ success: true, data: updatedTemple });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a temple
// @route   DELETE /api/temples/:id
// @access  Private/Admin
const deleteTemple = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);

    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }

    await temple.deleteOne();
    res.json({ success: true, message: 'Temple removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add review & rating
// @route   POST /api/temples/:id/reviews
// @access  Private
const addTempleReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const temple = await Temple.findById(req.params.id);

    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }

    const alreadyReviewed = temple.ratings.find(
      (r) => r.user && r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      alreadyReviewed.rating = Number(rating);
      alreadyReviewed.comment = comment;
      alreadyReviewed.date = Date.now();
    } else {
      const review = {
        user: req.user._id,
        userName: req.user.name,
        rating: Number(rating),
        comment,
        date: Date.now()
      };
      temple.ratings.push(review);
    }

    if (temple.ratings.length > 0) {
      temple.averageRating =
        temple.ratings.reduce((acc, item) => item.rating + acc, 0) / temple.ratings.length;
    } else {
      temple.averageRating = 0;
    }

    await temple.save();
    res.status(201).json({ success: true, data: temple, message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add an event
// @route   POST /api/temples/:id/events
// @access  Private/Admin
const addTempleEvent = async (req, res) => {
  const { title, date, description } = req.body;

  try {
    const temple = await Temple.findById(req.params.id);

    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }

    temple.events.push({ title, date, description });
    await temple.save();

    res.status(201).json({ success: true, data: temple, message: 'Event added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a temple event
// @route   DELETE /api/temples/:id/events/:eventId
// @access  Private/Admin
const deleteTempleEvent = async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);

    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }

    temple.events = temple.events.filter(e => e._id.toString() !== req.params.eventId);
    await temple.save();

    res.json({ success: true, data: temple, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a maintenance request
// @route   POST /api/temples/:id/maintenance
// @access  Private/Admin
const addMaintenanceRequest = async (req, res) => {
  const { description } = req.body;

  try {
    const temple = await Temple.findById(req.params.id);

    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }

    temple.maintenanceRequests.push({ description, status: 'Pending' });
    await temple.save();

    res.status(201).json({ success: true, data: temple, message: 'Maintenance request logged successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update maintenance request status
// @route   PUT /api/temples/:id/maintenance/:maintenanceId
// @access  Private/Admin
const updateMaintenanceStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const temple = await Temple.findById(req.params.id);

    if (!temple) {
      return res.status(404).json({ success: false, message: 'Temple not found' });
    }

    const request = temple.maintenanceRequests.id(req.params.maintenanceId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    request.status = status;
    await temple.save();

    res.json({ success: true, data: temple, message: 'Maintenance status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
