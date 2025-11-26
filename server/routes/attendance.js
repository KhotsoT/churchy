const express = require('express');
const Attendance = require('../models/Attendance');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get attendance records
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const { eventId, memberId, date } = req.query;
    const query = { churchId: req.user.churchId };

    if (eventId) query.eventId = eventId;
    if (memberId) query.memberId = memberId;
    if (date) query.date = new Date(date);

    const [attendance, total] = await Promise.all([
      Attendance.find(query)
        .populate('memberId', 'firstName lastName')
        .populate('eventId', 'title')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        data: attendance,
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

// Bulk create attendance
router.post('/bulk', authMiddleware, async (req, res) => {
  try {
    const { records } = req.body;
    const attendanceRecords = records.map((record) => ({
      ...record,
      churchId: req.user.churchId,
    }));

    const saved = await Attendance.insertMany(attendanceRecords);
    res.status(201).json({
      success: true,
      data: saved,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get attendance stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().getFullYear(), 0, 1);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const eventId = req.query.eventId;

    const query = {
      churchId: req.user.churchId,
      date: { $gte: startDate, $lte: endDate },
    };

    if (eventId) {
      query.eventId = eventId;
    }

    const [total, present, absent, late] = await Promise.all([
      Attendance.countDocuments(query),
      Attendance.countDocuments({ ...query, status: 'present' }),
      Attendance.countDocuments({ ...query, status: 'absent' }),
      Attendance.countDocuments({ ...query, status: 'late' }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        present,
        absent,
        late,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Create attendance record
router.post('/', authMiddleware, async (req, res) => {
  try {
    const attendance = new Attendance({
      ...req.body,
      churchId: req.user.churchId,
    });
    await attendance.save();

    res.status(201).json({
      success: true,
      data: attendance,
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
    const attendance = await Attendance.findOneAndUpdate(
      { _id: req.params.id, churchId: req.user.churchId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found',
      });
    }

    res.json({
      success: true,
      data: attendance,
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
    const attendance = await Attendance.findOneAndDelete({
      _id: req.params.id,
      churchId: req.user.churchId,
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        error: 'Attendance record not found',
      });
    }

    res.json({
      success: true,
      message: 'Attendance record deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

