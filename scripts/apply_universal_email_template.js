const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Universal Email Template Synchronization Across All Platforms...');

// =========================================================================
// 1. UPDATE event-platform: D:/event-platform/backend/src/services/emailService.js
// =========================================================================
const eventPlatformEmailServicePath = 'D:/event-platform/backend/src/services/emailService.js';

if (fs.existsSync(path.dirname(eventPlatformEmailServicePath))) {
  const eventPlatformCode = `import nodemailer from 'nodemailer';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Singleton Transporter Instance
let transporter = null;

/**
 * Resolve sender address dynamically to prevent SPF/DMARC flags
 */
export const getSenderAddress = () => {
  if (process.env.EMAIL_FROM && process.env.EMAIL_FROM.trim()) {
    return process.env.EMAIL_FROM.trim();
  }
  const user = process.env.SMTP_USER;
  if (user && user.includes('@')) {
    return \`"Microsoft Student Club PRPCEM" <\${user.trim()}>\`;
  }
  return '"Microsoft Student Club PRPCEM" <mlsc@prpotepatilengg.ac.in>';
};

/**
 * Resolve default Reply-To address
 */
export const getReplyToAddress = () => {
  return process.env.REPLY_TO || process.env.SMTP_USER || 'mlsc@prpotepatilengg.ac.in';
};

/**
 * Generate RFC 5322 compliant Message-ID
 */
export const generateMessageId = (senderEmail) => {
  const domain = (senderEmail && senderEmail.includes('@'))
    ? senderEmail.split('@')[1].replace(/[<>]/g, '').trim()
    : 'prpotepatilengg.ac.in';
  return \`<\${Date.now()}.\${crypto.randomBytes(8).toString('hex')}@\${domain}>\`;
};

/**
 * Returns inline CID attachments for all email templates
 */
export const getEmailAttachments = () => {
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
 * Create Nodemailer transporter with connection pooling and dev fallback
 */
export const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    const config = {
      host: host.trim(),
      port,
      secure,
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 30000,
      tls: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: process.env.SMTP_IGNORE_TLS === 'true' ? false : (process.env.NODE_ENV === 'production'),
      },
    };

    if (port === 587) {
      config.requireTLS = true;
    }

    const transport = nodemailer.createTransport(config);

    transport.verify((error) => {
      if (error) {
        console.warn('⚠️ [EMAIL SERVICE] SMTP Connection verification warning:', error.message);
      } else {
        console.log(\`✅ [EMAIL SERVICE] Connected securely to SMTP server: \${host}:\${port} (\${user})\`);
      }
    });

    return transport;
  }

  // Development / Test Mock Transporter
  return {
    sendMail: async (mailOptions) => {
      console.log('\\n---------------- EMAIL BROADCAST (DEV / MOCK MODE) ----------------');
      console.log(\`To: \${mailOptions.to}\`);
      console.log(\`Subject: \${mailOptions.subject}\`);
      console.log(\`From: \${mailOptions.from || getSenderAddress()}\`);
      console.log(\`Reply-To: \${mailOptions.replyTo || getReplyToAddress()}\`);
      console.log('Snippet:', (mailOptions.text || mailOptions.html || '').substring(0, 160) + '...');
      console.log('-------------------------------------------------------------------\\n');
      return {
        messageId: \`mock_\${crypto.randomBytes(8).toString('hex')}\`,
        response: '250 Mock Email Broadcast Dispatched',
      };
    },
  };
};

export const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

/**
 * Replace personalized template placeholders
 */
export const replacePlaceholders = (text, data = {}) => {
  if (!text) return '';
  return String(text)
    .replace(/\\{name\\}/gi, data.name || data.fullName || data.full_name || 'Attendee')
    .replace(/\\{email\\}/gi, data.email || '')
    .replace(/\\{event_name\\}/gi, data.event_name || data.eventName || data.eventTitle || 'College Event')
    .replace(/\\{ticket_type\\}/gi, data.ticket_type || data.ticketType || 'Standard Pass')
    .replace(/\\{roll_no\\}/gi, data.roll_no || data.rollNo || data.id || 'N/A')
    .replace(/\\{college\\}/gi, data.college || 'P. R. Pote (Patil) College of Engineering & Management')
    .replace(/\\{branch\\}/gi, data.branch || 'Engineering & Technology')
    .replace(/\\{venue\\}/gi, data.venue || 'PRPCEM Campus, Amravati')
    .replace(/\\{date\\}/gi, data.date || 'Upcoming')
    .replace(/\\{status\\}/gi, data.status || 'Confirmed');
};

/**
 * Official Standard MSC PRPCEM HTML Email Template Wrapper
 */
export const renderHtmlWrapper = ({
  title = 'Microsoft Student Club PRPCEM',
  preheader = '',
  recipientName = '',
  content = '',
  useCid = true,
  baseUrl = ''
}) => {
  const prefix = baseUrl ? baseUrl.replace(/\\/+$/, '') : '';
  const mscLogoSrc = useCid ? 'cid:msc_logo' : \`\${prefix}/assets/email/msc_logo.png\`;
  const heroBannerSrc = useCid ? 'cid:msc_hero_banner' : \`\${prefix}/assets/email/email_hero_banner.png\`;
  const forceForGoodSrc = useCid ? 'cid:msc_force_for_good' : \`\${prefix}/assets/email/email_force_for_good.png\`;
  const iconInstagramSrc = useCid ? 'cid:msc_icon_instagram' : \`\${prefix}/assets/email/icon_instagram.png\`;
  const iconLinkedinSrc = useCid ? 'cid:msc_icon_linkedin' : \`\${prefix}/assets/email/icon_linkedin.png\`;
  const iconYoutubeSrc = useCid ? 'cid:msc_icon_youtube' : \`\${prefix}/assets/email/icon_youtube.png\`;
  const iconWebsiteSrc = useCid ? 'cid:msc_icon_website' : \`\${prefix}/assets/email/icon_website.png\`;

  const cleanGreeting = recipientName ? recipientName.trim() : 'Learner';

  return \`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <meta name="format-detection" content="telephone=no" />
  <title>\${title}</title>
  <style type="text/css">
    *, *:before, *:after { box-sizing: border-box; }
    body, table, td, a, p, span, div, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; max-width: 100%; height: auto; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; min-width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; overflow-x: hidden; }
    
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
    \${preheader || title}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
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
                            <img src="\${mscLogoSrc}" alt="MSC PRPCEM Logo" width="44" height="44" style="display: block; width: 44px; height: 44px; border: 0; outline: none; vertical-align: middle;" />
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
                <img src="\${heroBannerSrc}" alt="Microsoft Student Club PRPCEM - A community of curious minds, creating opportunities for a better tomorrow." width="600" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0; outline: none;" />
              </a>
            </td>
          </tr>

          <!-- 3. Dynamic Content Body Area -->
          <tr>
            <td class="email-body-cell" style="padding: 28px 32px 24px 32px; background-color: #ffffff; color: #334155; font-size: 15px; line-height: 1.65; box-sizing: border-box; word-break: break-word;">
              
              <!-- Greeting: Hi {{Name}}, -->
              <p style="margin: 0 0 18px 0; font-size: 19px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                Hi <span style="color: #2563eb; font-weight: 800;">\${cleanGreeting}</span>,
              </p>

              <!-- Dynamic Content -->
              <div style="font-size: 15px; color: #334155; line-height: 1.65;">
                \${content}
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
                    <img src="\${forceForGoodSrc}" alt="Be a Force for Good." width="155" style="display: inline-block; max-width: 155px; width: 100%; height: auto; border: 0; outline: none;" />
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
                            <img src="\${iconInstagramSrc}" width="30" height="30" alt="Instagram" style="display: block; border: 0; outline: none;" />
                          </a>
                        </td>
                        <td style="padding-right: 10px; line-height: 0;">
                          <a href="https://www.linkedin.com/company/mscprpcem/" target="_blank" style="text-decoration: none; display: inline-block;" title="LinkedIn">
                            <img src="\${iconLinkedinSrc}" width="30" height="30" alt="LinkedIn" style="display: block; border: 0; outline: none;" />
                          </a>
                        </td>
                        <td style="padding-right: 10px; line-height: 0;">
                          <a href="https://youtube.com/@mscprpcem" target="_blank" style="text-decoration: none; display: inline-block;" title="YouTube">
                            <img src="\${iconYoutubeSrc}" width="30" height="30" alt="YouTube" style="display: block; border: 0; outline: none;" />
                          </a>
                        </td>
                        <td style="padding-right: 14px; line-height: 0;">
                          <a href="https://www.mscprpcem.tech" target="_blank" style="text-decoration: none; display: inline-block;" title="Official Website">
                            <img src="\${iconWebsiteSrc}" width="30" height="30" alt="Website" style="display: block; border: 0; outline: none;" />
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
</html>\`;
};

/**
 * Send Custom Broadcast Email to Attendee
 */
export const sendCustomBroadcastEmail = async ({
  to,
  recipientName,
  subject,
  heading,
  messageHtml,
  ctaText,
  ctaUrl,
  eventName = 'PRPCEM Events',
}) => {
  const transport = getTransporter();
  const userName = recipientName || (to ? to.split('@')[0] : 'Attendee');
  const fromAddr = getSenderAddress();
  const replyToAddr = getReplyToAddress();

  let actionButtonHtml = '';
  if (ctaText && ctaUrl) {
    actionButtonHtml = \`
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; table-layout: fixed;">
        <tr>
          <td align="center">
            <a href="\${ctaUrl}" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); text-align: center;">
              \${ctaText} &rarr;
            </a>
          </td>
        </tr>
      </table>
      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0 0 16px 0; word-break: break-all;">
        Link: <a href="\${ctaUrl}" style="color: #2563eb;">\${ctaUrl}</a>
      </p>
    \`;
  }

  // Remove duplicate greetings if already present in messageHtml
  let cleanedMessageHtml = messageHtml || '';
  cleanedMessageHtml = cleanedMessageHtml.replace(/^(<p[^>]*>)?\\s*(hello|hi|dear|greetings)\\s+[^,<]+[,!:]?\\s*(<\\/p>)?/i, '');

  const html = renderHtmlWrapper({
    title: heading || subject || \`\${eventName} Announcement\`,
    preheader: subject,
    recipientName: userName,
    content: \`
      <div style="font-size: 15px; color: #334155; line-height: 1.7; margin: 12px 0; word-break: break-word;">
        \${cleanedMessageHtml}
      </div>
      \${actionButtonHtml}
    \`,
  });

  const plainText = \`Hi \${userName},\\n\\n\${(messageHtml || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()}\\n\\n\${
    ctaText && ctaUrl ? \`\${ctaText}: \${ctaUrl}\\n\\n\` : ''
  }—\\nBest Regards,\\nTeam MSC PRPCEM\\nMicrosoft Student Club PRPCEM\\nP. R. Pote (Patil) College of Engineering & Management, Amravati\\nSupport: \${replyToAddr}\`;

  return transport.sendMail({
    from: fromAddr,
    to: to.trim(),
    replyTo: replyToAddr,
    subject: subject || \`\${eventName} Announcement\`,
    text: plainText,
    html,
    attachments: getEmailAttachments(),
    messageId: generateMessageId(fromAddr),
    headers: {
      'X-Mailer': 'PRPCEM-EventPlatform',
      'List-Unsubscribe': \`<mailto:\${replyToAddr}?subject=unsubscribe>\`,
    },
  });
};

/**
 * Send Event Team Member Invitation & Setup Email
 */
export const sendTeamInviteEmail = async ({
  to,
  recipientName,
  role,
  roleTitle,
  eventName = 'College Event',
  eventDate = 'Upcoming',
  eventVenue = 'PRPCEM Campus, Amravati',
  setupUrl,
  customNote = '',
}) => {
  const transport = getTransporter();
  const userName = recipientName || to.split('@')[0];
  const fromAddr = getSenderAddress();
  const replyToAddr = getReplyToAddress();

  const isNoDownloads = role === 'ADMIN_NO_DOWNLOADS' || role === 'CHECK_IN_NO_DOWNLOADS';
  const isAdmin = role === 'ADMIN' || role === 'ADMIN_NO_DOWNLOADS';

  const roleBadgeColor = isAdmin
    ? (isNoDownloads ? '#4f46e5' : '#7c3aed')
    : (isNoDownloads ? '#d97706' : '#059669');

  const content = \`
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
      You have been assigned to the organizing team for <strong>\${eventName}</strong> at <strong>\${eventVenue}</strong> (\${eventDate}).
    </p>

    <!-- Role Summary Box -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; table-layout: fixed; box-sizing: border-box;">
      <tr>
        <td style="padding: 14px 18px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td>
                <span style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
                  Assigned Team Role
                </span>
              </td>
              <td align="right">
                <span style="display: inline-block; padding: 4px 14px; font-size: 11px; font-weight: 800; border-radius: 20px; color: #ffffff; background-color: \${roleBadgeColor};">
                  \${roleTitle || role}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 18px;">
          <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; color: #1e293b;">
            Configured Permissions &amp; Access Controls:
          </p>
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; color: #334155;">
            <tr>
              <td style="padding: 5px 0; color: #16a34a; font-weight: 700; width: 22px;">&#10003;</td>
              <td style="padding: 5px 0;">Event Workspace &amp; Live Monitoring Access</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: #16a34a; font-weight: 700;">&#10003;</td>
              <td style="padding: 5px 0;">Ticket Scanner &amp; Rapid Attendee Check-in Desk</td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: \${isAdmin ? '#16a34a' : '#64748b'}; font-weight: 700;">
                \${isAdmin ? '&#10003;' : '&#8226;'}
              </td>
              <td style="padding: 5px 0; color: \${isAdmin ? '#334155' : '#64748b'};">
                \${isAdmin ? 'Event Details &amp; Operational Management' : 'Focused Check-in &amp; Scanner Role'}
              </td>
            </tr>
            <tr>
              <td style="padding: 5px 0; color: \${isNoDownloads ? '#dc2626' : '#16a34a'}; font-weight: 700;">
                \${isNoDownloads ? '&#10005;' : '&#10003;'}
              </td>
              <td style="padding: 5px 0; color: \${isNoDownloads ? '#dc2626; font-weight: 600;' : '#334155;'};">
                \${isNoDownloads ? 'Attendee Data Downloads &amp; Exports Restricted (No Downloads Policy)' : 'Full Attendee Data &amp; Ticket Pass Downloads Allowed'}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    \${customNote ? \`
      <div style="margin: 16px 0; padding: 12px 16px; background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 8px; font-size: 13px; color: #1e40af;">
        <strong>Note from Lead Organizer:</strong> \${customNote}
      </div>
    \` : ''}

    <p style="font-size: 14px; color: #334155; line-height: 1.6;">
      Please complete your account setup and confirm your permissions to start your work for <strong>\${eventName}</strong>.
    </p>

    <!-- Action Button -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; table-layout: fixed;">
      <tr>
        <td align="center">
          <a href="\${setupUrl}" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); text-align: center;">
            Complete Setup &amp; Start Work &rarr;
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0 0 16px 0; word-break: break-all;">
      Setup Link: <a href="\${setupUrl}" style="color: #2563eb;">\${setupUrl}</a>
    </p>
  \`;

  const html = renderHtmlWrapper({
    title: \`Team Invitation: \${roleTitle || role}\`,
    preheader: \`You have been assigned as \${roleTitle || role} for \${eventName}\`,
    recipientName: userName,
    content,
  });

  const plainText = \`Hi \${userName},\\n\\nYou have been invited to join the organizing team for "\${eventName}" as \${roleTitle || role}.\\n\\nRole & Permissions:\\n• Role: \${roleTitle || role}\\n• Check-in Scanner: Enabled\\n• Attendee Downloads: \${isNoDownloads ? 'Restricted (No Downloads)' : 'Allowed'}\\n\\nComplete your setup to start work: \${setupUrl}\\n\\n—\\nBest Regards,\\nTeam MSC PRPCEM\\nMicrosoft Student Club PRPCEM\\nP. R. Pote (Patil) College of Engineering & Management, Amravati\\nSupport: \${replyToAddr}\`;

  return transport.sendMail({
    from: fromAddr,
    to: to.trim(),
    replyTo: replyToAddr,
    subject: \`Team Invitation: Assigned as \${roleTitle || role} for \${eventName}\`,
    text: plainText,
    html,
    attachments: getEmailAttachments(),
    messageId: generateMessageId(fromAddr),
  });
};

/**
 * Send Role / Permissions Updated Email
 */
export const sendTeamRoleUpdatedEmail = async ({
  to,
  recipientName,
  role,
  roleTitle,
  eventName = 'College Event',
  setupUrl,
}) => {
  const transport = getTransporter();
  const userName = recipientName || to.split('@')[0];
  const fromAddr = getSenderAddress();
  const replyToAddr = getReplyToAddress();

  const isNoDownloads = role === 'ADMIN_NO_DOWNLOADS' || role === 'CHECK_IN_NO_DOWNLOADS';

  const content = \`
    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
      Your permissions for <strong>\${eventName}</strong> have been updated by the Lead Organizer.
    </p>
    <p style="font-size: 15px; color: #334155; line-height: 1.6;">
      Your new active role is: <strong>\${roleTitle || role}</strong>.
      \${isNoDownloads ? '<br/><span style="color: #dc2626; font-weight: 600;">Note: Attendee data download permissions are restricted under this role.</span>' : ''}
    </p>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 22px 0;">
      <tr>
        <td align="center">
          <a href="\${setupUrl}" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">
            Access Workspace &rarr;
          </a>
        </td>
      </tr>
    </table>
  \`;

  const html = renderHtmlWrapper({
    title: \`Role Updated: \${roleTitle || role}\`,
    preheader: \`Your role for \${eventName} has been updated to \${roleTitle || role}\`,
    recipientName: userName,
    content,
  });

  return transport.sendMail({
    from: fromAddr,
    to: to.trim(),
    replyTo: replyToAddr,
    subject: \`Permissions Updated: Assigned as \${roleTitle || role} for \${eventName}\`,
    text: \`Hi \${userName},\\n\\nYour role for "\${eventName}" has been updated to \${roleTitle || role}.\\n\\nAccess your workspace here: \${setupUrl}\\n\\n—\\nBest Regards,\\nTeam MSC PRPCEM\\nMicrosoft Student Club PRPCEM\\nP. R. Pote (Patil) College of Engineering & Management, Amravati\\nSupport: \${replyToAddr}\`,
    html,
    attachments: getEmailAttachments(),
    messageId: generateMessageId(fromAddr),
  });
};

/**
 * Send Instant Event Registration / Ticket Confirmation Email
 */
export const sendEventRegistrationEmail = async ({
  to,
  name,
  eventName,
  eventDate,
  eventVenue,
  registrationId,
  ticketType = 'Standard Attendee Pass',
  directUrl
}) => {
  const transport = getTransporter();
  const userName = name || (to ? to.split('@')[0] : 'Attendee');
  const fromAddr = getSenderAddress();
  const replyToAddr = getReplyToAddress();
  const targetEventName = eventName || 'PRPCEM Technical Event';
  const portalUrl = directUrl || 'https://www.mscprpcem.tech';

  const html = renderHtmlWrapper({
    title: 'Registration Confirmed',
    preheader: \`You are registered for \${targetEventName} — MSC PRPCEM\`,
    recipientName: userName,
    content: \`
      <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
        Your registration for <strong>\${targetEventName}</strong> has been successfully confirmed. We look forward to seeing you at the event!
      </p>

      <!-- Registration Summary Card -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; table-layout: fixed; box-sizing: border-box;">
        <tr>
          <td style="padding: 10px 14px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
            Ticket &amp; Registration Details
          </td>
        </tr>
        <tr>
          <td style="padding: 6px 12px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
              <tr>
                <td style="padding: 8px 4px; color: #64748b; width: 34%;">Event</td>
                <td style="padding: 8px 4px; color: #0f172a; font-weight: 700; width: 66%;">\${targetEventName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 4px; color: #64748b; width: 34%;">Participant</td>
                <td style="padding: 8px 4px; color: #0f172a; font-weight: 700; width: 66%;">\${userName}</td>
              </tr>
              \${registrationId ? \`<tr>
                <td style="padding: 8px 4px; color: #64748b; width: 34%;">Registration ID</td>
                <td style="padding: 8px 4px; color: #2563eb; font-weight: 700; font-family: monospace; width: 66%;">\${registrationId}</td>
              </tr>\` : ''}
              \${eventDate ? \`<tr>
                <td style="padding: 8px 4px; color: #64748b; width: 34%;">Date &amp; Time</td>
                <td style="padding: 8px 4px; color: #334155; width: 66%;">\${eventDate}</td>
              </tr>\` : ''}
              \${eventVenue ? \`<tr>
                <td style="padding: 8px 4px; color: #64748b; width: 34%;">Venue</td>
                <td style="padding: 8px 4px; color: #334155; width: 66%;">\${eventVenue}</td>
              </tr>\` : ''}
              <tr>
                <td style="padding: 8px 4px; color: #64748b; width: 34%;">Ticket Pass</td>
                <td style="padding: 8px 4px; color: #16a34a; font-weight: 700; width: 66%;">\${ticketType}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Action Button -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; table-layout: fixed;">
        <tr>
          <td align="center">
            <a href="\${portalUrl}" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); text-align: center;">
              View Event Portal &rarr;
            </a>
          </td>
        </tr>
      </table>
    \`
  });

  const plainText = \`Hi \${userName},\\n\\nYour registration for \${targetEventName} has been confirmed!\\n\\nDetails:\\n• Event: \${targetEventName}\\n• Participant: \${userName}\${registrationId ? \`\\n• Registration ID: \${registrationId}\` : ''}\${eventDate ? \`\\n• Date: \${eventDate}\` : ''}\${eventVenue ? \`\\n• Venue: \${eventVenue}\` : ''}\\nPortal: \${portalUrl}\\n\\n—\\nBest Regards,\\nTeam MSC PRPCEM\\nMicrosoft Student Club PRPCEM\\nP. R. Pote (Patil) College of Engineering & Management, Amravati\\nSupport: \${replyToAddr}\`;

  return transport.sendMail({
    from: fromAddr,
    to: to.trim(),
    replyTo: replyToAddr,
    subject: \`Registration Confirmed: \${targetEventName} — MSC PRPCEM\`,
    text: plainText,
    html,
    attachments: getEmailAttachments(),
    messageId: generateMessageId(fromAddr),
    headers: {
      'X-Mailer': 'PRPCEM-EventPlatform',
      'List-Unsubscribe': \`<mailto:\${replyToAddr}?subject=unsubscribe>\`
    }
  });
};

/**
 * Send Comprehensive Test Email
 */
export const sendTestEmail = async ({ to = 'mlsc@prpotepatilengg.ac.in', name = 'Team MSC PRPCEM' } = {}) => {
  const transport = getTransporter();
  const fromAddr = getSenderAddress();
  const replyToAddr = getReplyToAddress();

  const html = renderHtmlWrapper({
    title: 'PRPCEM Event Platform Standard Template Test',
    preheader: 'Official MSC PRPCEM Email Template Verification Test',
    recipientName: name,
    content: \`
      <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
        This is a live test transmission of the <strong>official standardized MSC PRPCEM email template</strong> from the Central Event Platform.
      </p>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; table-layout: fixed; box-sizing: border-box;">
        <tr>
          <td style="padding: 10px 14px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">
            Event Platform Specifications
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 16px; font-size: 13px; color: #334155; line-height: 1.6;">
            <div>🎨 <strong>Header Banner:</strong> MSC Logo &amp; PRPCEM Campus illustration</div>
            <div>👤 <strong>Greeting:</strong> Hi \${name}, matching official brand standard</div>
            <div>✍️ <strong>Sign-off:</strong> Team MSC PRPCEM with Be a Force for Good graphic</div>
            <div>🌐 <strong>Footer:</strong> Navy #081630 with circular social icons</div>
          </td>
        </tr>
      </table>
    \`
  });

  return transport.sendMail({
    from: fromAddr,
    to: to.trim(),
    replyTo: replyToAddr,
    subject: 'PRPCEM Events — Official Platform Email Template Test',
    text: \`Test email to \${to}\`,
    html,
    attachments: getEmailAttachments(),
    messageId: generateMessageId(fromAddr),
  });
};
`;

  fs.writeFileSync(eventPlatformEmailServicePath, eventPlatformCode, 'utf8');
  console.log('✅ event-platform emailService.js updated successfully!');
} else {
  console.log('⚠️ event-platform directory not found. Skipping.');
}

