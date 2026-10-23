const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const {
  validateClientRedirect,
  createAuthorizationCode,
  exchangeCodeForTokens,
  generateSubjectId
} = require('../services/ssoProvider');

const JWT_SECRET = process.env.JWT_SECRET || 'msc_quiz_secret_key_2026';

// =======================
// OAuth 2.0 / OIDC Authorization Endpoint
// GET /oauth/authorize
// =======================
router.get('/authorize', async (req, res) => {
  try {
    const {
      client_id,
      redirect_uri,
      response_type,
      scope,
      state,
      code_challenge,
      code_challenge_method,
      email,
      name
    } = req.query;

    if (response_type !== 'code') {
      return res.status(400).json({ error: 'unsupported_response_type', error_description: 'Only response_type=code is supported.' });
    }

    const { valid, error } = validateClientRedirect(client_id, redirect_uri);
    if (!valid) {
      return res.status(400).json({ error: 'invalid_request', error_description: error });
    }

    // Verify authenticated session (Bearer token in header, or verified token parameter)
    let authenticatedEmail = null;
    const authHeader = req.headers.authorization;
    const candidateToken = (authHeader && authHeader.startsWith('Bearer '))
      ? authHeader.split(' ')[1]
      : (req.query.session_token || req.query.token);

    if (candidateToken) {
      try {
        const decoded = jwt.verify(candidateToken, JWT_SECRET);
        authenticatedEmail = (decoded.email || '').toLowerCase().trim();
      } catch (tokenErr) {
        authenticatedEmail = null;
      }
    }

    let user = null;
    if (authenticatedEmail) {
      user = await User.findOne({ where: { email: authenticatedEmail } });
    }

    if (!user) {
      // If user isn't authenticated, redirect to login page with preserved OAuth callback params
      const frontendBase = process.env.PUBLIC_QUIZ_URL || process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
      const loginUrl = new URL(`${frontendBase.replace(/\/+$/, '')}/login`);
      loginUrl.searchParams.set('client_id', client_id);
      loginUrl.searchParams.set('redirect_uri', redirect_uri);
      loginUrl.searchParams.set('state', state || '');
      if (code_challenge) loginUrl.searchParams.set('code_challenge', code_challenge);
      if (code_challenge_method) loginUrl.searchParams.set('code_challenge_method', code_challenge_method);

      return res.redirect(loginUrl.toString());
    }

    // Generate Authorization Code
    const { code } = createAuthorizationCode({
      clientId: client_id,
      redirectUri: redirect_uri,
      user,
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method,
      scope,
      state
    });

    const targetRedirect = new URL(redirect_uri);
    targetRedirect.searchParams.set('code', code);
    if (state) targetRedirect.searchParams.set('state', state);

    return res.redirect(targetRedirect.toString());
  } catch (err) {
    console.error('OAuth Authorize Error:', err);
    return res.status(500).json({ error: 'server_error', error_description: 'Failed to process authorization request.' });
  }
});

// =======================
// OAuth 2.0 Token Exchange Endpoint
// POST /oauth/token
// =======================
router.post('/token', async (req, res) => {
  try {
    const {
      grant_type,
      code,
      client_id,
      code_verifier,
      redirect_uri
    } = req.body;

    if (grant_type !== 'authorization_code') {
      return res.status(400).json({ error: 'unsupported_grant_type', error_description: 'Only grant_type=authorization_code is supported.' });
    }

    if (!code || !client_id) {
      return res.status(400).json({ error: 'invalid_request', error_description: 'Missing code or client_id.' });
    }

    const tokens = await exchangeCodeForTokens({
      code,
      clientId: client_id,
      codeVerifier: code_verifier,
      redirectUri: redirect_uri
    });

    return res.json(tokens);
  } catch (err) {
    console.error('OAuth Token Exchange Error:', err.message);
    return res.status(400).json({ error: 'invalid_grant', error_description: err.message });
  }
});

// =======================
// OIDC UserInfo Endpoint
// GET /oauth/userinfo
// =======================
router.get('/userinfo', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized', error_description: 'Missing or invalid Authorization header.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ where: { email: decoded.email } });

    if (!user) {
      return res.status(404).json({ error: 'user_not_found' });
    }

    return res.json({
      sub: user.subject_id || decoded.sub,
      email: user.email,
      name: user.name,
      username: user.username || user.email.split('@')[0],
      role: user.role || 'student',
      email_verified: true,
      updated_at: user.updatedAt
    });
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token', error_description: 'Access token expired or invalid.' });
  }
});

// =======================
// Central Logout Endpoint
// POST/GET /oauth/logout
// =======================
const handleLogout = (req, res) => {
  const postLogoutRedirect = req.query.post_logout_redirect_uri || req.body?.post_logout_redirect_uri || '/';
  res.clearCookie('msc_sso_session');
  if (postLogoutRedirect.startsWith('http') || postLogoutRedirect.startsWith('/')) {
    return res.redirect(postLogoutRedirect);
  }
  return res.json({ success: true, message: 'Logged out from central MSC SSO session.' });
};

router.get('/logout', handleLogout);
router.post('/logout', handleLogout);

module.exports = router;
