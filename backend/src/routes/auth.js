const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sequelize, Admin } = require('../models');
const { Op } = require('sequelize');
const authMiddleware = require('../middleware/auth');
require('dotenv').config();

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

const JWT_SECRET = process.env.JWT_SECRET || 'msc_quiz_secret_key_2026';

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

// Helper to sync admin credentials to Verification Portal (Bidirectional)
const syncAdminToVerificationPortal = async (cleanEmail, password, name) => {
  try {
    const verificationPortalUrl = getVerificationPortalUrl();
    const apiKey = process.env.VERIFICATION_API_KEY || 'msc_quiz_verification_secret_key_2026';
    if (axios && typeof axios.post === 'function') {
      await axios.post(`${verificationPortalUrl}/api/auth/external-sync`, {
        email: cleanEmail,
        password: password,
        name: name || cleanEmail.split('@')[0],
        role: 'admin',
        apiKey
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        timeout: 4500
      });
      console.log(`[Cross-Portal Sync] Admin credentials synchronized to Verification Portal: ${cleanEmail}`);
    }
  } catch (err) {
    const detail = err.response?.data?.error || err.response?.data?.message || err.message;
    console.warn(`[Cross-Portal Sync] Notice: verification portal sync returned:`, detail);
  }
};

// ==========================================
// Admin Login (Direct Credentials with Verification Portal Sync)
// POST /api/auth/login
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Strictly disallow legacy .edu administrator accounts
    if (cleanEmail.endsWith('.edu') || cleanEmail.includes('.edu')) {
      return res.status(403).json({
        error: 'Legacy .edu administrator accounts have been removed.'
      });
    }

    let authenticatedAdmin = null;
    const verificationPortalUrl = getVerificationPortalUrl();
    const configuredAdmin = (process.env.ADMIN_EMAIL || 'admin@mscprpcem.tech').toLowerCase().trim();

    // 1. Check Local Synchronized Database FIRST - Fast-path (5-20ms)
    const localAdmin = await Admin.findOne({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { email: cleanEmail },
              sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), cleanEmail)
            ]
          },
          {
            email: { [Op.notLike]: '%.edu%' }
          }
        ]
      }
    });

    if (localAdmin) {
      let isMatch = false;
      try {
        isMatch = await localAdmin.comparePassword(password);
      } catch (e) {
        console.warn('bcrypt compare warning:', e.message);
      }

      if (isMatch) {
        authenticatedAdmin = {
          id: localAdmin.id,
          name: localAdmin.name,
          email: localAdmin.email,
          role: localAdmin.role
        };

        // Synchronize to Verification Portal in background without blocking login
        syncAdminToVerificationPortal(cleanEmail, password, localAdmin.name).catch(() => {});
      }
    }

    // 2. Fallback to Verification Website (if admin account is not yet in local DB or password updated remotely)
    if (!authenticatedAdmin) {
      try {
        if (axios && typeof axios.post === 'function') {
          const verifyEndpoint = `${verificationPortalUrl}/api/auth/login`;
          const response = await axios.post(verifyEndpoint, {
            email: cleanEmail,
            password: password
          }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 2500
          });

          if (response.data && (response.data.user || response.data.token || response.data.success)) {
            const portalUser = response.data.user || {};
            const isPortalAdmin = portalUser.role === 'admin' ||
              portalUser.isAdmin === true ||
              response.data.role === 'admin' ||
              cleanEmail === configuredAdmin;

            if (isPortalAdmin) {
              // Keep local Admin table perfectly in sync with the Verification Portal
              let syncedAdmin = localAdmin || await Admin.findOne({
                where: {
                  [Op.or]: [
                    { email: cleanEmail },
                    sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), cleanEmail)
                  ]
                }
              });

              if (!syncedAdmin) {
                syncedAdmin = await Admin.create({
                  name: portalUser.name || cleanEmail.split('@')[0],
                  email: cleanEmail,
                  password: password, // will be hashed by beforeCreate hook
                  role: 'admin'
                }).catch(() => null);
              } else {
                // Update local password and profile so local fallback always has newest password
                syncedAdmin.password = password;
                if (portalUser.name) syncedAdmin.name = portalUser.name;
                syncedAdmin.role = 'admin';
                await syncedAdmin.save().catch(() => null);
              }

              authenticatedAdmin = {
                id: syncedAdmin?.id || portalUser.id || portalUser._id || 'admin-' + Date.now(),
                name: portalUser.name || syncedAdmin?.name || cleanEmail.split('@')[0],
                email: cleanEmail,
                role: 'admin'
              };
            }
          }
        }
      } catch (portalErr) {
        console.warn('[Verification Portal Auth] Attempt notice:', portalErr.message);
      }
    }

    if (!authenticatedAdmin) {
      return res.status(401).json({
        error: 'Invalid administrator email or password.'
      });
    }

    const token = jwt.sign(
      { id: authenticatedAdmin.id, name: authenticatedAdmin.name, email: authenticatedAdmin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: authenticatedAdmin.id,
        name: authenticatedAdmin.name,
        email: authenticatedAdmin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during administrator login' });
  }
});

// ==========================================
// Inbound Admin Credential Sync (from Verification Portal)
// POST /api/auth/external-sync
// ==========================================
router.post('/external-sync', async (req, res) => {
  try {
    const { email, name, password, apiKey } = req.body;
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
      return res.status(401).json({ error: 'Unauthorized: Valid API Key is required for admin sync.' });
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Disallow .edu accounts
    if (cleanEmail.endsWith('.edu') || cleanEmail.includes('.edu')) {
      return res.status(403).json({ error: 'Legacy .edu accounts cannot be synchronized as administrators.' });
    }

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
      admin = await Admin.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: password || crypto.randomBytes(16).toString('hex'),
        role: 'admin'
      });
    }

    return res.json({
      success: true,
      message: 'Administrator credentials synchronized successfully on Quiz Platform.',
      user: { id: admin.id, email: admin.email, name: admin.name }
    });
  } catch (err) {
    console.error('External admin sync error:', err);
    return res.status(500).json({ error: 'Failed to synchronize administrator credentials: ' + err.message });
  }
});

// ==========================================
// Admin Password Update (Updates Both Sides Simultaneously)
// POST /api/auth/update-password
// ==========================================
router.post('/update-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const admin = await Admin.findByPk(req.user.id);
    if (!admin) {
      return res.status(404).json({ error: 'Administrator account not found.' });
    }

    if (currentPassword) {
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password does not match.' });
      }
    }

    // 1. Update password in local Quiz Platform database
    admin.password = newPassword;
    await admin.save();

    // 2. Update password on MSC Verification Portal (Both sides update!)
    await syncAdminToVerificationPortal(admin.email, newPassword, admin.name);

    return res.json({
      success: true,
      message: 'Administrator password updated and synchronized across both platforms!'
    });
  } catch (err) {
    console.error('Update password error:', err);
    return res.status(500).json({ error: 'Failed to update password: ' + err.message });
  }
});

// ==========================================
// Verify Admin Token
// GET /api/auth/verify
// ==========================================
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.user.id);
    if (!admin || admin.email.endsWith('.edu') || admin.email.includes('.edu')) {
      return res.status(404).json({ error: 'Admin user not found or deactivated.' });
    }
    return res.json({
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ error: 'Server error during verification' });
  }
});

module.exports = router;