// =========================================================================
// 2. UPDATE certificate-verification: D:/certificate-verification/backend/src/services/emailService.js
// =========================================================================
const certEmailServicePath = 'D:/certificate-verification/backend/src/services/emailService.js';

if (fs.existsSync(path.dirname(certEmailServicePath))) {
  const certEmailServiceCode = `const crypto = require('crypto');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// In-memory OTP storage: email -> { otp, expiresAt, verified, pendingUser, attempts }
const otpStore = new Map();

// Singleton Transporter Instance
let transporter = null;

/**
 * Resolve sender address dynamically to prevent SPF/DMARC flags
 */
const getSenderAddress = () => {
  if (process.env.EMAIL_FROM && process.env.EMAIL_FROM.trim()) {
    return process.env.EMAIL_FROM.trim();
  }
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  if (user && user.includes('@')) {
    return \`"Microsoft Student Club PRPCEM" <\${user.trim()}>\`;
  }
  return '"Microsoft Student Club PRPCEM" <mlsc@prpotepatilengg.ac.in>';
};

/**
 * Resolve default Reply-To address
 */
const getReplyToAddress = () => {
  return process.env.REPLY_TO || process.env.SMTP_USER || process.env.EMAIL_USER || 'mlsc@prpotepatilengg.ac.in';
};

/**
 * Generate RFC 5322 compliant Message-ID
 */
const generateMessageId = (senderEmail) => {
  const domain = (senderEmail && senderEmail.includes('@'))
    ? senderEmail.split('@')[1].replace(/[<>]/g, '').trim()
    : 'prpotepatilengg.ac.in';
  return \`<\${Date.now()}.\${crypto.randomBytes(8).toString('hex')}@\${domain}>\`;
};

/**
 * Returns inline CID attachments for all email templates
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
 * Create or resolve Nodemailer transporter
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    const config = {
      host: host.trim(),
      port,
      secure,
      auth: { user: user.trim(), pass: pass.trim() },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      rateDelta: 1000,
      rateLimit: 5,
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 30000,
      tls: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: process.env.SMTP_IGNORE_TLS === 'true' ? false : (process.env.NODE_ENV === 'production')
      }
    };
    if (port === 587) config.requireTLS = true;

    const transport = nodemailer.createTransport(config);
    transport.verify((err) => {
      if (err) console.warn('⚠️ [EMAIL SERVICE] SMTP Verification Warning:', err.message);
      else console.log(\`✅ [EMAIL SERVICE] Connected securely to SMTP: \${host}:\${port} (\${user})\`);
    });
    return transport;
  }

  // Mock transporter
  return {
    sendMail: async (opts) => {
      console.log('\\n---------------- EMAIL SERVICE (DEV/MOCK MODE) ----------------');
      console.log(\`To: \${opts.to}\`);
      console.log(\`Subject: \${opts.subject}\`);
      console.log('Snippet:', (opts.text || opts.html || '').substring(0, 160) + '...');
      console.log('---------------------------------------------------------------\\n');
      return { messageId: \`mock_\${crypto.randomBytes(8).toString('hex')}\`, response: '250 Mock Email Dispatched' };
    }
  };
}

function getTransporter() {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
}

/**
 * Official Standard MSC PRPCEM HTML Email Template Wrapper
 */
const renderHtmlWrapper = ({
  title = 'Microsoft Student Club PRPCEM',
  preheader = '',
  recipientName = '',
  content = '',
  useCid = true,
  baseUrl = ''
}) => {
  const prefix = baseUrl ? baseUrl.replace(/\\/+$/, '') : '';
  const mscLogoSrc = useCid ? 'cid:msc_logo' : \`\${prefix}/assets/email/msc_logo.png\`;
  const heroBannerSrc = useCid ? 'cid:msc_hero_banner' : \`\${prefix}/assets/email/email_hero_banner.png\`;
  const forceForGoodSrc = useCid ? 'cid:msc_force_for_good' : \`\${prefix}/assets/email/email_force_for_good.png\`;
  const iconInstagramSrc = useCid ? 'cid:msc_icon_instagram' : \`\${prefix}/assets/email/icon_instagram.png\`;
  const iconLinkedinSrc = useCid ? 'cid:msc_icon_linkedin' : \`\${prefix}/assets/email/icon_linkedin.png\`;
  const iconYoutubeSrc = useCid ? 'cid:msc_icon_youtube' : \`\${prefix}/assets/email/icon_youtube.png\`;
  const iconWebsiteSrc = useCid ? 'cid:msc_icon_website' : \`\${prefix}/assets/email/icon_website.png\`;

  const cleanGreeting = recipientName ? recipientName.trim() : 'Student';

  return \`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <meta name="format-detection" content="telephone=no" />
  <title>\${title}</title>
  <style type="text/css">
    *, *:before, *:after { box-sizing: border-box; }
    body, table, td, a, p, span, div, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; max-width: 100%; height: auto; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; min-width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; overflow-x: hidden; }
    
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
    \${preheader || title}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
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
                            <img src="\${mscLogoSrc}" alt="MSC PRPCEM Logo" width="44" height="44" style="display: block; width: 44px; height: 44px; border: 0; outline: none; vertical-align: middle;" />
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
                <img src="\${heroBannerSrc}" alt="Microsoft Student Club PRPCEM - A community of curious minds, creating opportunities for a better tomorrow." width="600" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0; outline: none;" />
              </a>
            </td>
          </tr>

          <!-- 3. Dynamic Content Body Area -->
          <tr>
            <td class="email-body-cell" style="padding: 28px 32px 24px 32px; background-color: #ffffff; color: #334155; font-size: 15px; line-height: 1.65; box-sizing: border-box; word-break: break-word;">
              
              <!-- Greeting: Hi {{Name}}, -->
              <p style="margin: 0 0 18px 0; font-size: 19px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                Hi <span style="color: #2563eb; font-weight: 800;">\${cleanGreeting}</span>,
              </p>

              <!-- Dynamic Content -->
              <div style="font-size: 15px; color: #334155; line-height: 1.65;">
                \${content}
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
                    <img src="\${forceForGoodSrc}" alt="Be a Force for Good." width="155" style="display: inline-block; max-width: 155px; width: 100%; height: auto; border: 0; outline: none;" />
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
                            <img src="\${iconInstagramSrc}" width="30" height="30" alt="Instagram" style="display: block; border: 0; outline: none;" />
                          </a>
                        </td>
                        <td style="padding-right: 10px; line-height: 0;">
                          <a href="https://www.linkedin.com/company/mscprpcem/" target="_blank" style="text-decoration: none; display: inline-block;" title="LinkedIn">
                            <img src="\${iconLinkedinSrc}" width="30" height="30" alt="LinkedIn" style="display: block; border: 0; outline: none;" />
                          </a>
                        </td>
                        <td style="padding-right: 10px; line-height: 0;">
                          <a href="https://youtube.com/@mscprpcem" target="_blank" style="text-decoration: none; display: inline-block;" title="YouTube">
                            <img src="\${iconYoutubeSrc}" width="30" height="30" alt="YouTube" style="display: block; border: 0; outline: none;" />
                          </a>
                        </td>
                        <td style="padding-right: 14px; line-height: 0;">
                          <a href="https://www.mscprpcem.tech" target="_blank" style="text-decoration: none; display: inline-block;" title="Official Website">
                            <img src="\${iconWebsiteSrc}" width="30" height="30" alt="Website" style="display: block; border: 0; outline: none;" />
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
</html>\`;
};

/**
 * Generate and send 6-digit OTP verification email
 */
async function sendVerificationOTP(email, pendingUserData = null) {
  if (!email || typeof email !== 'string') {
    throw new Error('Valid email address is required.');
  }

  const cleanEmail = email.toLowerCase().trim();
  const userName = (pendingUserData && pendingUserData.name) || cleanEmail.split('@')[0] || 'Student';
  
  // Generate random 6-digit number string
  const otp = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity

  // Preserve existing pendingUser if not supplied in this call
  const existingRecord = otpStore.get(cleanEmail);
  const pendingUser = pendingUserData || (existingRecord ? existingRecord.pendingUser : null);

  // Save to memory store with attempt tracking
  otpStore.set(cleanEmail, { otp, expiresAt, verified: false, pendingUser, attempts: 0 });

  const transport = getTransporter();
  const fromAddr = getSenderAddress();
  const replyToAddr = getReplyToAddress();

  const htmlContent = renderHtmlWrapper({
    title: 'Verification Code',
    preheader: \`Your verification code is \${otp}. Valid for 15 minutes.\`,
    recipientName: userName,
    content: \`
      <p style="font-size: 15px; color: #334155; margin: 0 0 18px 0; line-height: 1.6;">
        Use the 6-digit verification code below to complete your verification and access your student credential wallet:
      </p>
      
      <!-- OTP Box -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; table-layout: fixed; box-sizing: border-box;">
        <tr>
          <td align="center" style="background-color: #eff6ff; border: 2px dashed #2563eb; border-radius: 14px; padding: 24px 16px; box-sizing: border-box;">
            <div class="otp-code-text" style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #1d4ed8; line-height: 1.1; margin: 0 auto; text-align: center;">
              \${otp}
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
    \`
  });

  const textContent = \`Hi \${userName},\\n\\nYour 6-digit verification code is: \${otp}\\n\\nThis code is valid for 15 minutes.\\nIf you did not request this code, please ignore this email.\\n\\n—\\nBest Regards,\\nTeam MSC PRPCEM\\nMicrosoft Student Club PRPCEM\\nP. R. Pote (Patil) College of Engineering & Management, Amravati\\nSupport: \${replyToAddr}\`;

  try {
    await transport.sendMail({
      from: fromAddr,
      to: cleanEmail,
      replyTo: replyToAddr,
      subject: \`\${otp} is your verification code — MSC PRPCEM\`,
      text: textContent,
      html: htmlContent,
      attachments: getEmailAttachments(),
      messageId: generateMessageId(fromAddr),
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High',
        'X-Mailer': 'MSC-PRPCEM-VerificationPlatform'
      }
    });
    console.log(\`[EMAIL SERVICE] OTP \${otp} sent to \${cleanEmail}\`);
  } catch (err) {
    console.warn(\`[EMAIL SERVICE] Failed to send via SMTP (\${err.message}). OTP for \${cleanEmail} is: \${otp}\`);
  }

  return { success: true, message: \`Verification code sent to \${cleanEmail}.\` };
}

/**
 * Verify 6-digit OTP code entered by user
 */
function verifyOTP(email, userOtp) {
  if (!email || !userOtp) {
    return { valid: false, error: 'Email and OTP code are required.' };
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanOtp = userOtp.toString().trim();

  const record = otpStore.get(cleanEmail);

  if (!record) {
    return { valid: false, error: 'No verification code was sent to this email address. Please click Resend Code.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return { valid: false, error: 'Verification code has expired. Please click Resend Code.' };
  }

  if ((record.attempts || 0) >= 5) {
    otpStore.delete(cleanEmail);
    return { valid: false, error: 'Too many failed attempts. This verification code has been invalidated. Please request a new code.' };
  }

  if (record.otp !== cleanOtp) {
    record.attempts = (record.attempts || 0) + 1;
    const remaining = 5 - record.attempts;
    if (remaining <= 0) {
      otpStore.delete(cleanEmail);
      return { valid: false, error: 'Too many failed attempts. This verification code has been invalidated. Please request a new code.' };
    }
    otpStore.set(cleanEmail, record);
    return { valid: false, error: \`Incorrect verification code. \${remaining} attempt\${remaining > 1 ? 's' : ''} remaining.\` };
  }

  // Mark verified
  record.verified = true;
  otpStore.set(cleanEmail, record);

  return { valid: true, message: 'Email address verified successfully!', pendingUser: record.pendingUser };
}

/**
 * Send rich email notification when a credential (certificate or badge) is issued
 */
async function sendCredentialIssuedNotification({
  recipientName,
  recipientEmail,
  title,
  type = 'certificate',
  customId,
  issueDate
}) {
  if (!recipientEmail || typeof recipientEmail !== 'string') return;

  const cleanEmail = recipientEmail.toLowerCase().trim();
  const transport = getTransporter();
  const fromAddr = getSenderAddress();
  const replyToAddr = getReplyToAddress();
  const baseUrl = (process.env.FRONTEND_URL || 'https://verify.mscprpcem.tech').replace(/\\/+$/, '');

  const isBadge = (type || '').toLowerCase() === 'badge';
  const typeLabel = isBadge ? 'Badge' : 'Certificate';
  const badgeIcon = isBadge ? '🏆' : '📜';
  const verificationUrl = \`\${baseUrl}/?verifyId=\${customId || ''}\`;
  const walletUrl = \`\${baseUrl}/login\`;

  const htmlContent = renderHtmlWrapper({
    title: \`Verified \${typeLabel} Issued\`,
    preheader: \`Congratulations! You've earned a verified \${typeLabel}: \${title} — MSC PRPCEM\`,
    recipientName: recipientName || 'Member',
    content: \`
      <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
        Congratulations! You have been issued an official <strong>\${typeLabel}</strong> from Microsoft Student Club PRPCEM for your achievements in <strong>\${title}</strong>.
      </p>

      <!-- Credential Summary Card -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; background: linear-gradient(135deg, \${isBadge ? '#3b0764' : '#0f172a'} 0%, \${isBadge ? '#6d28d9' : '#1d4ed8'} 100%); border-radius: 14px; color: #ffffff; text-align: center; table-layout: fixed; box-sizing: border-box; overflow: hidden; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.15);">
        <tr>
          <td align="center" style="padding: 28px 18px; word-break: break-word;">
            <div style="font-size: 38px; margin-bottom: 6px;">\${badgeIcon}</div>
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #93c5fd; font-weight: 700; margin-bottom: 6px;">
              OFFICIAL VERIFIED \${typeLabel.toUpperCase()}
            </div>
            <h3 style="font-size: 21px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0; line-height: 1.3; word-break: break-word;">
              \${title}
            </h3>
            <div style="font-size: 14px; color: #f8fafc; font-weight: 600; margin-bottom: 14px;">
              Awarded to \${recipientName}
            </div>
            \${customId ? \`
              <table border="0" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td align="center" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; padding: 5px 14px; font-size: 12px; font-weight: 700; color: #ffffff; font-family: monospace;">
                    ID: \${customId}
                  </td>
                </tr>
              </table>
            \` : ''}
          </td>
        </tr>
      </table>

      <!-- Action Buttons -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0 16px 0; table-layout: fixed;">
        <tr>
          <td align="center">
            <a href="\${verificationUrl}" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); text-align: center;">
              View &amp; Verify Credential &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="font-size: 13px; color: #64748b; line-height: 1.6; text-align: center; margin-bottom: 0;">
        Access your permanent credential wallet anytime at <a href="\${walletUrl}" style="color: #2563eb; font-weight: 600; text-decoration: none;">\${walletUrl}</a>
      </p>
    \`
  });

  const plainText = \`Hi \${recipientName},\\n\\nCongratulations on earning your official \${typeLabel}: \${title}!\\n\\nCredential Details:\\n• Title: \${title}\\n• Recipient: \${recipientName}\${customId ? \`\\n• ID: \${customId}\` : ''}\${issueDate ? \`\\n• Issued: \${issueDate}\` : ''}\\n\\nVerify online: \${verificationUrl}\\n\\n—\\nBest Regards,\\nTeam MSC PRPCEM\\nMicrosoft Student Club PRPCEM\\nP. R. Pote (Patil) College of Engineering & Management, Amravati\\nSupport: \${replyToAddr}\`;

  try {
    await transport.sendMail({
      from: fromAddr,
      to: cleanEmail,
      replyTo: replyToAddr,
      subject: \`🏆 You've earned a verified \${typeLabel}: \${title} — MSC PRPCEM\`,
      text: plainText,
      html: htmlContent,
      attachments: getEmailAttachments(),
      messageId: generateMessageId(fromAddr),
      headers: {
        'X-Mailer': 'MSC-PRPCEM-VerificationPlatform'
      }
    });
    console.log(\`[EMAIL SERVICE] Credential notification sent to \${cleanEmail}\`);
  } catch (err) {
    console.warn(\`[EMAIL SERVICE] Failed to send credential email to \${cleanEmail}:\`, err.message);
  }
}

/**
 * Send Comprehensive Test Email
 */
async function sendTestEmail({ to = 'mlsc@prpotepatilengg.ac.in', name = 'Team MSC PRPCEM' } = {}) {
  const transport = getTransporter();
  const fromAddr = getSenderAddress();
  const replyToAddr = getReplyToAddress();

  const html = renderHtmlWrapper({
    title: 'Verification Platform Standard Template Test',
    preheader: 'Official MSC PRPCEM Email Template Verification Test',
    recipientName: name,
    content: \`
      <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
        This is a live test transmission of the <strong>official standardized MSC PRPCEM email template</strong> from the Certificate &amp; Verification Platform.
      </p>
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; table-layout: fixed; box-sizing: border-box;">
        <tr>
          <td style="padding: 10px 14px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">
            Verification Platform Specifications
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 16px; font-size: 13px; color: #334155; line-height: 1.6;">
            <div>🎨 <strong>Header Banner:</strong> MSC Logo &amp; PRPCEM Campus illustration</div>
            <div>👤 <strong>Greeting:</strong> Hi \${name}, matching official brand standard</div>
            <div>✍️ <strong>Sign-off:</strong> Team MSC PRPCEM with Be a Force for Good graphic</div>
            <div>🌐 <strong>Footer:</strong> Navy #081630 with circular social icons</div>
          </td>
        </tr>
      </table>
    \`
  });

  return transport.sendMail({
    from: fromAddr,
    to: to.trim(),
    replyTo: replyToAddr,
    subject: 'MSC PRPCEM — Verification Platform Email Template Test',
    text: \`Test email to \${to}\`,
    html,
    attachments: getEmailAttachments(),
    messageId: generateMessageId(fromAddr),
  });
}

module.exports = {
  renderHtmlWrapper,
  getEmailAttachments,
  getTransporter,
  getSenderAddress,
  getReplyToAddress,
  sendVerificationOTP,
  verifyOTP,
  sendCredentialIssuedNotification,
  sendTestEmail
};
`;

  fs.writeFileSync(certEmailServicePath, certEmailServiceCode, 'utf8');
  console.log('✅ certificate-verification emailService.js updated successfully!');
} else {
  console.log('⚠️ certificate-verification directory not found. Skipping.');
}

