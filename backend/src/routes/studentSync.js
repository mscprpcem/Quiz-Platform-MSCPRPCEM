const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { sequelize, User, Admin, QuizAttempt, Participant } = require('../models');
const { exchangeCodeForTokens, generateSubjectId } = require('../services/ssoProvider');
const { sendOtpEmail } = require('../services/emailService');
let axios;
try {
  axios = require('axios');
} catch (e) {
  axios = {
    get: async (url, config) => {
      try {
        if (typeof fetch !== 'undefined') {
          const res = await fetch(url, {
            method: 'GET',
            headers: config?.headers || {}
          });
          const json = await res.json().catch(() => ({}));
          return { data: json, status: res.status };
        }
      } catch (err) {}
      return { data: {} };
    },
    post: async (url, data, config) => {
      try {
        if (typeof fetch !== 'undefined') {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(config?.headers || {}) },
            body: JSON.stringify(data)
          });
          const json = await res.json().catch(() => ({}));
          return { data: json, status: res.status };
        }
      } catch (err) {}
      return { data: {} };
    }
  };
}

// In-memory student certificates cache
let studentCertificates = [];

// In-memory OTP storage for registration and verification flows
const otpStore = new Map();

// Helper to normalize email
const normalizeEmail = (email) => (email ? String(email).toLowerCase().trim() : '');

// Helper to check if an email belongs to an administrator
const isAdministratorEmail = async (email) => {
  if (!email) return false;
  const clean = normalizeEmail(email);
  if (clean.endsWith('.edu') || clean.includes('.edu')) return false;
  const configuredAdmin = (process.env.ADMIN_EMAIL || 'admin@mscprpcem.tech').toLowerCase().trim();
  if (configuredAdmin && clean === configuredAdmin) return true;
  if (Admin) {
    const admin = await Admin.findOne({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { email: clean },
              ...(sequelize ? [sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), clean)] : [])
            ]
          },
          {
            email: { [Op.notLike]: '%.edu%' }
          }
        ]
      }
    });
    if (admin) return true;
  }
  return false;
};

// Helper to normalize and sanitize Verification Portal URL defensively
const getVerificationPortalUrl = () => {
  let url = (process.env.VERIFICATION_BACKEND_URL || process.env.VERIFICATION_PORTAL_URL || 'https://msc-cert-verification-bkdgfwa0fkcbgyhm.centralindia-01.azurewebsites.net').trim();
  if (url === 'https://verify.mscprpcem.tech' || url === 'http://verify.mscprpcem.tech') {
    url = 'https://msc-cert-verification-bkdgfwa0fkcbgyhm.centralindia-01.azurewebsites.net';
  }
  if (url.startsWith('ttps://')) {
    url = 'h' + url;
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url.replace(/^\/+/, '');
  }
  return url.replace(/\/+$/, '');
};

// =======================
// Username Availability Check (Local DB + Verification Portal Fallback)
// =======================
router.get('/check-username', async (req, res) => {
  try {
    const rawUsername = req.query.username;
    const clean = (rawUsername || '').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (!clean || clean.length < 3) {
      return res.status(400).json({ available: false, error: 'Username handle must be at least 3 characters.' });
    }
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(clean)) {
      return res.status(400).json({ available: false, error: 'Only letters, numbers, underscores, or hyphens allowed.' });
    }

    // Check local database first
    if (User) {
      const existingUser = await User.findOne({ where: { username: clean } });
      if (existingUser) {
        return res.json({ available: false, error: 'Username handle is already taken.' });
      }
    }

    const verificationPortalUrl = getVerificationPortalUrl();
    try {
      if (axios && typeof axios.get === 'function') {
        const checkRes = await axios.get(`${verificationPortalUrl}/api/auth/check-username?username=${encodeURIComponent(clean)}`, { timeout: 4000 });
        if (checkRes.data && checkRes.data.available !== undefined) {
          return res.json(checkRes.data);
        }
      }
    } catch (e) {
      if (e.response && e.response.data && e.response.data.available !== undefined) {
        return res.json(e.response.data);
      }
    }

    return res.json({ available: true, message: 'Username handle is available!' });
  } catch (err) {
    console.error('Check username error:', err);
    return res.json({ available: true, message: 'Username handle is available!' });
  }
});

// =======================
// Search Student Profile on Local DB & Verification Portal
// =======================
router.get('/search-profile', async (req, res) => {
  try {
    const rawQuery = req.query.q || req.query.query || req.query.username || '';
    const clean = rawQuery.trim().replace(/^@+/, '');
    if (!clean) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    const verificationPortalUrl = getVerificationPortalUrl();
    let localMatches = [];

    if (User) {
      const users = await User.findAll({
        where: {
          [Op.or]: [
            { username: { [Op.like]: `%${clean}%` } },
            { name: { [Op.like]: `%${clean}%` } },
            { email: { [Op.like]: `%${clean}%` } }
          ]
        },
        attributes: ['id', 'name', 'username', 'email', 'avatar', 'createdAt'],
        limit: 10
      });

      localMatches = users.map(u => ({
        name: u.name,
        username: u.username || u.email.split('@')[0],
        email: u.email,
        profile_url: `${verificationPortalUrl}/u/${encodeURIComponent(u.username || u.email.split('@')[0])}`,
        direct_url: `${verificationPortalUrl}/u/${encodeURIComponent(u.username || u.email.split('@')[0])}`
      }));
    }

    // Try Verification portal search if available
    let remoteMatches = [];
    try {
      if (axios && typeof axios.get === 'function') {
        const remoteRes = await axios.get(`${verificationPortalUrl}/api/users/search?q=${encodeURIComponent(clean)}`, { timeout: 4000 });
        if (remoteRes.data && Array.isArray(remoteRes.data.users)) {
          remoteMatches = remoteRes.data.users;
        } else if (Array.isArray(remoteRes.data)) {
          remoteMatches = remoteRes.data;
        }
      }
    } catch (e) {}

    const directProfileUrl = `${verificationPortalUrl}/u/${encodeURIComponent(clean.toLowerCase())}`;

    return res.json({
      success: true,
      query: clean,
      direct_profile_url: directProfileUrl,
      local_results: localMatches,
      remote_results: remoteMatches,
      results_count: localMatches.length + remoteMatches.length
    });
  } catch (err) {
    console.error('Search profile error:', err);
    return res.status(500).json({ error: 'Failed to search student profiles: ' + err.message });
  }
});

