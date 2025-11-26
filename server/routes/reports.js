const express = require('express');
const mongoose = require('mongoose');
const Member = require('../models/Member');
const Event = require('../models/Event');
const Donation = require('../models/Donation');
const Attendance = require('../models/Attendance');
const Group = require('../models/Group');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get dashboard stats
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const churchId = req.user.churchId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [members, donations, events, groups, attendance] = await Promise.all([
      Member.aggregate([
        { $match: { churchId: new mongoose.Types.ObjectId(churchId) } },
        { $group: { _id: '$membershipStatus', count: { $sum: 1 } } },
      ]),
      Donation.aggregate([
        { $match: { churchId: new mongoose.Types.ObjectId(churchId), date: { $gte: startOfYear } } },
        { $group: { _id: { month: { $month: '$date' } }, total: { $sum: '$amount' } } },
        { $sort: { '_id.month': 1 } },
      ]),
      Event.countDocuments({ churchId, startDate: { $gte: now } }),
      Group.countDocuments({ churchId, isActive: true }),
      Attendance.aggregate([
        { $match: { churchId: new mongoose.Types.ObjectId(churchId), date: { $gte: startOfMonth } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        members,
        donations,
        upcomingEvents: events,
        activeGroups: groups,
        attendance,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Export members to CSV
router.get('/export/members', authMiddleware, async (req, res) => {
  try {
    const members = await Member.find({ churchId: req.user.churchId })
      .select('firstName lastName email phone membershipStatus joinDate createdAt')
      .lean();

    const csv = [
      'First Name,Last Name,Email,Phone,Status,Join Date,Created At',
      ...members.map(m => 
        `"${m.firstName}","${m.lastName}","${m.email || ''}","${m.phone || ''}","${m.membershipStatus}","${m.joinDate || ''}","${m.createdAt}"`
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=members.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Export donations to CSV
router.get('/export/donations', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { churchId: req.user.churchId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const donations = await Donation.find(query)
      .populate('donorId', 'firstName lastName')
      .select('amount currency date type method fund notes createdAt')
      .lean();

    const csv = [
      'Date,Donor,Amount,Currency,Type,Method,Fund,Notes',
      ...donations.map(d => {
        const donorName = d.donorId ? `${d.donorId.firstName} ${d.donorId.lastName}` : 'Anonymous';
        return `"${new Date(d.date).toISOString().split('T')[0]}","${donorName}",${d.amount},"${d.currency}","${d.type}","${d.method}","${d.fund || ''}","${(d.notes || '').replace(/"/g, '""')}"`;
      }),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=donations.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Export attendance to CSV
router.get('/export/attendance', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, eventId } = req.query;
    const query = { churchId: req.user.churchId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (eventId) query.eventId = eventId;

    const attendance = await Attendance.find(query)
      .populate('memberId', 'firstName lastName')
      .populate('eventId', 'title')
      .select('date status checkedInAt checkedOutAt')
      .lean();

    const csv = [
      'Date,Member,Event,Status,Check-in,Check-out',
      ...attendance.map(a => {
        const memberName = a.memberId ? `${a.memberId.firstName} ${a.memberId.lastName}` : 'Unknown';
        const eventName = a.eventId?.title || 'Unknown';
        return `"${new Date(a.date).toISOString().split('T')[0]}","${memberName}","${eventName}","${a.status}","${a.checkedInAt || ''}","${a.checkedOutAt || ''}"`;
      }),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get yearly giving summary
router.get('/giving-summary', authMiddleware, async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const summary = await Donation.aggregate([
      {
        $match: {
          churchId: new mongoose.Types.ObjectId(req.user.churchId),
          date: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: '$donorId',
          totalAmount: { $sum: '$amount' },
          donationCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'members',
          localField: '_id',
          foreignField: '_id',
          as: 'donor',
        },
      },
      { $unwind: { path: '$donor', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          donorName: {
            $concat: [
              { $ifNull: ['$donor.firstName', 'Anonymous'] },
              ' ',
              { $ifNull: ['$donor.lastName', ''] },
            ],
          },
          totalAmount: 1,
          donationCount: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        year,
        summary,
        grandTotal: summary.reduce((acc, d) => acc + d.totalAmount, 0),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
