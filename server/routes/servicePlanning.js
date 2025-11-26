const express = require('express');
const ServicePlan = require('../models/ServicePlan');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [plans, total] = await Promise.all([
      ServicePlan.find({ churchId: req.user.churchId })
        .populate('assignedRoles.memberId', 'firstName lastName')
        .sort({ serviceDate: -1 })
        .skip(skip)
        .limit(limit),
      ServicePlan.countDocuments({ churchId: req.user.churchId }),
    ]);

    res.json({
      success: true,
      data: {
        data: plans,
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
    const plan = await ServicePlan.findOne({
      _id: req.params.id,
      churchId: req.user.churchId,
    }).populate('assignedRoles.memberId', 'firstName lastName');

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Service plan not found',
      });
    }

    res.json({
      success: true,
      data: plan,
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
    const plan = new ServicePlan({
      ...req.body,
      churchId: req.user.churchId,
    });
    await plan.save();

    res.status(201).json({
      success: true,
      data: plan,
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
    const plan = await ServicePlan.findOneAndUpdate(
      { _id: req.params.id, churchId: req.user.churchId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Service plan not found',
      });
    }

    res.json({
      success: true,
      data: plan,
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
    const plan = await ServicePlan.findOneAndDelete({
      _id: req.params.id,
      churchId: req.user.churchId,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Service plan not found',
      });
    }

    res.json({
      success: true,
      message: 'Service plan deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