// =======================
// OTP Verification Routes (Local DB + Verification Portal)
// =======================
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name, username, type } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // Check if email belongs to an administrator
    if (await isAdministratorEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Unable to process verification code for this email. Please check your credentials or contact support.' });
    }

    let localUser = null;
    if (User) {
      localUser = await User.findOne({ where: { email: cleanEmail } });
    }

    const targetOtp = crypto.randomInt(100000, 1000000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // Store in memory cache
    otpStore.set(cleanEmail, {
      otp: targetOtp,
      name: name || localUser?.name,
      username: username || localUser?.username,
      expiry: Date.now() + 15 * 60 * 1000,
      type: type || 'verification'
    });

    if (localUser) {
      localUser.otp = targetOtp;
      localUser.otp_expiry = expiry;
      await localUser.save().catch(() => {});
    }

    // Send real OTP email via Nodemailer
    try {
      await sendOtpEmail({
        to: cleanEmail,
        name: name || localUser?.name,
        otp: targetOtp,
        type: type || 'login'
      });
    } catch (mailErr) {
      console.warn('Direct email dispatch notice:', mailErr.message);
    }

    const verificationPortalUrl = getVerificationPortalUrl();
    try {
      if (axios && typeof axios.post === 'function') {
        const response = await axios.post(`${verificationPortalUrl}/api/auth/send-otp`, {
          email: cleanEmail,
          purpose: type || 'login'
        }, { timeout: 4000 });

        if (response.data && response.data.success) {
          return res.json(response.data);
        }
      }
    } catch (portalErr) {
      console.warn('Portal send OTP notice:', portalErr.message);
    }

    return res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ error: 'Failed to send verification code.' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = normalizeEmail(email);
    const inputOtp = otp ? String(otp).trim().replace(/[^0-9]/g, '') : '';

    if (!cleanEmail || !inputOtp) {
      return res.status(400).json({ error: 'Email address and 6-digit OTP code are required.' });
    }

    let isValid = false;

    // 1. Check in-memory store
    const memoryRecord = otpStore.get(cleanEmail);
    if (memoryRecord && String(memoryRecord.otp).trim() === inputOtp) {
      if (Date.now() <= memoryRecord.expiry) {
        isValid = true;
      } else {
        return res.status(400).json({ error: 'Verification code has expired. Please click Resend Code to request a new code.' });
      }
    }

    // 2. Check local database User model
    let localUser = null;
    if (!isValid && User) {
      localUser = await User.findOne({ where: { email: cleanEmail } });
      if (localUser && localUser.otp && String(localUser.otp).trim() === inputOtp) {
        if (localUser.otp_expiry && new Date(localUser.otp_expiry) < new Date()) {
          return res.status(400).json({ error: 'Verification code has expired. Please click Resend Code to request a new code.' });
        }
        isValid = true;
      }
    }

    if (isValid) {
      if (localUser) {
        localUser.is_verified = true;
        localUser.otp = null;
        localUser.otp_expiry = null;
        await localUser.save().catch(() => {});
      } else if (memoryRecord && memoryRecord.type === 'registration' && memoryRecord.password && User) {
        try {
          localUser = await User.create({
            name: memoryRecord.name,
            email: cleanEmail,
            username: memoryRecord.username,
            password: memoryRecord.password,
            role: 'student',
            is_verified: true
          });
          otpStore.delete(cleanEmail);
        } catch (createErr) {
          console.warn('Verify-otp auto-provision notice:', createErr.message);
        }
      }
      return res.json({ success: true, is_email_verified: true, message: 'OTP verified successfully.' });
    }

    // 3. Fallback check to Verification Portal
    const verificationPortalUrl = getVerificationPortalUrl();
    try {
      if (axios && typeof axios.post === 'function') {
        const response = await axios.post(`${verificationPortalUrl}/api/auth/verify-otp`, {
          email: cleanEmail,
          otp: inputOtp
        }, { timeout: 4000 });

        if (response.data && response.data.success) {
          return res.json(response.data);
        }
      }
    } catch (portalErr) {
      // Ignore remote portal error so clean message is returned
    }

    // Rate-limiting / brute-force lockout: Invalidate OTP after 5 failed attempts
    if (memoryRecord) {
      memoryRecord.attempts = (memoryRecord.attempts || 0) + 1;
      if (memoryRecord.attempts >= 5) {
        otpStore.delete(cleanEmail);
        if (User) {
          User.update({ otp: null, otp_expiry: null }, { where: { email: cleanEmail } }).catch(() => {});
        }
        return res.status(400).json({
          error: 'Too many failed attempts. This verification code has been invalidated for security. Please request a new code.'
        });
      }
    }

    return res.status(400).json({ error: 'Invalid verification code. Please check the 6-digit code sent to your email.' });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ error: 'Failed to verify OTP.' });
  }
});

