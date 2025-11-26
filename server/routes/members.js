const express = require('express');
const { body, validationResult } = require('express-validator');
const Member = require('../models/Member');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all members
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status;

    const query = { churchId: req.user.churchId };
    
    if (status && status !== 'all') {
      query.membershipStatus = status;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [members, total] = await Promise.all([
      Member.find(query)
        .populate('userId', 'email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Member.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        data: members,
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

// Get single member
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const member = await Member.findOne({
      _id: req.params.id,
      churchId: req.user.churchId,
    }).populate('userId', 'email');

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found',
      });
    }

    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Create member
router.post('/', [
  authMiddleware,
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('email').optional().isEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: errors.array()[0].msg,
      });
    }

    const member = new Member({
      ...req.body,
      churchId: req.user.churchId,
    });
    await member.save();

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update member
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const member = await Member.findOneAndUpdate(
      { _id: req.params.id, churchId: req.user.churchId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found',
      });
    }

    res.json({
      success: true,
      data: member,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete member
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const member = await Member.findOneAndDelete({
      _id: req.params.id,
      churchId: req.user.churchId,
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found',
      });
    }

    res.json({
      success: true,
      message: 'Member deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

