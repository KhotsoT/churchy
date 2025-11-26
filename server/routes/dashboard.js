const express = require('express');
const mongoose = require('mongoose');
const Member = require('../models/Member');
const Event = require('../models/Event');
const Donation = require('../models/Donation');
const Group = require('../models/Group');
const Attendance = require('../models/Attendance');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const churchId = req.user.churchId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalMembers,
      activeMembers,
      totalDonations,
      monthlyDonations,
      upcomingEvents,
      activeGroups,
    ] = await Promise.all([
      Member.countDocuments({ churchId }),
      Member.countDocuments({ churchId, membershipStatus: 'active' }),
      Donation.aggregate([
        { $match: { churchId: new mongoose.Types.ObjectId(churchId) } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Donation.aggregate([
        {
          $match: {
            churchId: new mongoose.Types.ObjectId(churchId),
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Event.countDocuments({
        churchId,
        startDate: { $gte: now },
      }),
      Group.countDocuments({ churchId, isActive: true }),
    ]);

    // Get recent activity
    const recentMembers = await Member.find({ churchId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName createdAt');

    const recentDonations = await Donation.find({ churchId })
      .populate('donorId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('amount createdAt donorId');

    const recentActivity = [
      ...recentMembers.map((m) => ({
        type: 'member',
        message: `${m.firstName} ${m.lastName} joined`,
        time: m.createdAt,
      })),
      ...recentDonations.map((d) => ({
        type: 'donation',
        message: `Donation of R${d.amount.toLocaleString()} from ${d.donorId?.firstName || 'Anonymous'}`,
        time: d.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        totalDonations: totalDonations[0]?.total || 0,
        monthlyDonations: monthlyDonations[0]?.total || 0,
        upcomingEvents,
        activeGroups,
        recentActivity: recentActivity.map((a) => ({
          ...a,
          time: a.time.toISOString(),
        })),
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