// =======================
// In-App Forgot Password & Password Reset (Local DB + Verification Portal)
// =======================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    let localUser = null;
    if (User) {
      localUser = await User.findOne({ where: { email: cleanEmail } });
    }

    const targetOtp = crypto.randomInt(100000, 1000000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    // Save in memory store
    otpStore.set(cleanEmail, {
      otp: targetOtp,
      name: localUser?.name,
      expiry: Date.now() + 15 * 60 * 1000,
      type: 'password_reset'
    });

    if (localUser) {
      localUser.otp = targetOtp;
      localUser.otp_expiry = expiry;
      await localUser.save().catch(() => {});
    }

    // Send real password reset OTP email via Nodemailer
    try {
      await sendOtpEmail({
        to: cleanEmail,
        name: localUser?.name,
        otp: targetOtp,
        type: 'password_reset'
      });
    } catch (mailErr) {
      console.warn('Direct email dispatch notice:', mailErr.message);
    }

    const verificationPortalUrl = getVerificationPortalUrl();
    try {
      if (axios && typeof axios.post === 'function') {
        const response = await axios.post(`${verificationPortalUrl}/api/auth/send-otp`, {
          email: cleanEmail,
          purpose: 'reset_password'
        }, { timeout: 4000 });

        if (response.data && response.data.success) {
          return res.json(response.data);
        }
      }
    } catch (portalErr) {
      const detail = portalErr.response?.data?.error || portalErr.response?.data?.message || portalErr.message;
      console.warn(`Portal forgot password notice (${cleanEmail}):`, detail);
    }

    return res.json({
      success: true,
      message: `Password reset verification code sent to ${cleanEmail}.`
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Failed to request password reset OTP.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const cleanEmail = normalizeEmail(email);
    const inputOtp = otp ? String(otp).trim().replace(/[^0-9]/g, '') : '';

    if (!cleanEmail || !inputOtp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP code, and new password are all required.' });
    }

    if (await isAdministratorEmail(cleanEmail)) {
      return res.status(400).json({ error: 'Unable to reset password for this account. Please check your details or contact support.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    let isOtpValid = false;
    const memoryRecord = otpStore.get(cleanEmail);
    if (memoryRecord && String(memoryRecord.otp).trim() === inputOtp) {
      if (Date.now() <= memoryRecord.expiry) {
        isOtpValid = true;
      } else {
        return res.status(400).json({ error: 'OTP code has expired. Please request a new OTP code.' });
      }
    }

    let localUser = null;
    if (User) {
      localUser = await User.findOne({ where: { email: cleanEmail } });
    }

    // If OTP was verified locally but local User record doesn't exist yet (e.g. participant or synced account), auto-provision
    if (!localUser && isOtpValid && User) {
      let participantName = null;
      if (Participant) {
        const p = await Participant.findOne({ where: { email: cleanEmail } }).catch(() => null);
        if (p) participantName = p.name;
      }
      const displayName = memoryRecord?.name || participantName || cleanEmail.split('@')[0];
      const cleanUsername = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '') || `user_${crypto.randomBytes(3).toString('hex')}`;
      try {
        localUser = await User.create({
          name: displayName,
          email: cleanEmail,
          username: cleanUsername,
          password: newPassword,
          role: 'student',
          is_verified: true
        });
      } catch (createErr) {
        console.warn('Auto-create user during reset-password notice:', createErr.message);
      }
    }

    if (localUser && (isOtpValid || (localUser.otp && String(localUser.otp).trim() === inputOtp))) {
      if (localUser.otp_expiry && new Date(localUser.otp_expiry) < new Date() && !isOtpValid) {
        return res.status(400).json({ error: 'OTP code has expired. Please request a new OTP code.' });
      }
      localUser.password = newPassword;
      localUser.otp = null;
      localUser.otp_expiry = null;
      await localUser.save();
      otpStore.delete(cleanEmail);

      // Synchronize updated password to Verification Portal in background
      const verificationPortalUrl = getVerificationPortalUrl();
      if (axios && typeof axios.post === 'function') {
        axios.post(`${verificationPortalUrl}/api/auth/external-sync`, {
          email: cleanEmail,
          password: newPassword,
          name: localUser.name,
          username: localUser.username,
          apiKey: process.env.VERIFICATION_API_KEY || 'msc_quiz_verification_secret_key_2026'
        }, {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.VERIFICATION_API_KEY || 'msc_quiz_verification_secret_key_2026'
          },
          timeout: 4000
        }).catch((err) => {
          const syncDetail = err.response?.data?.error || err.response?.data?.message || err.message;
          console.warn('[Cross-Portal SSO] Reset password sync to verification portal notice:', syncDetail);
        });
      }

      return res.json({ success: true, message: 'Password reset successfully! You can now log in.' });
    }

    const verificationPortalUrl = getVerificationPortalUrl();
    try {
      if (axios && typeof axios.post === 'function') {
        const response = await axios.post(`${verificationPortalUrl}/api/auth/reset-password`, {
          email: cleanEmail,
          otp: inputOtp,
          newPassword,
          password: newPassword
        }, { timeout: 5000 });

        if (response.data && response.data.success) {
          return res.json(response.data);
        }
      }
    } catch (portalErr) {
      const detail = portalErr.response?.data?.error || portalErr.response?.data?.message || portalErr.message;
      console.warn(`Portal reset password notice (${cleanEmail}):`, detail);
    }

    // Rate-limiting / brute-force lockout: Invalidate OTP after 5 failed attempts
    if (memoryRecord) {
      memoryRecord.attempts = (memoryRecord.attempts || 0) + 1;
      if (memoryRecord.attempts >= 5) {
        otpStore.delete(cleanEmail);
        if (User) {
          User.update({ otp: null, otp_expiry: null }, { where: { email: cleanEmail } }).catch(() => {});
        }
        return res.status(400).json({
          error: 'Too many failed attempts. This verification code has been invalidated for security. Please request a new code.'
        });
      }
    }

    return res.status(400).json({ error: 'Invalid or expired verification code. Please check your OTP code and try again.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// =======================
// Central OAuth 2.0 Code Exchange Endpoint
// POST /api/student/oauth/exchange
// =======================
router.post('/oauth/exchange', async (req, res) => {
  try {
    const { code, client_id, code_verifier, redirect_uri } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'invalid_request', error_description: 'Authorization code is required.' });
    }

    const clientId = client_id || 'msc-quiz-web';

    const tokenResponse = await exchangeCodeForTokens({
      code,
      clientId,
      codeVerifier: code_verifier,
      redirectUri: redirect_uri
    });

    const ssoUser = tokenResponse.user;
    const cleanEmail = normalizeEmail(ssoUser.email);
    const subjectId = ssoUser.sub || generateSubjectId();

    // Find or sync central user in local database
    let localUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: cleanEmail },
          { subject_id: subjectId }
        ]
      }
    });

    if (await isAdministratorEmail(cleanEmail)) {
      return res.status(403).json({ error: 'invalid_grant', error_description: 'Administrator credentials cannot be exchanged as student accounts.' });
    }

    if (!localUser) {
      localUser = await User.create({
        subject_id: subjectId,
        name: ssoUser.name,
        email: cleanEmail,
        username: ssoUser.username || cleanEmail.split('@')[0],
        password: crypto.randomBytes(32).toString('hex'),
        role: ssoUser.role || 'student',
        is_verified: true
      });
    } else {
      let updated = false;
      if (!localUser.subject_id) {
        localUser.subject_id = subjectId;
        updated = true;
      }
      if (ssoUser.name && localUser.name !== ssoUser.name) {
        localUser.name = ssoUser.name;
        updated = true;
      }
      if (updated) {
        await localUser.save();
      }
    }

    // Auto-link existing QuizAttempts and Participants by email to sso_user_id
    if (QuizAttempt) {
      await QuizAttempt.update(
        { sso_user_id: subjectId },
        { where: { participant_email: cleanEmail, sso_user_id: null } }
      ).catch(() => {});
    }

    if (Participant) {
      await Participant.update(
        { sso_user_id: subjectId },
        { where: { email: cleanEmail, sso_user_id: null } }
      ).catch(() => {});
    }

    const studentData = {
      id: localUser.id,
      subject_id: subjectId,
      sso_user_id: subjectId,
      email: cleanEmail,
      name: localUser.name,
      username: localUser.username || cleanEmail.split('@')[0],
      role: localUser.role || 'student',
      joinedAt: localUser.createdAt || new Date().toISOString()
    };

    const JWT_SECRET = process.env.JWT_SECRET || 'msc_quiz_secret_key_2026';
    const token = jwt.sign(
      { id: localUser.id, sub: subjectId, sso_user_id: subjectId, email: cleanEmail, name: localUser.name, role: studentData.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      message: 'Authenticated successfully via MSC Central SSO!',
      user: studentData,
      token,
      idToken: tokenResponse.idToken
    });
  } catch (err) {
    console.error('OAuth Exchange Error:', err.message);
    return res.status(400).json({ error: 'invalid_grant', error_description: err.message });
  }
});

