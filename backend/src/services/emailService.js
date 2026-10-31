const path = require('path');
const fs = require('fs');
let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // nodemailer optional in dev/local test environments
}
const crypto = require('crypto');
require('dotenv').config();

// Singleton Transporter Instance
let transporter = null;

/**
 * Resolve the sender address dynamically to prevent SPF/DMARC spoofing flags.
 * If EMAIL_FROM is explicitly set, use it.
 * Otherwise, align the sender address directly with the authenticated SMTP_USER.
 */
const getSenderAddress = () => {
  if (process.env.EMAIL_FROM && process.env.EMAIL_FROM.trim()) {
    return process.env.EMAIL_FROM.trim();
  }
  const user = process.env.SMTP_USER;
  if (user && user.includes('@')) {
    return `"Microsoft Student Club PRPCEM" <${user.trim()}>`;
  }
  return '"Microsoft Student Club PRPCEM" <mlsc@prpotepatilengg.ac.in>';
};

/**
 * Resolve the default Reply-To address
 */
const getReplyToAddress = () => {
  return process.env.REPLY_TO || process.env.SMTP_USER || 'mlsc@prpotepatilengg.ac.in';
};

/**
 * Generate RFC 5322 compliant Message-ID using the sender's domain
 */
const generateMessageId = (senderEmail) => {
  const domain = (senderEmail && senderEmail.includes('@')) 
    ? senderEmail.split('@')[1].replace(/[<>]/g, '').trim() 
    : 'prpotepatilengg.ac.in';
  return `<${Date.now()}.${crypto.randomBytes(8).toString('hex')}@${domain}>`;
};

/**
 * Returns inline CID attachments for all email templates.
 * Email clients render CID images without external image blocking warnings.
 */
const getEmailAttachments = () => {
  const assetsDir = path.join(__dirname, '../assets/email');
  const files = [
    { filename: 'msc_logo.png', cid: 'msc_logo', path: path.join(assetsDir, 'msc_logo.png') },
    { filename: 'email_hero_banner.png', cid: 'msc_hero_banner', path: path.join(assetsDir, 'email_hero_banner.png') },
    { filename: 'email_force_for_good.png', cid: 'msc_force_for_good', path: path.join(assetsDir, 'email_force_for_good.png') },
    { filename: 'icon_instagram.png', cid: 'msc_icon_instagram', path: path.join(assetsDir, 'icon_instagram.png') },
    { filename: 'icon_linkedin.png', cid: 'msc_icon_linkedin', path: path.join(assetsDir, 'icon_linkedin.png') },
    { filename: 'icon_youtube.png', cid: 'msc_icon_youtube', path: path.join(assetsDir, 'icon_youtube.png') },
    { filename: 'icon_website.png', cid: 'msc_icon_website', path: path.join(assetsDir, 'icon_website.png') }
  ];
  return files.filter(f => fs.existsSync(f.path));
};

/**
 * Create an optimized Nodemailer transporter configured for College Mail & Enterprise SMTP
 * (Supports Microsoft 365, Google Workspace, Zimbra, Exchange, and standard SMTP)
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    const config = {
      host: host.trim(),
      port,
      secure, // true for 465 (SSL), false for 587 (STARTTLS)
      auth: {
        user: user.trim(),
        pass: pass.trim()
      },
      // Connection Pooling for high performance and avoiding mail server rate-limits
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
      // Socket timeouts to prevent hanging processes
      connectionTimeout: 15000, // 15 seconds
      greetingTimeout: 10000,   // 10 seconds
      socketTimeout: 30000,     // 30 seconds
      // TLS Settings (compatible with College servers with strict or custom certificates)
      tls: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: process.env.SMTP_IGNORE_TLS === 'true' ? false : (process.env.NODE_ENV === 'production')
      }
    };

    // If port 587, require TLS upgrade (Standard for Office 365 / Google Workspace / College SMTP)
    if (port === 587) {
      config.requireTLS = true;
    }

    const transport = nodemailer.createTransport(config);

    // Verify SMTP connection in background without blocking startup
    transport.verify((error) => {
      if (error) {
        console.warn('⚠️ [EMAIL SERVICE] SMTP Connection verification warning:', error.message);
        console.warn('💡 Tip: Verify SMTP_HOST, SMTP_USER, and App Password in .env');
      } else {
        console.log(`✅ [EMAIL SERVICE] Connected securely to SMTP server: ${host}:${port} (${user})`);
      }
    });

    return transport;
  }

  // Development / Test Fallback Transporter when SMTP is not configured
  return {
    sendMail: async (mailOptions) => {
      console.log('\n---------------- EMAIL SERVICE (DEV/MOCK MODE) ----------------');
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`From: ${mailOptions.from || getSenderAddress()}`);
      console.log(`Reply-To: ${mailOptions.replyTo || getReplyToAddress()}`);
      console.log('Attachments:', (mailOptions.attachments || []).map(a => a.filename || a.cid).join(', '));
      console.log('Content (Snippet):', (mailOptions.text || mailOptions.html || '').substring(0, 160) + '...');
      console.log('---------------------------------------------------------------\n');
      return { messageId: `mock_${crypto.randomBytes(8).toString('hex')}`, response: '250 Mock Email Dispatched' };
    }
  };
};

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

/**
 * Diagnostic helper to test SMTP connectivity
 */
