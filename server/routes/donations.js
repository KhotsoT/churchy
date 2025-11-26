const express = require('express');
const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all donations
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const donorId = req.query.donorId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const query = { churchId: req.user.churchId };
    
    if (donorId) {
      query.donorId = donorId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const [donations, total] = await Promise.all([
      Donation.find(query)
        .populate('donorId', 'firstName lastName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Donation.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        data: donations,
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

// Get donation stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const [totalResult, monthlyResult, byTypeResult] = await Promise.all([
      Donation.aggregate([
        { $match: { churchId: new mongoose.Types.ObjectId(req.user.churchId) } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Donation.aggregate([
        {
          $match: {
            churchId: new mongoose.Types.ObjectId(req.user.churchId),
            date: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Donation.aggregate([
        { $match: { churchId: new mongoose.Types.ObjectId(req.user.churchId), date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
    ]);

    const byType = {};
    byTypeResult.forEach((item) => {
      byType[item._id] = item.total;
    });

    res.json({
      success: true,
      data: {
        total: totalResult[0]?.total || 0,
        monthly: monthlyResult[0]?.total || 0,
        byType,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get single donation
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const donation = await Donation.findOne({
      _id: req.params.id,
      churchId: req.user.churchId,
    }).populate('donorId', 'firstName lastName');

    if (!donation) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found',
      });
    }

    res.json({
      success: true,
      data: donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Create donation
router.post('/', authMiddleware, async (req, res) => {
  try {
    const donation = new Donation({
      ...req.body,
      churchId: req.user.churchId,
    });
    await donation.save();

    res.status(201).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update donation
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const donation = await Donation.findOneAndUpdate(
      { _id: req.params.id, churchId: req.user.churchId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!donation) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found',
      });
    }

    res.json({
      success: true,
      data: donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete donation
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const donation = await Donation.findOneAndDelete({
      _id: req.params.id,
      churchId: req.user.churchId,
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found',
      });
    }

    res.json({
      success: true,
      message: 'Donation deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