// =======================
// Get Current Session Student User Info
// GET /api/student/me
// =======================
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'msc_quiz_secret_key_2026';
    const decoded = jwt.verify(token, JWT_SECRET);

    const localUser = await User.findOne({
      where: {
        [Op.or]: [
          ...(decoded.sub ? [{ subject_id: decoded.sub }] : []),
          ...(decoded.email ? [{ email: decoded.email }] : [])
        ]
      }
    });

    if (!localUser) {
      return res.status(404).json({ error: 'Student account not found.' });
    }

    return res.json({
      success: true,
      user: {
        id: localUser.id,
        subject_id: localUser.subject_id,
        sso_user_id: localUser.subject_id,
        email: localUser.email,
        name: localUser.name,
        username: localUser.username,
        role: localUser.role
      }
    });
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token.' });
  }
});

// =======================
// Student Login (Verification Portal + Local DB + Event Registration Fallback)
// =======================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !password) {
      return res.status(400).json({ error: 'Both Email Address and Password are required.' });
    }

    // Disallow admin accounts from student portal with generic error (prevents admin enumeration & portal path leak)
    if (await isAdministratorEmail(cleanEmail)) {
      return res.status(401).json({
        error: 'Invalid email address or password. Please verify your credentials and try again.'
      });
    }

    const verificationPortalUrl = getVerificationPortalUrl();

    // 1. Check Local Database (User model) FIRST - Fast-path (5-20ms)
    let localUser = null;
    if (User) {
      localUser = await User.findOne({
        where: {
          [Op.or]: [
            { email: cleanEmail },
            { username: cleanEmail }
          ]
        }
      });

      if (localUser) {
        let isMatch = false;
        try {
          isMatch = await localUser.comparePassword(password);
        } catch (e) {
          console.warn('Password compare exception:', e.message);
        }

        if (isMatch) {
          // Check verification status: without OTP verification user cannot log in
          if (!localUser.is_verified) {
            return res.status(403).json({
              error: 'Your email address has not been verified yet. Please verify your email with the OTP code sent to your inbox.',
              requireVerification: true,
              email: localUser.email
            });
          }

          const studentData = {
            id: localUser.id,
            email: localUser.email,
            name: localUser.name,
            username: localUser.username || localUser.email.split('@')[0],
            college: localUser.college || 'PRPCEM Amravati',
            role: 'student',
            joinedAt: localUser.createdAt || new Date().toISOString()
          };

          const token = jwt.sign(
            { id: studentData.id, email: studentData.email, name: studentData.name, role: 'student' },
            process.env.JWT_SECRET || 'msc_prpcem_jwt_secret_2026',
            { expiresIn: '30d' }
          );

          return res.json({
            success: true,
            message: 'Authenticated successfully!',
            user: studentData,
            token
          });
        }
      }
    }

    // 2. Fallback to Remote Verification Portal API (if not found locally or local password did not match)
    // Fast 2.5s timeout prevents hanging on network drops or portal restarts
    try {
      if (axios && typeof axios.post === 'function') {
        const response = await axios.post(`${verificationPortalUrl}/api/auth/login`, {
          email: cleanEmail,
          password: password
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 2500
        });

        if (response.data && (response.data.user || response.data.token || response.data.success)) {
          const portalUser = response.data.user || {};
          const studentData = {
            id: portalUser.id || portalUser._id || `STU-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`,
            email: cleanEmail,
            name: portalUser.name || cleanEmail.split('@')[0],
            username: portalUser.username || cleanEmail.split('@')[0],
            role: 'student',
            joinedAt: portalUser.createdAt || new Date().toISOString()
          };

          // Also sync user locally in background
          if (User) {
            User.findOne({ where: { email: cleanEmail } }).then(async (found) => {
              if (!found) {
                await User.create({
                  name: studentData.name,
                  email: cleanEmail,
                  username: studentData.username,
                  password: password,
                  is_verified: true
                }).catch(() => {});
              } else {
                found.password = password;
                await found.save().catch(() => {});
              }
            }).catch(() => {});
          }

          const token = response.data.token || jwt.sign(
            { id: studentData.id, email: cleanEmail, name: studentData.name, role: 'student' },
            process.env.JWT_SECRET || 'msc_prpcem_jwt_secret_2026',
            { expiresIn: '30d' }
          );

          return res.json({
            success: true,
            message: 'Authenticated successfully via Verification Portal!',
            user: studentData,
            token,
            verificationPortalUrl
          });
        }
      }
    } catch (portalErr) {
      console.warn('Verification portal auth fallback notice:', portalErr.message);
    }

    if (localUser) {
      return res.status(401).json({ error: 'Invalid password. Please check your password or reset it.' });
    }

    return res.status(404).json({ error: 'No verified account found with this email. Please register and verify your email.' });
  } catch (err) {
    console.error('Student login error:', err);
    return res.status(500).json({ error: 'Authentication service temporarily unavailable. Please try again.' });
  }
});

