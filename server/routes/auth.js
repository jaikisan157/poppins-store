const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');
const { getLocationFromIP } = require('../utils/ipinfo');
const rateLimit = require('express-rate-limit');

// Rate limit login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Get UTM params from request body (frontend sends these)
    const { utm_source, utm_medium, utm_campaign } = req.body;

    // Get location from IP
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const location = await getLocationFromIP(ip);

    const user = new User({
      email,
      password,
      name: { first: firstName, last: lastName },
      phone: phone || '',
      source: utm_source || 'direct',
      medium: utm_medium || '',
      campaign: utm_campaign || '',
      location: {
        country: location.country,
        city: location.city,
        region: location.region,
        ip: ip,
        isVpn: location.isVpn,
      },
    });

    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// GET /api/auth/me — get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user' });
  }
});

// PUT /api/auth/profile — update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (firstName) user.name.first = firstName;
    if (lastName) user.name.last = lastName;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// PUT /api/auth/password — change password
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (user.password) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update password' });
  }
});

// POST /api/auth/address — add address
router.post('/address', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses.push(req.body);
    await user.save();
    res.json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add address' });
  }
});

// ==========================================
// Google OAuth
// ==========================================

// GET /api/auth/google — redirect to Google consent screen
router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  
  if (!clientId) {
    return res.status(500).json({ message: 'Google OAuth not configured' });
  }

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('openid email profile')}` +
    `&access_type=offline` +
    `&prompt=consent`;

  res.redirect(authUrl);
});

// GET /api/auth/google/callback — handle Google callback
router.get('/google/callback', async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${clientUrl}/login?error=no_code`);
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();
    if (tokens.error) {
      console.error('Google token error:', tokens);
      return res.redirect(`${clientUrl}/login?error=token_failed`);
    }

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userInfoResponse.json();
    if (!googleUser.email) {
      return res.redirect(`${clientUrl}/login?error=no_email`);
    }

    // Find or create user
    let user = await User.findOne({ email: googleUser.email });

    if (user) {
      // Existing user — link Google ID if not already linked
      if (!user.googleId) {
        user.googleId = googleUser.id;
        if (googleUser.picture && !user.avatar) {
          user.avatar = googleUser.picture;
        }
        await user.save();
      }
    } else {
      // New user — create account
      const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const location = await getLocationFromIP(ip);

      user = new User({
        email: googleUser.email,
        googleId: googleUser.id,
        name: {
          first: googleUser.given_name || googleUser.name?.split(' ')[0] || 'User',
          last: googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || '',
        },
        avatar: googleUser.picture || '',
        source: 'google',
        location: {
          country: location.country,
          city: location.city,
          region: location.region,
          ip: ip,
          isVpn: location.isVpn,
        },
      });
      await user.save();
    }

    // Generate JWT and redirect to frontend
    const token = generateToken(user._id);
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.redirect(`${clientUrl}/login?error=oauth_failed`);
  }
});

module.exports = router;