// =========================================================================
// 3. UPDATE certificate-verification: D:/certificate-verification/backend/src/services/emailDispatch.service.js
// =========================================================================
const certEmailDispatchPath = 'D:/certificate-verification/backend/src/services/emailDispatch.service.js';

if (fs.existsSync(certEmailDispatchPath)) {
  const certEmailDispatchCode = `const prisma = require("../config/database");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { renderHtmlWrapper, getEmailAttachments, getTransporter, getSenderAddress, getReplyToAddress } = require("./emailService");

function generateLinkedInAddUrl({ title, customId, issueDate, verificationUrl }) {
  let issueYear = '2026';
  let issueMonth = '1';
  if (issueDate) {
    const d = new Date(issueDate);
    if (!isNaN(d.getTime())) {
      issueYear = String(d.getFullYear());
      issueMonth = String(d.getMonth() + 1);
    } else {
      const match = String(issueDate).match(/\\b(202\\d)\\b/);
      if (match) issueYear = match[1];
    }
  }

  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: title,
    organizationName: 'Microsoft Student Club PRPCEM',
    issueYear: issueYear,
    issueMonth: issueMonth,
    certUrl: verificationUrl,
    certId: customId
  });

  return \`https://www.linkedin.com/profile/add?\${params.toString()}\`;
}

function generateLinkedInShareUrl({ verificationUrl }) {
  return \`https://www.linkedin.com/sharing/share-offsite/?url=\${encodeURIComponent(verificationUrl)}\`;
}

class EmailDispatchService {
  async getRecipientsInfo({ targetType = 'badge', targetValue = '' }) {
    // 1. Get available badge titles with counts
    const badgeCounts = await prisma.credential.groupBy({
      by: ['title'],
      where: { type: 'badge' },
      _count: { id: true }
    });

    const availableBadges = badgeCounts.map(b => ({
      title: b.title,
      count: b._count.id
    })).sort((a, b) => b.count - a.count);

    // 2. Get available certificate titles with counts
    const certCounts = await prisma.credential.groupBy({
      by: ['title'],
      where: { type: 'certificate' },
      _count: { id: true }
    });

    const availableCertificates = certCounts.map(c => ({
      title: c.title,
      count: c._count.id
    })).sort((a, b) => b.count - a.count);

    // 3. Build where condition for current selection
    const where = this._buildWhereCondition(targetType, targetValue);

    const [totalCount, sampleRecipients] = await Promise.all([
      prisma.credential.count({ where }),
      prisma.credential.findMany({
        where,
        take: 8,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          recipient_name: true,
          recipient_email: true,
          type: true,
          title: true,
          category: true,
          issue_date: true
        }
      })
    ]);

    return {
      targetType,
      targetValue,
      count: totalCount,
      sampleRecipients,
      availableBadges,
      availableCertificates
    };
  }

  _buildWhereCondition(targetType, targetValue) {
    const where = {};
    const val = (targetValue || '').trim();

    if (targetType === 'badge') {
      where.type = 'badge';
      if (val && val.toUpperCase() !== 'ALL') {
        where.title = { equals: val };
      }
    } else if (targetType === 'certificate') {
      where.type = 'certificate';
      if (val && val.toUpperCase() !== 'ALL') {
        where.title = { equals: val };
      }
    } else if (targetType === 'specific') {
      if (val) {
        where.OR = [
          { id: { equals: val } },
          { recipient_email: { equals: val } },
          { recipient_name: { contains: val } }
        ];
      }
    } else if (targetType === 'all') {
      // all credentials
    }

    return where;
  }

  renderEmailContent({
    templateType = 'linkedin_reminder',
    customSubject = '',
    customMessage = '',
    recipient = null,
    includeLinkedInButton = true,
    includeVerifyButton = true
  }) {
    const baseUrl = (process.env.FRONTEND_URL || 'https://verify.mscprpcem.tech').replace(/\\/+$/, '');
    
    // Sample fallback recipient for preview
    const sample = recipient || {
      id: 'MSC-BDG-00010',
      recipient_name: 'Bhakti Nichit',
      recipient_email: 'student@example.com',
      type: 'badge',
      title: 'Vision X Season 2',
      issue_date: '01 August 2025'
    };

    const isBadge = (sample.type || 'badge').toLowerCase() === 'badge';
    const typeLabel = isBadge ? 'Badge' : 'Certificate';
    const typeIcon = isBadge ? '🏆' : '📜';
    const verificationUrl = \`\${baseUrl}/?verifyId=\${sample.id}\`;
    const walletUrl = \`\${baseUrl}/login\`;
    const linkedinAddUrl = generateLinkedInAddUrl({
      title: sample.title,
      customId: sample.id,
      issueDate: sample.issue_date,
      verificationUrl
    });
    const linkedinShareUrl = generateLinkedInShareUrl({ verificationUrl });

    // Dynamic Token Replacements
    const replaceTokens = (text) => {
      if (!text) return '';
      return text
        .replace(/\\{\\{name\\}\\}/gi, sample.recipient_name || 'Member')
        .replace(/\\{\\{email\\}\\}/gi, sample.recipient_email || '')
        .replace(/\\{\\{title\\}\\}/gi, sample.title || '')
        .replace(/\\{\\{type\\}\\}/gi, typeLabel)
        .replace(/\\{\\{credential_id\\}\\}/gi, sample.id || '')
        .replace(/\\{\\{issue_date\\}\\}/gi, sample.issue_date || '2026')
        .replace(/\\{\\{verification_url\\}\\}/gi, verificationUrl)
        .replace(/\\{\\{wallet_url\\}\\}/gi, walletUrl)
        .replace(/\\{\\{linkedin_add_url\\}\\}/gi, linkedinAddUrl)
        .replace(/\\{\\{linkedin_share_url\\}\\}/gi, linkedinShareUrl);
    };

    let subject = customSubject;
    let headline = '';
    let preheader = '';
    let bodyHtml = '';

    if (templateType === 'linkedin_reminder') {
      if (!subject) subject = \`🚀 Showcase your \${sample.title} on LinkedIn — Microsoft Student Club\`;
      headline = \`Add Your Verified \${typeLabel} to LinkedIn\`;
      preheader = \`Stand out to recruiters! Add your verified \${sample.title} credential to your LinkedIn profile.\`;
      
      bodyHtml = \`
        <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
          Congratulations on earning your verified <strong>\${sample.title}</strong> from Microsoft Student Club PRPCEM!
        </p>
        <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
          Highlight your accomplishment and technical skills to top recruiters and your professional network by adding this official credential directly to your <strong>LinkedIn Profile &amp; Licenses Section</strong>.
        </p>

        \${customMessage ? \`
          <div style="background-color: #f8fafc; border-left: 4px solid #0a66c2; padding: 14px 18px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #334155; line-height: 1.6;">
            \${replaceTokens(customMessage).replace(/\\n/g, '<br/>')}
          </div>
        \` : ''}

        <!-- Credential Badge Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; background: linear-gradient(135deg, #0f172a 0%, \${isBadge ? '#4c1d95' : '#1e3a8a'} 100%); border-radius: 14px; color: #ffffff; text-align: center; table-layout: fixed; box-sizing: border-box; overflow: hidden; box-shadow: 0 6px 20px rgba(15, 23, 42, 0.15);">
          <tr>
            <td align="center" style="padding: 26px 18px; word-break: break-word;">
              <div style="font-size: 38px; margin-bottom: 6px;">\${typeIcon}</div>
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #93c5fd; font-weight: 700; margin-bottom: 6px;">
                OFFICIAL VERIFIED \${typeLabel.toUpperCase()}
              </div>
              <h3 style="font-size: 21px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0; line-height: 1.3; word-break: break-word;">
                \${sample.title}
              </h3>
              <div style="font-size: 13.5px; color: #f1f5f9; font-weight: 600; margin-bottom: 14px;">
                Issued to \${sample.recipient_name}
              </div>
              <table border="0" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td align="center" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; padding: 5px 14px; font-size: 12px; font-weight: 600; color: #ffffff; word-break: break-all; font-family: monospace;">
                    ID: \${sample.id}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- LinkedIn Actions -->
        \${includeLinkedInButton ? \`
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0 16px 0; table-layout: fixed;">
            <tr>
              <td align="center">
                <a href="\${linkedinAddUrl}" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #0a66c2; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(10, 102, 194, 0.35); text-align: center;">
                  Add to LinkedIn Profile &rarr;
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 10px;">
                <a href="\${linkedinShareUrl}" target="_blank" style="font-size: 13px; color: #0a66c2; text-decoration: underline; font-weight: 600;">
                  Or Share as a Post on Your Feed &rarr;
                </a>
              </td>
            </tr>
          </table>
        \` : ''}

        \${includeVerifyButton ? \`
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 16px 0; table-layout: fixed;">
            <tr>
              <td align="center">
                <a href="\${verificationUrl}" target="_blank" style="display: inline-block; background-color: #f8fafc; border: 1px solid #cbd5e1; color: #1e293b !important; font-weight: 700; font-size: 13px; text-decoration: none; padding: 10px 24px; border-radius: 8px;">
                  🔍 View &amp; Verify Credential Live &rarr;
                </a>
              </td>
            </tr>
          </table>
        \` : ''}
      \`;

    } else if (templateType === 'verification_reminder') {
      if (!subject) subject = \`🔐 Access Your Verified \${typeLabel}: \${sample.title} — Microsoft Student Club\`;
      headline = \`Your Verified \${typeLabel} is Active\`;
      preheader = \`View and verify your official \${sample.title} credential issued by MSC PRPCEM.\`;

      bodyHtml = \`
        <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
          Your official <strong>\${typeLabel}</strong> for <strong>\${sample.title}</strong> is active and verified in the PRPCEM Credential Registry.
        </p>

        \${customMessage ? \`
          <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #334155; line-height: 1.6;">
            \${replaceTokens(customMessage).replace(/\\n/g, '<br/>')}
          </div>
        \` : ''}

        <!-- Details Box -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; table-layout: fixed; box-sizing: border-box;">
          <tr>
            <td style="padding: 10px 14px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">
              Credential Verification Record
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 12px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px;">
                <tr>
                  <td style="padding: 8px 4px; color: #64748b; width: 34%;">Title</td>
                  <td style="padding: 8px 4px; color: #0f172a; font-weight: 700; width: 66%;">\${sample.title}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 4px; color: #64748b; width: 34%;">Recipient</td>
                  <td style="padding: 8px 4px; color: #0f172a; font-weight: 700; width: 66%;">\${sample.recipient_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 4px; color: #64748b; width: 34%;">Credential ID</td>
                  <td style="padding: 8px 4px; color: #2563eb; font-weight: 700; font-family: monospace; width: 66%;">\${sample.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 4px; color: #64748b; width: 34%;">Status</td>
                  <td style="padding: 8px 4px; color: #16a34a; font-weight: 700; width: 66%;">Verified &amp; Issued</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Verify Button -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; table-layout: fixed;">
          <tr>
            <td align="center">
              <a href="\${verificationUrl}" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); text-align: center;">
                Launch Public Verification Portal &rarr;
              </a>
            </td>
          </tr>
        </table>

        \${includeLinkedInButton ? \`
          <p style="font-size: 13px; color: #64748b; text-align: center; margin-bottom: 0;">
            Want to add this to LinkedIn? <a href="\${linkedinAddUrl}" target="_blank" style="color: #0a66c2; font-weight: 700; text-decoration: underline;">Click here to 1-Click Add &rarr;</a>
          </p>
        \` : ''}
      \`;

    } else {
      // Custom Announcement
      if (!subject) subject = \`📢 Announcement from Microsoft Student Club PRPCEM\`;
      headline = customSubject || 'Important Announcement';
      preheader = customSubject || 'Official communication from Microsoft Student Club PRPCEM';

      bodyHtml = \`
        <div style="font-size: 15px; color: #334155; line-height: 1.7; margin: 12px 0; word-break: break-word;">
          \${replaceTokens(customMessage || 'We have an important update regarding your achievements and upcoming technical opportunities.').replace(/\\n/g, '<br/>')}
        </div>

        \${includeVerifyButton ? \`
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; table-layout: fixed;">
            <tr>
              <td align="center">
                <a href="\${walletUrl}" target="_blank" class="mobile-btn" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); text-align: center;">
                  Open Student Credential Wallet &rarr;
                </a>
              </td>
            </tr>
          </table>
        \` : ''}
      \`;
    }

    const fullHtml = renderHtmlWrapper({
      title: headline,
      preheader,
      recipientName: sample.recipient_name,
      content: bodyHtml,
      useCid: false,
      baseUrl
    });

    return {
      subject,
      headline,
      preheader,
      bodyHtml,
      html: fullHtml,
      sampleRecipient: sample
    };
  }

  async dispatchCampaign({
    targetType = 'badge',
    targetValue = '',
    templateType = 'linkedin_reminder',
    customSubject = '',
    customMessage = '',
    includeLinkedInButton = true,
    includeVerifyButton = true
  }) {
    const where = this._buildWhereCondition(targetType, targetValue);

    const recipients = await prisma.credential.findMany({
      where,
      select: {
        id: true,
        recipient_name: true,
        recipient_email: true,
        type: true,
        title: true,
        category: true,
        issue_date: true
      }
    });

    if (!recipients || recipients.length === 0) {
      throw new Error('No recipients found matching the chosen target audience.');
    }

    const transport = getTransporter();
    const fromAddr = getSenderAddress();
    const replyToAddr = getReplyToAddress();
    const baseUrl = (process.env.FRONTEND_URL || 'https://verify.mscprpcem.tech').replace(/\\/+$/, '');

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const r of recipients) {
      if (!r.recipient_email || !r.recipient_email.includes('@')) {
        failCount++;
        continue;
      }

      try {
        const rendered = this.renderEmailContent({
          templateType,
          customSubject,
          customMessage,
          recipient: r,
          includeLinkedInButton,
          includeVerifyButton
        });

        // Use CID images for actual email dispatch
        const dispatchHtml = renderHtmlWrapper({
          title: rendered.headline,
          preheader: rendered.preheader,
          recipientName: r.recipient_name,
          content: rendered.bodyHtml,
          useCid: true,
          baseUrl
        });

        const plainText = \`Hi \${r.recipient_name},\\n\\n\${rendered.subject}\\n\\nView online: \${baseUrl}/?verifyId=\${r.id}\\n\\n—\\nBest Regards,\\nTeam MSC PRPCEM\\nMicrosoft Student Club PRPCEM\\nP. R. Pote (Patil) College of Engineering & Management, Amravati\\nSupport: \${replyToAddr}\`;

        await transport.sendMail({
          from: fromAddr,
          to: r.recipient_email.trim(),
          replyTo: replyToAddr,
          subject: rendered.subject,
          text: plainText,
          html: dispatchHtml,
          attachments: getEmailAttachments(),
          headers: {
            'X-Mailer': 'MSC-PRPCEM-VerificationPlatform',
            'List-Unsubscribe': \`<mailto:\${replyToAddr}?subject=unsubscribe>\`
          }
        });

        successCount++;
      } catch (err) {
        failCount++;
        errors.push({ email: r.recipient_email, error: err.message });
      }
    }

    return {
      success: true,
      totalTargeted: recipients.length,
      successCount,
      failCount,
      message: \`Campaign dispatched: \${successCount} sent successfully\${failCount > 0 ? \`, \${failCount} failed\` : ''}.\`,
      errors: errors.slice(0, 10)
    };
  }
}

module.exports = new EmailDispatchService();
`;

  fs.writeFileSync(certEmailDispatchPath, certEmailDispatchCode, 'utf8');
  console.log('✅ certificate-verification emailDispatch.service.js updated successfully!');
} else {
  console.log('⚠️ certificate-verification emailDispatch.service.js not found. Skipping.');
}