// In-memory store for pending registration OTPs
const pendingOtpStore = new Map();

// =======================
// Student Registration (OTP Verified Registration with Custom Username)
// =======================
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, username, otp } = req.body;
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !password || !name) {
      return res.status(400).json({ error: 'Full Name, Email Address, and Password are all required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // 1. Enforce admin protection: Admin credentials cannot be registered as student accounts
    if (await isAdministratorEmail(cleanEmail)) {
      return res.status(400).json({
        error: 'An account with this email address already exists. Please log in.'
      });
    }

    const cleanName = name.trim();
    let cleanUsername = (username || cleanEmail.split('@')[0]).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      cleanUsername = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');
    }

    // Disallow reserved administrative usernames
    const reservedHandles = ['admin', 'administrator', 'root', 'mscadmin', 'superadmin', 'mod', 'moderator', 'system', 'staff'];
    if (reservedHandles.includes(cleanUsername)) {
      return res.status(400).json({
        error: `The username handle @${cleanUsername} is reserved for platform administrators. Please choose a different handle.`
      });
    }

    // Check if verified user already exists with this email
    if (User) {
      const existingUser = await User.findOne({ where: { email: cleanEmail } });
      if (existingUser && existingUser.is_verified) {
        return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
      }
    }

    // Check if username is taken by another account
    if (User) {
      const existingWithUsername = await User.findOne({ where: { username: cleanUsername } });
      if (existingWithUsername && existingWithUsername.email !== cleanEmail) {
        return res.status(400).json({ error: `The username handle @${cleanUsername} is already taken. Please choose another.` });
      }
    }

    const inputOtp = otp ? String(otp).trim().replace(/[^0-9]/g, '') : '';

    // STEP 1: If OTP is not provided, generate & send 6-digit OTP email.
    // NOTE: DO NOT CREATE USER ACCOUNT YET. Account must only be created AFTER OTP is verified.
    if (!inputOtp) {
      const generatedOtp = crypto.randomInt(100000, 1000000).toString();
      const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

      otpStore.set(cleanEmail, {
        otp: generatedOtp,
        name: cleanName,
        username: cleanUsername,
        password,
        expiry,
        type: 'registration'
      });

      // If an existing unverified user was in DB, record OTP on their record (still unverified)
      if (User) {
        const existingUser = await User.findOne({ where: { email: cleanEmail } });
        if (existingUser && !existingUser.is_verified) {
          existingUser.otp = generatedOtp;
          existingUser.otp_expiry = new Date(Date.now() + 15 * 60 * 1000);
          await existingUser.save().catch(() => {});
        }
      }

      // Send real 6-digit registration OTP email
      try {
        await sendOtpEmail({
          to: cleanEmail,
          name: cleanName,
          otp: generatedOtp,
          type: 'registration'
        });
      } catch (mailErr) {
        console.warn('Registration OTP mail notice:', mailErr.message);
      }

      return res.json({
        success: true,
        requireVerification: true,
        email: cleanEmail,
        message: `A 6-digit verification code has been sent to ${cleanEmail}. Please enter it below to complete registration.`
      });
    }

    // STEP 2: Verify OTP
    const memoryRecord = otpStore.get(cleanEmail);
    let isOtpValid = false;

    if (memoryRecord && String(memoryRecord.otp).trim() === inputOtp) {
      if (Date.now() <= memoryRecord.expiry) {
        isOtpValid = true;
      } else {
        return res.status(400).json({ error: 'Verification code has expired. Please click Resend Code to request a new code.' });
      }
    }

    let localUser = null;
    if (!isOtpValid && User) {
      localUser = await User.findOne({ where: { email: cleanEmail } });
      if (localUser && localUser.otp && String(localUser.otp).trim() === inputOtp) {
        if (localUser.otp_expiry && new Date(localUser.otp_expiry) < new Date()) {
          return res.status(400).json({ error: 'Verification code has expired. Please click Resend Code to request a new code.' });
        }
        isOtpValid = true;
      }
    }

    if (!isOtpValid) {
      return res.status(400).json({ error: 'Invalid verification code. Please check the 6-digit code sent to your email.' });
    }

    // Remove from memory store
    otpStore.delete(cleanEmail);

    const finalName = memoryRecord?.name || cleanName;
    const finalUsername = memoryRecord?.username || cleanUsername;
    const finalPassword = memoryRecord?.password || password;

    // Create or Update in Local Database
    if (User) {
      const existingUser = await User.findOne({ where: { email: cleanEmail } });

      if (existingUser) {
        existingUser.name = finalName;
        existingUser.username = finalUsername;
        existingUser.password = finalPassword;
        existingUser.is_verified = true;
        existingUser.otp = null;
        existingUser.otp_expiry = null;
        await existingUser.save();
        localUser = existingUser;
      } else {
        localUser = await User.create({
          name: finalName,
          email: cleanEmail,
          username: finalUsername,
          password: finalPassword,
          role: 'student',
          is_verified: true
        });
      }
    }

    const studentData = {
      id: localUser ? localUser.id : `STU-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`,
      email: cleanEmail,
      name: finalName,
      username: finalUsername,
      role: 'student',
      joinedAt: localUser?.createdAt || new Date().toISOString()
    };

    // Sync with Verification Portal (Bidirectional SSO Auto-Provisioning)
    const verificationPortalUrl = getVerificationPortalUrl();
    try {
      if (axios && typeof axios.post === 'function') {
        const syncPayload = {
          name: finalName,
          email: cleanEmail,
          password: finalPassword,
          username: finalUsername,
          apiKey: process.env.VERIFICATION_API_KEY || 'msc_quiz_verification_secret_key_2026'
        };
        const syncHeaders = {
          'Content-Type': 'application/json',
          'x-api-key': process.env.VERIFICATION_API_KEY || 'msc_quiz_verification_secret_key_2026'
        };
        // Call external-sync first so user is immediately provisioned in Verification DB without OTP delay
        await axios.post(`${verificationPortalUrl}/api/auth/external-sync`, syncPayload, {
          headers: syncHeaders,
          timeout: 4500
        }).catch(async (syncErr) => {
          console.warn('[Cross-Portal SSO] external-sync fallback to register endpoint:', syncErr.message);
          await axios.post(`${verificationPortalUrl}/api/auth/register`, syncPayload, {
            headers: syncHeaders,
            timeout: 4500
          }).catch((err2) => {
            console.warn('[Cross-Portal SSO] register fallback notice:', err2.message);
          });
        });
      }
    } catch (portalErr) {
      console.warn('Portal background registration sync notice:', portalErr.message);
    }

    const token = jwt.sign(
      { id: studentData.id, email: cleanEmail, name: studentData.name, role: 'student' },
      process.env.JWT_SECRET || 'msc_prpcem_jwt_secret_2026',
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account verified and registered successfully!',
      user: studentData,
      token,
      verificationPortalUrl
    });
  } catch (err) {
    console.error('Student registration error:', err);
    return res.status(500).json({ error: 'Registration failed. Please check your details and try again.' });
  }
});

