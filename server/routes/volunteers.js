const express = require('express');
const Volunteer = require('../models/Volunteer');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [volunteers, total] = await Promise.all([
      Volunteer.find({ churchId: req.user.churchId })
        .populate('memberId', 'firstName lastName')
        .populate('ministryId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Volunteer.countDocuments({ churchId: req.user.churchId }),
    ]);

    res.json({
      success: true,
      data: {
        data: volunteers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOne({
      _id: req.params.id,
      churchId: req.user.churchId,
    })
      .populate('memberId', 'firstName lastName')
      .populate('ministryId', 'name');

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        error: 'Volunteer not found',
      });
    }

    res.json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const volunteer = new Volunteer({
      ...req.body,
      churchId: req.user.churchId,
    });
    await volunteer.save();

    res.status(201).json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOneAndUpdate(
      { _id: req.params.id, churchId: req.user.churchId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        error: 'Volunteer not found',
      });
    }

    res.json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const volunteer = await Volunteer.findOneAndDelete({
      _id: req.params.id,
      churchId: req.user.churchId,
    });

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        error: 'Volunteer not found',
      });
    }

    res.json({
      success: true,
      message: 'Volunteer removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
