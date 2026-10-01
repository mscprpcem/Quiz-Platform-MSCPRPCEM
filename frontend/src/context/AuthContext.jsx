import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Student Account Session (Linked via Email)
  const [studentAccount, setStudentAccount] = useState(() => {
    const saved = localStorage.getItem('msc_student_account');
    return saved ? JSON.parse(saved) : null;
  });

  const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 1 day (24 hours) session limit

  const verifyToken = async () => {
    const token = localStorage.getItem('msc_quiz_token');
    const tokenTime = localStorage.getItem('msc_quiz_token_time');

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Check if 1 day (24h) has elapsed since login
    if (tokenTime) {
      const elapsed = Date.now() - parseInt(tokenTime, 10);
      if (elapsed > ONE_DAY_MS) {
        console.warn('Admin session expired after 1 day (24 hours). Requiring re-login.');
        localStorage.removeItem('msc_quiz_token');
        localStorage.removeItem('msc_quiz_token_time');
        setUser(null);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await api.get('/api/auth/verify');
      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('msc_quiz_token');
        localStorage.removeItem('msc_quiz_token_time');
        setUser(null);
      }
    } catch (error) {
      console.warn('Token validation failed or expired:', error.message);
      localStorage.removeItem('msc_quiz_token');
      localStorage.removeItem('msc_quiz_token_time');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Cross-portal SSO URL query parameter check on initial mount
  useEffect(() => {
    verifyToken();

    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get('sso_token') || params.get('token');

    if (ssoToken) {
      api.post('/api/student/sso-verify', { token: ssoToken })
        .then(res => {
          if (res.data.success && res.data.user) {
            setStudentAccount(res.data.user);
            localStorage.setItem('msc_student_account', JSON.stringify(res.data.user));
          }
        })
        .catch(err => console.warn('SSO Token verification error:', err.message));
    }
  }, []);

  // Initiate Central OAuth 2.0 PKCE Flow
  const initiateSsoLogin = async (returnUrl = '/') => {
    try {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);

      sessionStorage.setItem('msc_pkce_verifier', verifier);
      sessionStorage.setItem('msc_sso_return_url', returnUrl);

      const redirectUri = `${window.location.origin}/auth/callback`;
      const authUrl = new URL(`/oauth/authorize`, window.location.origin);
      authUrl.searchParams.set('client_id', 'msc-quiz-web');
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid profile email');
      authUrl.searchParams.set('code_challenge', challenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');

      if (studentAccount?.email) {
        authUrl.searchParams.set('email', studentAccount.email);
        authUrl.searchParams.set('name', studentAccount.name);
      }

      window.location.href = authUrl.toString();
    } catch (err) {
      console.error('Failed to initiate SSO login:', err);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data;
      localStorage.setItem('msc_quiz_token', token);
      localStorage.setItem('msc_quiz_token_time', Date.now().toString());
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const adminSsoLogin = async (token) => {
    try {
      const response = await api.post('/api/auth/sso-login', { token });
      const { token: adminToken, user: userData } = response.data;
      localStorage.setItem('msc_quiz_token', adminToken);
      localStorage.setItem('msc_quiz_token_time', Date.now().toString());
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'SSO administrator authentication failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('msc_quiz_token');
    localStorage.removeItem('msc_quiz_token_time');
    localStorage.removeItem('msc_student_account');
    localStorage.removeItem('msc_student_token');
    localStorage.removeItem('msc_student_name');
    localStorage.removeItem('msc_student_email');
    localStorage.removeItem('msc_participant_name');
    localStorage.removeItem('msc_participant_email');
    localStorage.removeItem('msc_saved_form_data');
    sessionStorage.removeItem('msc_quiz_return_url');
    setUser(null);
    setStudentAccount(null);
  };

  const studentLogin = async (email, password) => {
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    if (!cleanEmail || !password) {
      return { success: false, error: 'Email Address and Password are both required.' };
    }

    try {
      const res = await api.post('/api/student/login', { email: cleanEmail, password });
      if (res.data && res.data.user) {
        setStudentAccount(res.data.user);
        localStorage.setItem('msc_student_account', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
      return { success: false, error: res.data?.error || 'Login failed.' };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Invalid credentials or server connection error.';
      return {
        success: false,
        error: errorMsg,
        requireVerification: Boolean(err.response?.data?.requireVerification),
        email: err.response?.data?.email || cleanEmail
      };
    }
  };

  const checkUsername = async (handleVal) => {
    const clean = (handleVal || '').toLowerCase().trim();
    if (!clean || clean.length < 3) {
      return { available: false, error: 'Username handle must be at least 3 characters.' };
    }
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(clean)) {
      return { available: false, error: 'Only letters, numbers, underscores, or hyphens allowed.' };
    }
    try {
      const res = await api.get(`/api/student/check-username?username=${encodeURIComponent(clean)}`);
      return res.data;
    } catch (err) {
      return { available: false, error: err.response?.data?.error || 'Error verifying username availability.' };
    }
  };

  const studentRegister = async (param1, param2, param3, param4, param5) => {
    let name, email, password, username, otp;
    if (typeof param1 === 'object' && param1 !== null) {
      name = param1.name;
      email = param1.email;
      password = param1.password;
      username = param1.username;
      otp = param1.otp;
    } else if (typeof param1 === 'string' && param1.includes('@')) {
      email = param1;
      name = param2;
      password = param3;
      username = param4;
      otp = param5;
    } else {
      name = param1;
      email = param2;
      password = param3;
      username = param4;
      otp = param5;
    }

    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const cleanName = name || (cleanEmail ? cleanEmail.split('@')[0] : 'Student');
    let cleanUsername = (username || cleanEmail.split('@')[0]).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (!cleanUsername) cleanUsername = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');

    if (!cleanEmail || !password || !cleanName) {
      return { success: false, error: 'Full Name, Email Address, and Password are required.' };
    }

    try {
      const payload = {
        name: cleanName,
        email: cleanEmail,
        password,
        username: cleanUsername,
        ...(otp ? { otp: otp.toString().trim() } : {})
      };

      const res = await api.post('/api/student/register', payload);

      if (res.data?.requireVerification) {
        return {
          success: true,
          requireVerification: true,
          email: cleanEmail,
          message: res.data.message || `Verification code sent to ${cleanEmail}.`
        };
      }

      if (res.data && res.data.user) {
        setStudentAccount(res.data.user);
        localStorage.setItem('msc_student_account', JSON.stringify(res.data.user));
        if (res.data.token) {
          localStorage.setItem('msc_student_token', res.data.token);
        }
        return { success: true, user: res.data.user, token: res.data.token, verificationPortalUrl: res.data.verificationPortalUrl };
      }

      return { success: false, error: res.data?.error || 'Registration failed.' };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed. Check network connection.';
      return { success: false, error: errorMsg };
    }
  };

  const studentLogout = () => {
    localStorage.removeItem('msc_student_account');
    localStorage.removeItem('msc_student_token');
    localStorage.removeItem('msc_student_name');
    localStorage.removeItem('msc_student_email');
    localStorage.removeItem('msc_participant_name');
    localStorage.removeItem('msc_participant_email');
    localStorage.removeItem('msc_saved_form_data');
    sessionStorage.removeItem('msc_quiz_return_url');
    setStudentAccount(null);
  };

  const sendOtp = async (email) => {
    try {
      const res = await api.post('/api/student/send-otp', { email });
      return { success: true, message: res.data?.message || 'OTP sent successfully.' };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to send OTP.' };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await api.post('/api/student/verify-otp', { email, otp });
      return { success: true, message: res.data?.message || 'Email verified successfully.' };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Invalid OTP code.' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post('/api/student/forgot-password', { email });
      return { success: true, message: res.data?.message || 'Password reset OTP sent to your email.' };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to send password reset OTP.' };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await api.post('/api/student/reset-password', { email, otp, newPassword });
      return { success: true, message: res.data?.message || 'Password reset successfully!' };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to reset password.' };
    }
  };

  // Issue Certificate & Digital Badge (Syncs to API & Verification Portal)
  const issueStudentCertificate = async ({ courseTitle, score, passingScore, badgeTitle, name, email }) => {
    const targetEmail = email || studentAccount?.email;
    const targetName = name || studentAccount?.name || targetEmail?.split('@')[0] || 'Student';

    if (!targetEmail) return null;

    try {
      const res = await api.post('/api/student/issue-certificate', {
        email: targetEmail,
        name: targetName,
        courseTitle,
        score,
        passingScore,
        badgeTitle
      });
      return res.data.certificate;
    } catch (err) {
      console.error('Certificate issue error:', err);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      adminSsoLogin,
      logout, 
      loading, 
      verifyToken,
      studentAccount,
      setStudentAccount,
      initiateSsoLogin,
      studentLogin,
      studentRegister,
      studentLogout,
      checkUsername,
      sendOtp,
      verifyOtp,
      forgotPassword,
      resetPassword,
      issueStudentCertificate
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