// =======================
// SSO Token Verification (From Verification Portal)
// =======================
router.post('/sso-verify', (req, res) => {
  const { token } = req.body;
  const sharedSecret = process.env.SSO_SHARED_SECRET || 'msc_prpcem_shared_sso_secret_2026';

  if (!token) {
    return res.status(400).json({ error: 'Signed SSO Token is required for verification.' });
  }

  try {
    const studentData = jwt.verify(token, sharedSecret);
    const cleanEmail = normalizeEmail(studentData.email);

    if (!cleanEmail) {
      return res.status(400).json({ error: 'Invalid token payload: Email is required.' });
    }

    const localToken = jwt.sign(
      { sub: studentData.sub, email: cleanEmail, name: studentData.name, role: studentData.role || 'student' },
      process.env.JWT_SECRET || 'msc_quiz_secret_key_2026',
      { expiresIn: '30d' }
    );

    return res.json({
      success: true,
      user: {
        email: cleanEmail,
        name: studentData.name || cleanEmail.split('@')[0],
        role: studentData.role || 'student'
      },
      token: localToken,
      verificationPortalUrl: process.env.VERIFICATION_PORTAL_URL || 'https://verify.mscprpcem.tech'
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired SSO token.' });
  }
});

// =======================
// Inbound Account Sync from Verification Portal (Vice Versa)
// =======================
router.post('/external-sync', async (req, res) => {
  const { email, name, password, username, apiKey } = req.body;
  const providedKey = req.headers['x-api-key'] || apiKey;

  // Fail-closed verification against non-empty environment keys
  const validKeys = [
    process.env.QUIZ_PLATFORM_API_KEY,
    process.env.INTEGRATION_API_KEY,
    process.env.VERIFICATION_API_KEY
  ].filter(k => Boolean(k && k.trim()));

  let isAuthorized = false;
  if (providedKey && typeof providedKey === 'string' && validKeys.length > 0) {
    const provBuf = Buffer.from(providedKey.trim());
    isAuthorized = validKeys.some(k => {
      const keyBuf = Buffer.from(k.trim());
      return provBuf.length === keyBuf.length && crypto.timingSafeEqual(provBuf, keyBuf);
    });
  }

  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized: Valid API Key is required.' });
  }

  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  if (await isAdministratorEmail(cleanEmail) || req.body.role === 'admin') {
    // Synchronize administrator credentials directly into Admin table (both sides updated)
    if (Admin && !cleanEmail.endsWith('.edu')) {
      let admin = await Admin.findOne({
        where: {
          [Op.or]: [
            { email: cleanEmail },
            sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), cleanEmail)
          ]
        }
      });
      if (admin) {
        if (password) admin.password = password;
        if (name) admin.name = name;
        await admin.save();
      } else {
        await Admin.create({
          name: name || cleanEmail.split('@')[0],
          email: cleanEmail,
          password: password,
          role: 'admin'
        });
      }
      return res.json({
        success: true,
        message: 'Administrator credentials synchronized successfully from Verification Portal.',
        role: 'admin'
      });
    }
    return res.status(403).json({ error: 'Cannot sync administrator credentials into student directory.' });
  }

  const studentName = name || cleanEmail.split('@')[0];
  const studentUsername = (username || cleanEmail.split('@')[0]).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');

  if (User && password) {
    const existing = await User.findOne({
      where: {
        [Op.or]: [
          { email: cleanEmail },
          { username: studentUsername }
        ]
      }
    });
    if (!existing) {
      await User.create({
        name: studentName,
        email: cleanEmail,
        username: studentUsername,
        password: password,
        is_verified: true
      }).catch((e) => {
        console.warn('External sync User.create notice:', e.message);
      });
    } else {
      existing.password = password;
      if (studentName) existing.name = studentName;
      await existing.save().catch((e) => {
        console.warn('External sync User.save notice:', e.message);
      });
    }
  }

  const studentData = {
    email: cleanEmail,
    name: studentName,
    role: 'student',
    joinedAt: new Date().toISOString()
  };

  const token = jwt.sign(
    { email: cleanEmail, name: studentName, role: 'student' },
    process.env.JWT_SECRET || 'msc_quiz_secret_key_2026',
    { expiresIn: '30d' }
  );

  return res.json({
    success: true,
    message: 'Account synchronized from Verification Portal to Quiz Platform!',
    user: studentData,
    token
  });
});

