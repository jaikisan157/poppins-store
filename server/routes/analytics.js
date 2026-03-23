const express = require('express');
const router = express.Router();
const PageVisit = require('../models/Analytics');
const { getLocationFromIP } = require('../utils/ipinfo');

// POST /api/analytics/track — track a page visit
router.post('/track', async (req, res) => {
  try {
    const { page, productId, sessionId, utm_source, utm_medium, utm_campaign, referrer, duration, scrollDepth, clicked, purchased } = req.body;

    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const location = await getLocationFromIP(ip);

    const visit = new PageVisit({
      sessionId,
      userId: req.user?._id,
      page,
      productId,
      utm_source: utm_source || 'direct',
      utm_medium: utm_medium || '',
      utm_campaign: utm_campaign || '',
      ip,
      location,
      userAgent: req.headers['user-agent'],
      referrer: referrer || req.headers.referer || '',
      duration,
      scrollDepth,
      clicked,
      purchased,
    });

    await visit.save();
    res.json({ success: true });
  } catch (error) {
    // Don't fail the request if analytics fails
    res.json({ success: true });
  }
});

// POST /api/analytics/update — update engagement metrics
router.post('/update', async (req, res) => {
  try {
    const { sessionId, page, duration, scrollDepth, clicked, purchased } = req.body;

    await PageVisit.findOneAndUpdate(
      { sessionId, page },
      { $set: { duration, scrollDepth, clicked, purchased } },
      { sort: { createdAt: -1 } }
    );

    res.json({ success: true });
  } catch (error) {
    res.json({ success: true });
  }
});

module.exports = router;
