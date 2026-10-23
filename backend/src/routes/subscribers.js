const express = require('express');
const router = express.Router();
const { Subscriber } = require('../models');
const { syncSubscriberToGoogleSheet } = require('../services/googleSheetService');
const authMiddleware = require('../middleware/auth');

/**
 * POST /api/subscribers/notify
 * Subscribe email for future quizzes & course releases + syncs to Google Sheets via Code.gs
 */
router.post('/notify', async (req, res) => {
  try {
    const { email, source, topic } = req.body;

    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanSource = (source || 'Courses Page').trim();
    const cleanTopic = (topic || 'Future Quizzes & Releases').trim();
    const clientIp = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || '127.0.0.1').split(',')[0].trim();

    // 1. Store in Database
    let subscriber = await Subscriber.findOne({
      where: { email: cleanEmail }
    });

    if (subscriber) {
      subscriber.source = cleanSource;
      subscriber.topic = cleanTopic;
      subscriber.ip_address = clientIp;
      await subscriber.save();
    } else {
      subscriber = await Subscriber.create({
        email: cleanEmail,
        source: cleanSource,
        topic: cleanTopic,
        ip_address: clientIp
      });
    }

    // 2. Dispatch to Google Sheet via Google Apps Script (Code.gs)
    const sheetResult = await syncSubscriberToGoogleSheet({
      email: cleanEmail,
      source: cleanSource,
      topic: cleanTopic,
      ip_address: clientIp
    });

    if (sheetResult.synced) {
      subscriber.synced_to_sheet = true;
      subscriber.sheet_sync_error = null;
    } else if (sheetResult.error) {
      subscriber.sheet_sync_error = sheetResult.error;
    }
    await subscriber.save().catch(() => {});

    return res.json({
      success: true,
      message: "You're on the list! We will notify you when new quizzes and tracks release.",
      syncedToSheet: Boolean(sheetResult.synced)
    });
  } catch (err) {
    console.error('Subscription error:', err);
    return res.status(500).json({ error: 'Failed to record subscription. Please try again.' });
  }
});

const requireAdmin = authMiddleware.requireAdmin;

/**
 * GET /api/subscribers
 * Admin endpoint to view list of all notification subscribers
 */
router.get('/', [authMiddleware, requireAdmin], async (req, res) => {
  try {
    const subscribers = await Subscriber.findAll({
      order: [['createdAt', 'DESC']]
    });
    return res.json({
      count: subscribers.length,
      subscribers
    });
  } catch (err) {
    console.error('Fetch subscribers error:', err);
    return res.status(500).json({ error: 'Failed to fetch subscribers.' });
  }
});

module.exports = router;