// =======================
// Issue Certificate & Digital Badge (Syncs directly to Verification DB)
// =======================
router.post('/issue-certificate', async (req, res) => {
  const { email, name, courseTitle, score, passingScore, badgeTitle } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Authentication token is required.' });
  }

  const sessionToken = authHeader.split(' ')[1];
  let decodedUser;
  try {
    decodedUser = jwt.verify(sessionToken, process.env.JWT_SECRET || 'msc_quiz_secret_key_2026');
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }

  if (!email || !courseTitle) {
    return res.status(400).json({ error: 'Email and Course Title are required.' });
  }

  const cleanEmail = normalizeEmail(email);
  if (decodedUser.role !== 'admin' && normalizeEmail(decodedUser.email) !== cleanEmail) {
    return res.status(403).json({ error: 'Forbidden: Cannot issue certificates for another user account.' });
  }

  const certificateId = `CERT-MSC-${Date.now().toString().slice(-6)}`;
  const verificationPortalUrl = process.env.VERIFICATION_PORTAL_URL || 'https://verify.mscprpcem.tech';

  const certificate = {
    certificateId,
    email: cleanEmail,
    studentName: name || cleanEmail.split('@')[0],
    courseTitle,
    score: score || 100,
    passingScore: passingScore || 70,
    badgeTitle: badgeTitle || `${courseTitle} Certified Master`,
    issuedAt: new Date().toISOString(),
    verificationUrl: `${verificationPortalUrl}/verify/${certificateId}`
  };

  studentCertificates.push(certificate);

  // Dispatch certificate & badge generation directly to Verification Portal API if API key is configured
  if (process.env.VERIFICATION_API_KEY) {
    axios.post(`${verificationPortalUrl}/api/integration/publish-results`, {
      quizTitle: courseTitle,
      eventName: courseTitle,
      publishDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      attendees: [
        {
          name: name || cleanEmail.split('@')[0],
          email: cleanEmail,
          score: score || 100,
          status: 'passed'
        }
      ]
    }, {
      headers: { 'x-api-key': process.env.VERIFICATION_API_KEY }
    }).catch(err => {
      console.warn('Background certificate publishing warning:', err.message);
    });
  }

  return res.json({
    success: true,
    certificate,
    message: 'Certificate and digital badge successfully issued and linked to your Verification Portal Account!'
  });
});

// =======================
// Query Student Badges & Certificates by Email (For Verification Portal API)
// =======================
router.get('/account-data', (req, res) => {
  const { email, apiKey } = req.query;
  const expectedApiKey = process.env.QUIZ_PLATFORM_API_KEY;

  if (!apiKey || (expectedApiKey && apiKey !== expectedApiKey)) {
    return res.status(401).json({ error: 'Unauthorized: Valid API Key is required.' });
  }

  if (!email) {
    return res.status(400).json({ error: 'Email query parameter is required.' });
  }

  const normalizedEmail = normalizeEmail(email);
  const certs = studentCertificates.filter(c => c.email === normalizedEmail);

  return res.json({
    success: true,
    email: normalizedEmail,
    totalCertificates: certs.length,
    certificates: certs,
    verificationPortalUrl: process.env.VERIFICATION_PORTAL_URL || 'https://verify.mscprpcem.tech'
  });
});

// =======================
// Available Badges from Verification Portal
// =======================
router.get('/available-badges', async (req, res) => {
  const verificationPortalUrl = process.env.VERIFICATION_PORTAL_URL || 'https://verify.mscprpcem.tech';
  let portalBadges = [];

  try {
    const response = await axios.get(`${verificationPortalUrl}/api/integration/events`, {
      headers: { 'x-api-key': process.env.VERIFICATION_API_KEY || 'msc_quiz_verification_secret_key_2026' },
      timeout: 3000
    });
    if (response.data && Array.isArray(response.data.events)) {
      portalBadges = response.data.events.map(ev => ({
        id: ev.id || ev._id || ev.slug,
        title: ev.name || ev.title || ev.badgeTitle,
        category: ev.category || 'Certification',
        source: 'verification_portal'
      }));
    }
  } catch (err) {
    // Non-blocking fallback
  }

  // Curated list of verified MSC Club Badges
  const standardBadges = [
    { id: 'azure-cloud-specialist', title: 'Microsoft Azure & Cloud Fundamentals Master', category: 'Cloud' },
    { id: 'dbms-sql-architect', title: 'Database Systems & SQL Specialist', category: 'DBMS' },
    { id: 'dsa-algo-expert', title: 'Data Structures & Algorithms Expert', category: 'DSA' },
    { id: 'fullstack-web-dev', title: 'Full-Stack Web Development Certified Specialist', category: 'Web' },
    { id: 'python-dev-pro', title: 'Python Programming Certified Professional', category: 'Programming' },
    { id: 'ai-machine-learning', title: 'Artificial Intelligence & Machine Learning Specialist', category: 'AI/ML' },
    { id: 'devops-cloud-architect', title: 'DevOps & Cloud Infrastructure Master', category: 'DevOps' },
    { id: 'msc-tech-champion', title: 'MSC PRPCEM Student Tech Champion', category: 'General' }
  ];

  const allBadges = [...portalBadges];
  standardBadges.forEach(std => {
    if (!allBadges.some(b => b.title.toLowerCase() === std.title.toLowerCase())) {
      allBadges.push({ ...std, source: 'msc_catalog' });
    }
  });

  return res.json({
    success: true,
    badges: allBadges
  });
});

