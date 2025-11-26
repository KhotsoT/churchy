const express = require('express');
const PrayerRequest = require('../models/PrayerRequest');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const query = { churchId: req.user.churchId };
    if (status) {
      query.status = status;
    }

    const [requests, total] = await Promise.all([
      PrayerRequest.find(query)
        .populate('requesterId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PrayerRequest.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        data: requests,
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
    const request = await PrayerRequest.findOne({
      _id: req.params.id,
      churchId: req.user.churchId,
    }).populate('requesterId', 'firstName lastName');

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Prayer request not found',
      });
    }

    res.json({
      success: true,
      data: request,
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
    const prayerRequest = new PrayerRequest({
      ...req.body,
      requesterId: req.body.requesterId || req.user._id,
      churchId: req.user.churchId,
    });
    await prayerRequest.save();

    res.status(201).json({
      success: true,
      data: prayerRequest,
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
    const prayerRequest = await PrayerRequest.findOneAndUpdate(
      { _id: req.params.id, churchId: req.user.churchId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!prayerRequest) {
      return res.status(404).json({
        success: false,
        error: 'Prayer request not found',
      });
    }

    res.json({
      success: true,
      data: prayerRequest,
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
    const prayerRequest = await PrayerRequest.findOneAndDelete({
      _id: req.params.id,
      churchId: req.user.churchId,
    });

    if (!prayerRequest) {
      return res.status(404).json({
        success: false,
        error: 'Prayer request not found',
      });
    }

    res.json({
      success: true,
      message: 'Prayer request deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