// =========================================================================
// 4. UPDATE certificate-verification: D:/certificate-verification/backend/src/services/email.service.js
// =========================================================================
const certEmailServiceLegacyPath = 'D:/certificate-verification/backend/src/services/email.service.js';

if (fs.existsSync(certEmailServiceLegacyPath)) {
  const certLegacyCode = `const profileRepository = require("../repositories/profile.repository");
const emailService = require("./emailService");
const env = require("../config/env");

class EmailService {
  async sendQuizBadgeEmail(name, email, title, score, dateStr, credId) {
    const subject = \`🏆 You've earned a new Microsoft Student Club Badge: \${title}\`;
    const body = \`Congratulations, \${name}! You earned a new badge "\${title}" (Score: \${score}%, Issued: \${dateStr}). ID: \${credId}\`;

    // Fire-and-forget — email log is non-critical and should not block the caller
    profileRepository.logSentEmail(email, subject, body.trim()).catch(() => {});

    // Dispatch rich SMTP email notification (also non-critical — errors are swallowed)
    try {
      await emailService.sendCredentialIssuedNotification({
        recipientName: name,
        recipientEmail: email,
        title,
        type: 'badge',
        customId: credId,
        issueDate: dateStr
      });
    } catch (err) {
      console.warn('SMTP send error in sendQuizBadgeEmail:', err.message);
    }
  }

  async sendIssueEmail(name, email, title, type, customId, issue_date) {
    const isBadge = (type || '').toLowerCase() === 'badge';
    const typeLabel = isBadge ? 'Badge' : 'Certificate';
    const icon = isBadge ? '🏆' : '📜';
    const subject = \`\${icon} New \${typeLabel} Issued: \${title}\`;
    const body = \`Hello \${name}, You have been issued a new digital credential (\${type}): \${title} (ID: \${customId}, Date: \${issue_date})\`;

    // Fire-and-forget — non-critical log write
    profileRepository.logSentEmail(email, subject, body.trim()).catch(() => {});

    // Dispatch rich SMTP email notification
    try {
      await emailService.sendCredentialIssuedNotification({
        recipientName: name,
        recipientEmail: email,
        title,
        type: type || 'certificate',
        customId,
        issueDate: issue_date
      });
    } catch (err) {
      console.warn('SMTP send error in sendIssueEmail:', err.message);
    }
  }
}

module.exports = new EmailService();
`;

  fs.writeFileSync(certEmailServiceLegacyPath, certLegacyCode, 'utf8');
  console.log('✅ certificate-verification email.service.js updated successfully!');
}

console.log('🎉 All sibling platform email services updated successfully!');