// =========================================================================
// Course Completion & Future Certificate Release Management
// =========================================================================
const fs = require('fs');
const path = require('path');
const COMPLETIONS_FILE = path.join(__dirname, '../data/course_completions.json');

function loadCourseCompletions() {
  try {
    if (!fs.existsSync(COMPLETIONS_FILE)) return [];
    const raw = fs.readFileSync(COMPLETIONS_FILE, 'utf8');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading course completions:', err);
    return [];
  }
}

function saveCourseCompletions(completions) {
  try {
    fs.writeFileSync(COMPLETIONS_FILE, JSON.stringify(completions, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving course completions:', err);
  }
}

// Student endpoint: Record completion of a course
router.post('/record-course-completion', (req, res) => {
  try {
    const { email, name, username, courseTitle, score, topicsCount, challengesSolved } = req.body;
    if (!email || !courseTitle) {
      return res.status(400).json({ error: 'Email and courseTitle are required.' });
    }

    const cleanEmail = normalizeEmail(email);
    const cleanName = name || (username || cleanEmail.split('@')[0]);
    const completions = loadCourseCompletions();

    const existingIdx = completions.findIndex(c => c.email === cleanEmail && c.courseTitle.toLowerCase() === courseTitle.toLowerCase());
    
    const record = {
      id: existingIdx >= 0 ? completions[existingIdx].id : `comp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      email: cleanEmail,
      name: cleanName,
      username: username || cleanEmail.split('@')[0],
      courseTitle,
      score: Number(score) || 100,
      topicsCount: Number(topicsCount) || 0,
      challengesSolved: Number(challengesSolved) || 0,
      completedAt: existingIdx >= 0 ? completions[existingIdx].completedAt : new Date().toISOString(),
      certificateStatus: existingIdx >= 0 ? completions[existingIdx].certificateStatus : 'eligible_pending_release',
      certificateId: existingIdx >= 0 ? completions[existingIdx].certificateId : null,
      verificationUrl: existingIdx >= 0 ? completions[existingIdx].verificationUrl : null,
      updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      completions[existingIdx] = record;
    } else {
      completions.push(record);
    }
    saveCourseCompletions(completions);

    return res.json({
      success: true,
      message: 'Course completion registered! Eligible for certificate release.',
      completion: record
    });
  } catch (err) {
    console.error('Error recording course completion:', err);
    return res.status(500).json({ error: 'Failed to record course completion' });
  }
});

// Admin endpoint: List all course completions
router.get('/course-completions', (req, res) => {
  try {
    const completions = loadCourseCompletions();
    return res.json({
      success: true,
      totalCompletions: completions.length,
      completions: completions.reverse()
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load course completions' });
  }
});

// Admin endpoint: Release certificate for a completed student
router.post('/release-certificate', async (req, res) => {
  try {
    const { email, courseTitle } = req.body;
    if (!email || !courseTitle) {
      return res.status(400).json({ error: 'Email and courseTitle are required.' });
    }

    const cleanEmail = normalizeEmail(email);
    const completions = loadCourseCompletions();
    const targetIdx = completions.findIndex(c => c.email === cleanEmail && c.courseTitle.toLowerCase() === courseTitle.toLowerCase());

    if (targetIdx === -1) {
      return res.status(404).json({ error: 'No course completion record found for this student.' });
    }

    const verificationPortalUrl = process.env.VERIFICATION_PORTAL_URL || 'https://verify.mscprpcem.tech';
    const certificateId = completions[targetIdx].certificateId || `CERT-MSC-${Date.now().toString().slice(-6)}`;
    const verificationUrl = `${verificationPortalUrl}/verify/${certificateId}`;

    completions[targetIdx].certificateStatus = 'released';
    completions[targetIdx].certificateId = certificateId;
    completions[targetIdx].verificationUrl = verificationUrl;
    completions[targetIdx].releasedAt = new Date().toISOString();
    saveCourseCompletions(completions);

    // Also register in studentCertificates in-memory
    const certRecord = {
      certificateId,
      email: cleanEmail,
      studentName: completions[targetIdx].name,
      courseTitle,
      score: completions[targetIdx].score,
      passingScore: 70,
      badgeTitle: `${courseTitle} Certified Master`,
      issuedAt: completions[targetIdx].releasedAt,
      verificationUrl
    };
    studentCertificates.push(certRecord);

    return res.json({
      success: true,
      message: `Certificate ${certificateId} released successfully!`,
      certificate: certRecord,
      completion: completions[targetIdx]
    });
  } catch (err) {
    console.error('Error releasing certificate:', err);
    return res.status(500).json({ error: 'Failed to release certificate' });
  }
});

// Student endpoint: Query own completion & certificate eligibility
router.get('/my-completions', (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const cleanEmail = normalizeEmail(email);
    const completions = loadCourseCompletions().filter(c => c.email === cleanEmail);

    return res.json({
      success: true,
      completions
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch student completions' });
  }
});

module.exports = router;
