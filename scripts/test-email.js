const fs = require('fs');
const path = require('path');
const { sendTestEmail, verifyEmailConfiguration, renderHtmlWrapper } = require('../backend/src/services/emailService');

async function main() {
  console.log('=====================================================');
  console.log('  MSC PRPCEM OFFICIAL EMAIL TEMPLATE TEST DISPATCH');
  console.log('=====================================================');

  const configStatus = await verifyEmailConfiguration();
  console.log('\n[1] Email Configuration Diagnostic:', configStatus);

  console.log('\n[2] Dispatching Test Email to mlsc@prpotepatilengg.ac.in...');
  const result = await sendTestEmail({
    to: 'mlsc@prpotepatilengg.ac.in',
    name: 'Team MSC PRPCEM'
  });
  console.log('Result:', result);

  console.log('\n[3] Generating Standalone HTML Preview File...');
  const testHtml = renderHtmlWrapper({
    title: 'Platform Standard Email Template Test',
    preheader: 'Official MSC PRPCEM Email Template Verification Test',
    recipientName: 'Team MSC PRPCEM',
    useCid: false,
    baseUrl: 'https://quiz.mscprpcem.tech',
    content: `
      <p style="font-size: 15px; color: #334155; line-height: 1.6; margin: 0 0 16px 0;">
        This is a live test transmission of the <strong>official standardized MSC PRPCEM email template</strong>.
      </p>

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
        Sent to <strong>mlsc@prpotepatilengg.ac.in</strong> for platform standard verification.
      </p>
    `
  });

  const previewPath = path.join(__dirname, '../email-preview.html');
  fs.writeFileSync(previewPath, testHtml);
  console.log(`Saved standalone HTML preview to: ${previewPath}`);
  console.log('\n✅ All tests executed cleanly.');
}

main().catch(console.error);