const verifyEmailConfiguration = async () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  if (!host || !user) {
    return { configured: false, message: 'SMTP credentials not configured in .env' };
  }
  try {
    const transport = getTransporter();
    if (typeof transport.verify === 'function') {
      await transport.verify();
      return { configured: true, connected: true, host, user };
    }
    return { configured: true, connected: true, host, user, note: 'Mock mode or custom transport' };
  } catch (err) {
    return { configured: true, connected: false, host, user, error: err.message };
  }
};

/**
 * Official MSC PRPCEM HTML Email Template Wrapper
 * Modeled exactly after the official design standard:
 * 1. Dynamic Top Header Bar: Transparent MSC Logo, "MSC PRPCEM", "Be a Force for Good."
 * 2. Hero Banner: Campus & Club Artwork linking to portal.
 * 3. Rounded White Body Card: "Hi {{Name}}," in vibrant royal blue, Dynamic Content Area.
 * 4. Sign-off: "Best Regards, Team MSC PRPCEM" with blue accent bar on left; "Be a Force for Good." signature graphic on right.
 * 5. Deep Navy Bottom Footer: Clickable transparent circular social icons (IG, LI, YT, Web) + College attribution text.
 */
const renderHtmlWrapper = ({
  title = 'Microsoft Student Club PRPCEM',
  preheader = '',
  recipientName = '',
  content = '',
  useCid = false,
  baseUrl = '',
  includeGreeting = true
}) => {
  const prefix = baseUrl ? baseUrl.replace(/\/+$/, '') : '';
  const mscLogoSrc = useCid ? 'cid:msc_logo' : 'https://mscprpcem.blob.core.windows.net/email-template/mscprpcemlogo.png';
  const heroBannerSrc = useCid ? 'cid:msc_hero_banner' : 'https://mscprpcem.blob.core.windows.net/email-template/upper%20banner.png';
  const forceForGoodSrc = useCid ? 'cid:msc_force_for_good' : 'https://mscprpcem.blob.core.windows.net/email-template/lower%20banner.png';
  const iconInstagramSrc = useCid ? 'cid:msc_icon_instagram' : (prefix ? `${prefix}/assets/email/icon_instagram.png` : 'https://www.mscprpcem.tech/assets/email/icon_instagram.png');
  const iconLinkedinSrc = useCid ? 'cid:msc_icon_linkedin' : (prefix ? `${prefix}/assets/email/icon_linkedin.png` : 'https://www.mscprpcem.tech/assets/email/icon_linkedin.png');
  const iconYoutubeSrc = useCid ? 'cid:msc_icon_youtube' : (prefix ? `${prefix}/assets/email/icon_youtube.png` : 'https://www.mscprpcem.tech/assets/email/icon_youtube.png');
  const iconWebsiteSrc = useCid ? 'cid:msc_icon_website' : (prefix ? `${prefix}/assets/email/icon_website.png` : 'https://www.mscprpcem.tech/assets/email/icon_website.png');

  const cleanGreeting = recipientName ? recipientName.trim() : 'Student';

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <meta name="format-detection" content="telephone=no" />
  <title>${title}</title>
  <style type="text/css">
    /* Base resets */
    *, *:before, *:after { box-sizing: border-box; }
    body, table, td, a, p, span, div, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; max-width: 100%; height: auto; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; min-width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; overflow-x: hidden; }
    
    /* Responsive phone optimization */
    @media screen and (max-width: 600px) {
      .outer-wrap-table { padding: 8px 4px !important; }
      .email-container { width: 100% !important; max-width: 100% !important; border-radius: 14px !important; }
      .email-nav-td { padding: 16px 18px 12px 18px !important; }
      .email-body-cell { padding: 22px 18px 20px 18px !important; }
      .email-signoff-table td { display: block !important; width: 100% !important; text-align: left !important; }
      .email-signoff-right { margin-top: 14px !important; text-align: left !important; }
      .email-footer-cell { padding: 14px 16px !important; }
      .otp-code-text { font-size: 32px !important; letter-spacing: 6px !important; }
      .mobile-btn { display: block !important; width: 100% !important; max-width: 100% !important; padding: 13px 16px !important; box-sizing: border-box !important; text-align: center !important; }
      .detail-label-cell { width: 34% !important; padding: 7px 5px !important; font-size: 12px !important; }
      .detail-value-cell { width: 66% !important; padding: 7px 5px !important; font-size: 12px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <!-- Anti-Spam Compliant Preheader -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #f1f5f9;">
    ${preheader || title}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="outer-wrap-table" style="background-color: #f1f5f9; padding: 24px 8px; width: 100%; table-layout: fixed; box-sizing: border-box;">
    <tr>
      <td align="center" style="padding: 0;">
        
        <!-- Main Institutional Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); table-layout: fixed; box-sizing: border-box;">
          
          <!-- 1. Top Dynamic Navigation Bar (Official Logo + Links) -->
          <tr>
            <td class="email-nav-td" style="padding: 22px 28px 16px 28px; background-color: #ffffff; border-top-left-radius: 20px; border-top-right-radius: 20px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <!-- Left: Official Transparent Logo + Simplified "MSC PRPCEM" vertically centered -->
                  <td align="left" valign="middle" style="vertical-align: middle;">
                    <a href="https://www.mscprpcem.tech" target="_blank" style="text-decoration: none; display: inline-block; vertical-align: middle;">
                      <table border="0" cellpadding="0" cellspacing="0" style="vertical-align: middle;">
                        <tr>
                          <td valign="middle" style="padding-right: 12px; line-height: 0; vertical-align: middle;">
                            <img src="${mscLogoSrc}" alt="MSC PRPCEM Logo" width="44" height="44" style="display: block; width: 44px; height: 44px; border: 0; outline: none; vertical-align: middle;" />
                          </td>
                          <td valign="middle" style="line-height: 1; vertical-align: middle;">
                            <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.3px; vertical-align: middle; display: inline-block;">
                              MSC PRPCEM
                            </span>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>

                  <!-- Right: "Be a Force for Good." vertically centered & aligned -->
                  <td align="right" valign="middle" style="vertical-align: middle;">
                    <a href="https://www.mscprpcem.tech" target="_blank" style="text-decoration: none; display: inline-block; vertical-align: middle;">
                      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; font-weight: 800; color: #0f172a; letter-spacing: -0.2px; line-height: 1.2;">
                        Be a <span style="color: #2563eb;">Force for Good</span>.
                      </div>
                      <div style="height: 2.5px; width: 64px; background: linear-gradient(90deg, #2563eb, #6366f1); margin: 3px 0 0 auto; border-radius: 2px;"></div>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 2. Hero Banner (Campus & Club Artwork) -->
          <tr>
            <td style="padding: 0; line-height: 0; background-color: #ffffff;">
              <a href="https://www.mscprpcem.tech" target="_blank" style="display: block; text-decoration: none;">
                <img src="${heroBannerSrc}" alt="Microsoft Student Club PRPCEM - A community of curious minds, creating opportunities for a better tomorrow." width="600" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0; outline: none;" />
              </a>
            </td>
          </tr>

          <!-- 3. Dynamic Content Body Area -->
          <tr>
            <td class="email-body-cell" style="padding: 28px 32px 24px 32px; background-color: #ffffff; color: #334155; font-size: 15px; line-height: 1.65; box-sizing: border-box; word-break: break-word;">
              
              ${includeGreeting && cleanGreeting ? `
              <!-- Greeting: Hi {{Name}}, -->
              <p style="margin: 0 0 18px 0; font-size: 19px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                Hi <span style="color: #2563eb; font-weight: 800;">${cleanGreeting}</span>,
              </p>
              ` : ''}

              <!-- Dynamic Content -->
              <div style="font-size: 15px; color: #334155; line-height: 1.65;">
                ${content}
              </div>

              <!-- Sign-off Section -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-signoff-table" style="margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 22px; table-layout: fixed;">
                <tr>
                  <!-- Left: Official Signature -->
                  <td valign="bottom" align="left" style="text-align: left; vertical-align: bottom; width: 62%;">
                    <div style="font-size: 13px; color: #64748b; font-weight: 500; margin-bottom: 3px;">Best Regards,</div>
                    <div style="font-size: 16px; color: #0f172a; font-weight: 800; letter-spacing: -0.2px; margin-bottom: 6px;">Team MSC PRPCEM</div>
                    <div style="height: 3px; width: 42px; background-color: #2563eb; border-radius: 2px; margin-bottom: 10px;"></div>
                    <div style="font-size: 13px; font-weight: 700; color: #1e293b; line-height: 1.3;">Microsoft Student Club PRPCEM</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px; line-height: 1.4;">P. R. Pote (Patil) College of Engineering &amp; Management, Amravati</div>
                  </td>
                  <!-- Right: Be a Force for Good graphic -->
                  <td valign="bottom" align="right" class="email-signoff-right" style="text-align: right; vertical-align: bottom; width: 38%;">
                    <img src="${forceForGoodSrc}" alt="Be a Force for Good." width="155" style="display: inline-block; max-width: 155px; width: 100%; height: auto; border: 0; outline: none;" />
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- 4. Deep Navy Blue Footer Bar (#081630) -->
          <tr>
            <td class="email-footer-cell" style="padding: 16px 24px; background-color: #081630; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; box-sizing: border-box;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <!-- Clean Transparent Circular Social Media Icons on Left (No Gray Background) -->
                  <td align="left" valign="middle" style="line-height: 0;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right: 10px; line-height: 0;">
                          <a href="https://www.instagram.com/mscprpcem/" target="_blank" style="text-decoration: none; display: inline-block;" title="Instagram">
                            <img src="${iconInstagramSrc}" width="30" height="30" alt="Instagram" style="display: block; border: 0; outline: none;" />
                          </a>
                        </td>
                        <td style="padding-right: 10px; line-height: 0;">
                          <a href="https://www.linkedin.com/company/mscprpcem/" target="_blank" style="text-decoration: none; display: inline-block;" title="LinkedIn">
                            <img src="${iconLinkedinSrc}" width="30" height="30" alt="LinkedIn" style="display: block; border: 0; outline: none;" />
                          </a>
                        </td>
                        <td style="padding-right: 10px; line-height: 0;">
                          <a href="https://youtube.com/@mscprpcem" target="_blank" style="text-decoration: none; display: inline-block;" title="YouTube">
                            <img src="${iconYoutubeSrc}" width="30" height="30" alt="YouTube" style="display: block; border: 0; outline: none;" />
                          </a>
                        </td>
                        <td style="padding-right: 14px; line-height: 0;">
                          <a href="https://www.mscprpcem.tech" target="_blank" style="text-decoration: none; display: inline-block;" title="Official Website">
                            <img src="${iconWebsiteSrc}" width="30" height="30" alt="Website" style="display: block; border: 0; outline: none;" />
                          </a>
                        </td>
                        <!-- Vertical Divider -->
                        <td style="border-left: 1px solid rgba(255, 255, 255, 0.2); height: 24px; width: 1px;"></td>
                      </tr>
                    </table>
                  </td>

                  <!-- Organization Details on Right -->
                  <td align="right" valign="middle" style="color: #94a3b8; font-size: 11px; line-height: 1.35; text-align: right;">
                    <a href="https://www.mscprpcem.tech" target="_blank" style="text-decoration: none; color: inherit;">
                      <div style="color: #ffffff; font-weight: 700; font-size: 11px;">Microsoft Student Club PRPCEM</div>
                      <div style="color: #94a3b8; font-size: 10px; margin-top: 1px;">P. R. Pote (Patil) College of Engineering &amp; Management</div>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Send 6-Digit OTP Verification Email (Simple, Clean, and Highly Deliverable)
 */
const sendOtpEmail = async ({ to, name, otp, type = 'registration' }) => {
  const transport = getTransporter();
  const userName = name || (to ? to.split('@')[0] : 'Student');
  const fromAddr = getSenderAddress();
  const replyToAddr = getReplyToAddress();

  let subject = `${otp} is your verification code — MSC PRPCEM`;
  let heading = 'Verification Code';
  let description = 'Use the 6-digit verification code below to complete your verification:';

  if (type === 'password_reset') {
    subject = `${otp} is your password reset code — MSC PRPCEM`;
    heading = 'Password Reset Code';
    description = 'Use the 6-digit code below to reset your password:';
  } else if (type === 'login') {
    subject = `${otp} is your login code — MSC PRPCEM`;
    heading = 'Security Login Code';
    description = 'Use the 6-digit code below to sign in to your account:';
  } else if (type === 'quiz') {
    subject = `${otp} is your quiz access code — MSC PRPCEM`;
    heading = 'Quiz Access Code';
    description = 'Use the 6-digit code below to access your quiz:';
  }

  const html = renderHtmlWrapper({
    title: heading,
    preheader: `Your verification code is ${otp}. Valid for 15 minutes.`,
    recipientName: userName,
    content: `
      <p style="font-size: 15px; color: #334155; margin: 0 0 18px 0; line-height: 1.6;">${description}</p>
      
      <!-- OTP Box -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; table-layout: fixed; box-sizing: border-box;">
        <tr>
          <td align="center" style="background-color: #eff6ff; border: 2px dashed #2563eb; border-radius: 14px; padding: 24px 16px; box-sizing: border-box;">
            <div class="otp-code-text" style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #1d4ed8; line-height: 1.1; margin: 0 auto; text-align: center;">
              ${otp}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-top: 10px; font-weight: 600; line-height: 1.4;">
              ⏱️ Valid for 15 minutes • Do not share this code
            </div>
          </td>
        </tr>
      </table>

      <p style="font-size: 13px; color: #64748b; margin-top: 20px; margin-bottom: 0; line-height: 1.5;">
        If you did not request this verification code, you can safely ignore this email.
      </p>
    `
  });

  const plainText = `Hi ${userName},\n\nYour 6-digit verification code is: ${otp}\n\nThis code is valid for 15 minutes.\nIf you did not request this code, please ignore this email.\n\n—\nBest Regards,\nTeam MSC PRPCEM\nMicrosoft Student Club PRPCEM\nP. R. Pote (Patil) College of Engineering & Management, Amravati\nSupport: ${replyToAddr}`;

  return transport.sendMail({
    from: fromAddr,
    to: to.trim(),
    replyTo: replyToAddr,
    subject,
    text: plainText,
    html,
    attachments: [],
    messageId: generateMessageId(fromAddr),
    headers: {
      'X-Priority': '1', // High priority for OTP
      'X-MSMail-Priority': 'High',
      'Importance': 'High',
      'X-Mailer': 'MSC-PRPCEM-Platform'
    }
  });
};

/**
 * Send Scheduled Quiz Reminder Email
 */
const sendQuizReminderEmail = async ({ to, name, quizTitle, eventName, startTime, directUrl, joinCode }) => {
  const transport = getTransporter();
  const userName = name || (to ? to.split('@')[0] : 'Learner');
  const fromAddr = getSenderAddress();
  const replyToAddr = getReplyToAddress();
  const dateStr = startTime ? new Date(startTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : 'Soon';
  const targetQuizTitle = quizTitle || 'Live Assessment';
  const quizUrl = directUrl || 'https://quiz.mscprpcem.tech';

  const html = renderHtmlWrapper({
    title: 'Quiz Reminder',
    preheader: `Reminder: ${targetQuizTitle} is starting soon — join code: ${joinCode || 'LIVE'}`,
    recipientName: userName,
    content: `
      <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
        Get ready! Your scheduled challenge <strong>${targetQuizTitle}</strong>${eventName ? ` (${eventName})` : ''} is starting soon.
      </p>
      
      <!-- Quiz Schedule Box -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; table-layout: fixed; box-sizing: border-box;">
        <tr>
          <td style="padding: 18px 20px; word-break: break-word;">
            <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>📅 Start Time:</strong> ${dateStr} (IST)</p>
            <p style="margin: 8px 0 4px 0; color: #334155; font-size: 14px;">
              <strong>🔑 Join Code:</strong> 
              <code style="background-color: #eff6ff; color: #1d4ed8; padding: 3px 8px; border-radius: 4px; font-size: 15px; font-weight: 800; letter-spacing: 1px; font-family: monospace; display: inline-block;">${joinCode || 'LIVE'}</code>
            </p>
            ${eventName ? `<p style="margin: 8px 0 4px 0; color: #64748b; font-size: 13px;"><strong>🏷️ Event:</strong> ${eventName}</p>` : ''}
          </td>
        </tr>
      </table>

      <!-- Action Button -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; table-layout: fixed;">
        <tr>
          <td align="center">
            <a href="${quizUrl}" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); text-align: center;">
              Start / Join Quiz Now &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 0; word-break: break-all;">
        Direct link: <a href="${quizUrl}" style="color: #2563eb;">${quizUrl}</a>
      </p>
    `
  });

  const plainText = `Hi ${userName},\n\nYour quiz "${targetQuizTitle}" is starting at ${dateStr} (IST).\nJoin Code: ${joinCode || 'LIVE'}\nDirect Link: ${quizUrl}\n\nGood luck!\n\n—\nBest Regards,\nTeam MSC PRPCEM\nMicrosoft Student Club PRPCEM\nP. R. Pote (Patil) College of Engineering & Management, Amravati\nSupport: ${replyToAddr}`;

  return transport.sendMail({
    from: fromAddr,
    to: to.trim(),
    replyTo: replyToAddr,
    subject: `Reminder: ${targetQuizTitle} — Starting ${dateStr}`,
    text: plainText,
    html,
    attachments: [],
    messageId: generateMessageId(fromAddr),
    headers: {
      'X-Mailer': 'MSC-PRPCEM-Platform',
      'List-Unsubscribe': `<mailto:${replyToAddr}?subject=unsubscribe>`
    }
  });
};

/**
 * Send Instant Event Registration Confirmation Email
 * Used when a student registers on mscprpcem-website or the Quiz Platform.
 */
const sendEventRegistrationEmail = async ({
  to,
  name,
  eventName,
  eventDate,
  eventVenue,
  registrationId,
  college,
  branch,
  year,
  tracks = [],
  directUrl
}) => {
  const transport = getTransporter();
  const userName = name || (to ? to.split('@')[0] : 'Student');
  const fromAddr = getSenderAddress();
  const replyToAddr = getReplyToAddress();
  const targetEventName = eventName || 'MSC PRPCEM Event';
  const portalUrl = directUrl || 'https://www.mscprpcem.tech';

  let tracksHtml = '';
  let tracksPlainText = '';
  if (tracks && tracks.length > 0) {
    tracksHtml = `
      <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; box-sizing: border-box; width: 100%;">
        <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
          Included Assessment Tracks / Quizzes
        </p>
        ${tracks.map(t => `
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 8px; word-break: break-word;">
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
              ${t.title}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: ${t.direct_url ? '6px' : '0'};">
              Join Code: <code style="background-color: #eff6ff; color: #1d4ed8; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 12px; font-family: monospace;">${t.join_code || 'LIVE'}</code>
            </div>
            ${t.direct_url ? `<div><a href="${t.direct_url}" target="_blank" style="color: #2563eb; font-size: 12px; font-weight: 600; text-decoration: none;">Launch Assessment &rarr;</a></div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
    tracksPlainText = `\nIncluded Assessment Tracks:\n` + tracks.map(t => `• ${t.title} (Join Code: ${t.join_code || 'LIVE'})${t.direct_url ? ` - Link: ${t.direct_url}` : ''}`).join('\n') + '\n';
  }

  // Summary table rows
  const detailRows = [
    `<tr>
      <td class="detail-label-cell" style="padding: 9px 12px; color: #64748b; font-size: 13px; width: 32%; border-bottom: 1px solid #f1f5f9; vertical-align: top;">Event</td>
      <td class="detail-value-cell" style="padding: 9px 12px; color: #0f172a; font-size: 13px; font-weight: 600; width: 68%; border-bottom: 1px solid #f1f5f9; vertical-align: top;">${targetEventName}</td>
    </tr>`,
    `<tr>
      <td class="detail-label-cell" style="padding: 9px 12px; color: #64748b; font-size: 13px; width: 32%; border-bottom: 1px solid #f1f5f9; vertical-align: top;">Participant</td>
      <td class="detail-value-cell" style="padding: 9px 12px; color: #0f172a; font-size: 13px; font-weight: 600; width: 68%; border-bottom: 1px solid #f1f5f9; vertical-align: top;">${userName}</td>
    </tr>`,
    college ? `<tr>
      <td class="detail-label-cell" style="padding: 9px 12px; color: #64748b; font-size: 13px; width: 32%; border-bottom: 1px solid #f1f5f9; vertical-align: top;">College</td>
      <td class="detail-value-cell" style="padding: 9px 12px; color: #334155; font-size: 13px; width: 68%; border-bottom: 1px solid #f1f5f9; vertical-align: top;">${college}</td>
    </tr>` : '',
    (branch || year) ? `<tr>
      <td class="detail-label-cell" style="padding: 9px 12px; color: #64748b; font-size: 13px; width: 32%; border-bottom: 1px solid #f1f5f9; vertical-align: top;">Branch / Year</td>
      <td class="detail-value-cell" style="padding: 9px 12px; color: #334155; font-size: 13px; width: 68%; border-bottom: 1px solid #f1f5f9; vertical-align: top;">${[branch, year].filter(Boolean).join(' • ')}</td>
    </tr>` : '',
    registrationId ? `<tr>
      <td class="detail-label-cell" style="padding: 9px 12px; color: #64748b; font-size: 13px; width: 32%; border-bottom: 1px solid #f1f5f9; vertical-align: top;">Registration ID</td>
      <td class="detail-value-cell" style="padding: 9px 12px; color: #2563eb; font-size: 13px; font-weight: 700; font-family: monospace; width: 68%; border-bottom: 1px solid #f1f5f9; vertical-align: top;">${registrationId}</td>
    </tr>` : '',
    eventDate ? `<tr>
      <td class="detail-label-cell" style="padding: 9px 12px; color: #64748b; font-size: 13px; width: 32%; border-bottom: 1px solid #f1f5f9; vertical-align: top;">Date &amp; Time</td>
      <td class="detail-value-cell" style="padding: 9px 12px; color: #334155; font-size: 13px; width: 68%; border-bottom: 1px solid #f1f5f9; vertical-align: top;">${eventDate}</td>
    </tr>` : '',
    eventVenue ? `<tr>
      <td class="detail-label-cell" style="padding: 9px 12px; color: #64748b; font-size: 13px; width: 32%; border-bottom: 1px solid #f1f5f9; vertical-align: top;">Venue</td>
      <td class="detail-value-cell" style="padding: 9px 12px; color: #334155; font-size: 13px; width: 68%; border-bottom: 1px solid #f1f5f9; vertical-align: top;">${eventVenue}</td>
    </tr>` : ''
  ].filter(Boolean).join('');

  const html = renderHtmlWrapper({
    title: 'Registration Confirmed',
    preheader: `You are registered for ${targetEventName} — MSC PRPCEM`,
    recipientName: userName,
    content: `
      <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
        Your registration for <strong>${targetEventName}</strong> has been successfully confirmed. We look forward to seeing you at the event!
      </p>

      <!-- Registration Summary Card -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; table-layout: fixed; box-sizing: border-box;">
        <tr>
          <td style="padding: 10px 14px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
            Registration Details
          </td>
        </tr>
        <tr>
          <td style="padding: 4px 2px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
              ${detailRows}
            </table>
          </td>
        </tr>
      </table>

      ${tracksHtml}

      <!-- Action Button -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; table-layout: fixed;">
        <tr>
          <td align="center">
            <a href="${portalUrl}" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); text-align: center;">
              Access Student Portal &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin-bottom: 0;">
        Please keep this confirmation for your records. For questions or updates, reach out to our team at
        <a href="mailto:${replyToAddr}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${replyToAddr}</a>.
      </p>
    `
  });

  const plainText = `Hi ${userName},\n\nYour registration for ${targetEventName} has been confirmed!\n\nRegistration Details:\n• Event: ${targetEventName}\n• Participant: ${userName}${registrationId ? `\n• Registration ID: ${registrationId}` : ''}${college ? `\n• College: ${college}` : ''}${branch || year ? `\n• Branch/Year: ${[branch, year].filter(Boolean).join(' - ')}` : ''}${eventDate ? `\n• Date: ${eventDate}` : ''}${eventVenue ? `\n• Venue: ${eventVenue}` : ''}\n${tracksPlainText}\nAccess Portal: ${portalUrl}\n\nWe look forward to seeing you!\n\n—\nBest Regards,\nTeam MSC PRPCEM\nMicrosoft Student Club PRPCEM\nP. R. Pote (Patil) College of Engineering & Management, Amravati\nSupport: ${replyToAddr}`;

  return transport.sendMail({
    from: fromAddr,
    to: to.trim(),
    replyTo: replyToAddr,
    subject: `Registration Confirmed: ${targetEventName} — MSC PRPCEM`,
    text: plainText,
    html,
    attachments: [],
    messageId: generateMessageId(fromAddr),
    headers: {
      'X-Mailer': 'MSC-PRPCEM-Platform',
      'List-Unsubscribe': `<mailto:${replyToAddr}?subject=unsubscribe>`
    }
  });
};

/**
 * Send Custom Admin Broadcast / Notification Email
 */
const sendCustomBroadcastEmail = async ({ to, recipientName, subject, heading, messageHtml, ctaText, ctaUrl, includeGreeting = false }) => {
  const transport = getTransporter();
  const userName = recipientName || (to ? to.split('@')[0] : 'Learner');
  const fromAddr = getSenderAddress();
  const replyToAddr = getReplyToAddress();

  let actionButtonHtml = '';
  if (ctaText && ctaUrl) {
    actionButtonHtml = `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; table-layout: fixed;">
        <tr>
          <td align="center">
            <a href="${ctaUrl}" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); text-align: center;">
              ${ctaText} &rarr;
            </a>
          </td>
        </tr>
      </table>
      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0 0 16px 0; word-break: break-all;">
        Link: <a href="${ctaUrl}" style="color: #2563eb;">${ctaUrl}</a>
      </p>
    `;
  }

  // Preserve custom messageHtml exactly as authored without stripping or forcing greetings
  const finalMessageHtml = messageHtml || '';

  const html = renderHtmlWrapper({
    title: heading || subject || 'MSC PRPCEM Announcement',
    preheader: subject,
    recipientName: userName,
    includeGreeting: Boolean(includeGreeting),
    content: `
      <div style="font-size: 15px; color: #334155; line-height: 1.7; margin: 12px 0; word-break: break-word;">
        ${finalMessageHtml}
      </div>
      ${actionButtonHtml}
    `
  });

  const bodyText = (messageHtml || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  const plainText = `${includeGreeting && userName ? `Hi ${userName},\n\n` : ''}${bodyText}\n\n${ctaText && ctaUrl ? `${ctaText}: ${ctaUrl}\n\n` : ''}—\nBest Regards,\nTeam MSC PRPCEM\nMicrosoft Student Club PRPCEM\nP. R. Pote (Patil) College of Engineering & Management, Amravati\nSupport: ${replyToAddr}`;

  return transport.sendMail({
    from: fromAddr,
    to: to.trim(),
    replyTo: replyToAddr,
    subject: subject || 'MSC PRPCEM Announcement',
    text: plainText,
    html,
    attachments: [],
    messageId: generateMessageId(fromAddr),
    headers: {
      'X-Mailer': 'MSC-PRPCEM-Platform',
      'List-Unsubscribe': `<mailto:${replyToAddr}?subject=unsubscribe>`
    }
  });
};

/**
 * Send Comprehensive Test Email to verify the standard email template delivery
 */
const sendTestEmail = async ({ to = 'mlsc@prpotepatilengg.ac.in', name = 'Team MSC PRPCEM' } = {}) => {
  const transport = getTransporter();
  const fromAddr = getSenderAddress();
  const replyToAddr = getReplyToAddress();

  const testContent = `
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
      This is a live test transmission of the <strong>official standardized MSC PRPCEM email template</strong>.
    </p>

    <!-- Template Features Card -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; table-layout: fixed; box-sizing: border-box;">
      <tr>
        <td style="padding: 10px 14px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
          Standard Template Specifications
        </td>
      </tr>
      <tr>
        <td style="padding: 14px 16px; font-size: 13px; color: #334155; line-height: 1.6;">
          <div style="margin-bottom: 6px;">🎨 <strong>Header Banner:</strong> MSC Hexagon branding &amp; PRPCEM Campus illustration</div>
          <div style="margin-bottom: 6px;">👤 <strong>Greeting:</strong> Personalized <code style="color: #2563eb; font-weight: 700;">Hi {{Name}},</code> matching official brand guideline</div>
          <div style="margin-bottom: 6px;">📦 <strong>Dynamic Area:</strong> Responsive container for OTP, Quiz reminders, Registrations, &amp; Broadcasts</div>
          <div style="margin-bottom: 6px;">✍️ <strong>Signature:</strong> Team MSC PRPCEM sign-off with <em style="color:#2563eb;">Be a Force for Good.</em> graphic</div>
          <div>🌐 <strong>Footer Bar:</strong> Deep navy (#081630) with clickable social links (IG, LI, YT, Web)</div>
        </td>
      </tr>
    </table>

    <!-- Sample Dynamic OTP Display -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; table-layout: fixed; box-sizing: border-box;">
      <tr>
        <td align="center" style="background-color: #eff6ff; border: 2px dashed #2563eb; border-radius: 14px; padding: 20px 16px; box-sizing: border-box;">
          <div style="font-family: 'SFMono-Regular', Consolas, monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #1d4ed8; line-height: 1.1; margin: 0 auto; text-align: center;">
            202601
          </div>
          <div style="font-size: 12px; color: #64748b; margin-top: 8px; font-weight: 600;">
            🧪 Sample Dynamic Verification Code Demonstration
          </div>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; table-layout: fixed;">
      <tr>
        <td align="center">
          <a href="https://quiz.mscprpcem.tech" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); text-align: center;">
            Launch Assessment Portal &rarr;
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 0;">
      Sent to <strong>${to}</strong> for platform standard verification.
    </p>
  `;

  const html = renderHtmlWrapper({
    title: 'Platform Standard Email Template Test',
    preheader: 'Official MSC PRPCEM Email Template Verification Test',
    recipientName: name,
    content: testContent
  });

  const plainText = `Hi ${name},\n\nThis is a live test transmission of the official standardized MSC PRPCEM email template sent to ${to}.\n\nPlatform URL: https://quiz.mscprpcem.tech\n\n—\nBest Regards,\nTeam MSC PRPCEM\nMicrosoft Student Club PRPCEM\nP. R. Pote (Patil) College of Engineering & Management, Amravati\nSupport: ${replyToAddr}`;

  return transport.sendMail({
    from: fromAddr,
    to: to.trim(),
    replyTo: replyToAddr,
    subject: 'MSC PRPCEM — Official Platform Email Template Test',
    text: plainText,
    html,
    attachments: [],
    messageId: generateMessageId(fromAddr),
    headers: {
      'X-Priority': '1',
      'X-Mailer': 'MSC-PRPCEM-Platform'
    }
  });
};

module.exports = {
  renderHtmlWrapper,
  getEmailAttachments,
  sendOtpEmail,
  sendQuizReminderEmail,
  sendEventRegistrationEmail,
  sendCustomBroadcastEmail,
  sendTestEmail,
  getTransporter,
  verifyEmailConfiguration
};


