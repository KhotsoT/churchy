const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const Member = require('../models/Member');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all messages (inbox)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const type = req.query.type; // inbox, sent, announcements

    let query = { churchId: req.user.churchId };

    if (type === 'sent') {
      query.senderId = req.user._id;
    } else if (type === 'announcements') {
      query.isAnnouncement = true;
    } else {
      // Inbox - messages sent to this user
      query.$or = [
        { recipientIds: req.user._id },
        { isAnnouncement: true },
      ];
    }

    const [messages, total] = await Promise.all([
      Message.find(query)
        .populate('senderId', 'firstName lastName email')
        .populate('recipientIds', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments(query),
    ]);

    // Add isRead flag
    const messagesWithReadStatus = messages.map(msg => ({
      ...msg.toObject(),
      id: msg._id,
      isRead: msg.readBy.some(id => id.equals(req.user._id)),
    }));

    res.json({
      success: true,
      data: {
        data: messagesWithReadStatus,
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

// Get single message
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      churchId: req.user.churchId,
    })
      .populate('senderId', 'firstName lastName email')
      .populate('recipientIds', 'firstName lastName email');

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      });
    }

    // Mark as read
    if (!message.readBy.includes(req.user._id)) {
      message.readBy.push(req.user._id);
      await message.save();
    }

    res.json({
      success: true,
      data: {
        ...message.toObject(),
        id: message._id,
        isRead: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Send message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { recipientIds, subject, body, type, priority, isAnnouncement } = req.body;

    const message = new Message({
      churchId: req.user.churchId,
      senderId: req.user._id,
      recipientIds: isAnnouncement ? [] : recipientIds,
      subject,
      body,
      type: type || 'in_app',
      priority: priority || 'medium',
      isAnnouncement: isAnnouncement || false,
      readBy: [req.user._id], // Sender has read it
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'firstName lastName email')
      .populate('recipientIds', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: {
        ...populatedMessage.toObject(),
        id: populatedMessage._id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Mark message as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      churchId: req.user.churchId,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
      });
    }

    if (!message.readBy.includes(req.user._id)) {
      message.readBy.push(req.user._id);
      await message.save();
    }

    res.json({
      success: true,
      message: 'Message marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Delete message
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      churchId: req.user.churchId,
      senderId: req.user._id, // Can only delete own messages
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found or you do not have permission to delete it',
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get recipients (members who are also users)
router.get('/recipients/list', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ churchId: req.user.churchId })
      .select('firstName lastName email role')
      .sort({ firstName: 1 });

    res.json({
      success: true,
      data: users.map(u => ({
        id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
