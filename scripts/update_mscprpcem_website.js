const fs = require('fs');
const path = require('path');

console.log('🚀 Updating mscprpcem-website email template and Code.gs...');

const codeGsPath = 'D:/mscprpcem-website/google-apps-script/Code.gs';

if (fs.existsSync(codeGsPath)) {
  let content = fs.readFileSync(codeGsPath, 'utf8');

  // Locate sendEmailNotification
  const oldFuncStart = content.indexOf('function sendEmailNotification(subject, heading, fields, rawData) {');
  if (oldFuncStart !== -1) {
    // Find the end of sendEmailNotification before the next separator or function
    const nextSeparator = content.indexOf('// ==============================================================================', oldFuncStart);
    if (nextSeparator !== -1) {
      const newFunc = `function sendEmailNotification(subject, heading, fields, rawData) {
  try {
    var rowsHtml = "";
    var renderedKeys = {};

    // 1. Render primary labeled fields
    if (Array.isArray(fields)) {
      fields.forEach(function (f) {
        if (
          f &&
          f.value !== null &&
          f.value !== undefined &&
          String(f.value).trim() !== ""
        ) {
          renderedKeys[f.label.toLowerCase()] = true;
          rowsHtml +=
            '<tr>' +
            '<td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-weight:700;color:#64748b;font-size:13px;width:160px;vertical-align:top;">' +
            escapeHtml(f.label) +
            '</td>' +
            '<td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;color:#0f172a;font-weight:600;font-size:13px;vertical-align:top;">' +
            escapeHtml(String(f.value)) +
            '</td>' +
            '</tr>';
        }
      });
    }

    // 2. Extra / Unmapped Form Data Catcher (Ensures NO payload fields are ever lost!)
    if (rawData && typeof rawData === "object") {
      var ignoredKeys = [
        "type", "formtype", "action", "timestamp", "submittedat",
        "visitorid", "sessionid", "device", "screenresolution", "language"
      ];
      var extraHtml = "";

      Object.keys(rawData).forEach(function (key) {
        var val = rawData[key];
        var lowerKey = key.toLowerCase();
        if (
          !ignoredKeys.includes(lowerKey) &&
          !renderedKeys[lowerKey] &&
          val !== null &&
          val !== undefined &&
          String(val).trim() !== ""
        ) {
          extraHtml +=
            '<tr>' +
            '<td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;width:160px;">' +
            escapeHtml(formatFieldLabel(key)) +
            '</td>' +
            '<td style="padding:8px 14px;border-bottom:1px solid #f1f5f9;color:#334155;font-size:13px;">' +
            escapeHtml(String(val)) +
            '</td>' +
            '</tr>';
        }
      });

      if (extraHtml) {
        rowsHtml +=
          '<tr>' +
          '<td colspan="2" style="padding:12px 14px 6px;background:#f8fafc;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">' +
          'Additional Submitted Data' +
          '</td>' +
          '</tr>' +
          extraHtml;
      }
    }

    // 3. Fallback if somehow no fields matched at all
    if (!rowsHtml) {
      rowsHtml =
        '<tr><td colspan="2" style="padding:16px;text-align:center;color:#64748b;">' +
        '<em>Submission details recorded successfully. Raw payload: ' +
        escapeHtml(JSON.stringify(rawData || {})) +
        '</em></td></tr>';
    }

    // Official MSC PRPCEM Standard HTML Email Template
    var htmlBody =
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">' +
      '<html xmlns="http://www.w3.org/1999/xhtml" lang="en">' +
      '<head>' +
      '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />' +
      '<title>' + escapeHtml(heading) + '</title>' +
      '</head>' +
      '<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,\\'Segoe UI\\',Roboto,Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">' +
      '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f1f5f9;padding:24px 8px;width:100%;table-layout:fixed;box-sizing:border-box;">' +
      '<tr><td align="center" style="padding:0;">' +
      '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:20px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);table-layout:fixed;box-sizing:border-box;">' +
      
      // Top Navigation Bar (Official Logo + Slogan)
      '<tr><td style="padding:22px 28px 16px 28px;background-color:#ffffff;border-top-left-radius:20px;border-top-right-radius:20px;">' +
      '<table border="0" cellpadding="0" cellspacing="0" width="100%">' +
      '<tr>' +
      '<td align="left" valign="middle">' +
      '<a href="https://www.mscprpcem.tech" target="_blank" style="text-decoration:none;display:inline-block;vertical-align:middle;">' +
      '<table border="0" cellpadding="0" cellspacing="0">' +
      '<tr>' +
      '<td valign="middle" style="padding-right:12px;line-height:0;">' +
      '<img src="https://www.mscprpcem.techhttps://mscprpcem.blob.core.windows.net/email-template/mscprpcemlogo.png" alt="MSC PRPCEM Logo" width="44" height="44" style="display:block;width:44px;height:44px;border:0;" />' +
      '</td>' +
      '<td valign="middle" style="line-height:1;">' +
      '<span style="font-family:-apple-system,BlinkMacSystemFont,\\'Segoe UI\\',Roboto,sans-serif;font-size:20px;font-weight:900;color:#0f172a;letter-spacing:-0.3px;">MSC PRPCEM</span>' +
      '</td>' +
      '</tr>' +
      '</table>' +
      '</a>' +
      '</td>' +
      '<td align="right" valign="middle">' +
      '<a href="https://www.mscprpcem.tech" target="_blank" style="text-decoration:none;display:inline-block;">' +
      '<div style="font-family:-apple-system,BlinkMacSystemFont,\\'Segoe UI\\',Roboto,sans-serif;font-size:16px;font-weight:800;color:#0f172a;letter-spacing:-0.2px;line-height:1.2;">Be a <span style="color:#2563eb;">Force for Good</span>.</div>' +
      '<div style="height:2.5px;width:64px;background:linear-gradient(90deg,#2563eb,#6366f1);margin:3px 0 0 auto;border-radius:2px;"></div>' +
      '</a>' +
      '</td>' +
      '</tr>' +
      '</table>' +
      '</td></tr>' +

      // Hero Banner
      '<tr><td style="padding:0;line-height:0;background-color:#ffffff;">' +
      '<a href="https://www.mscprpcem.tech" target="_blank" style="display:block;text-decoration:none;">' +
      '<img src="https://www.mscprpcem.techhttps://mscprpcem.blob.core.windows.net/email-template/upper%20banner.png" alt="Microsoft Student Club PRPCEM" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;" />' +
      '</a>' +
      '</td></tr>' +

      // Body Area
      '<tr><td style="padding:28px 32px 24px 32px;background-color:#ffffff;color:#334155;font-size:15px;line-height:1.65;box-sizing:border-box;word-break:break-word;">' +
      '<p style="margin:0 0 18px 0;font-size:19px;font-weight:700;color:#0f172a;line-height:1.3;">' +
      'Hi <span style="color:#2563eb;font-weight:800;">Team MSC PRPCEM</span>,' +
      '</p>' +
      '<p style="font-size:15px;color:#334155;margin:0 0 16px 0;line-height:1.6;">' +
      'A new response has been received for <strong>' + escapeHtml(heading) + '</strong> via the official website.' +
      '</p>' +

      // Submission Details Table
      '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;table-layout:fixed;box-sizing:border-box;">' +
      '<tr><td colspan="2" style="padding:10px 14px;background-color:#f1f5f9;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.5px;">' +
      'Submission Details' +
      '</td></tr>' +
      rowsHtml +
      '</table>' +

      // Action Button
      '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;table-layout:fixed;">' +
      '<tr><td align="center">' +
      '<a href="https://www.mscprpcem.tech" target="_blank" style="display:inline-block;background-color:#2563eb;color:#ffffff!important;font-weight:700;font-size:14px;text-decoration:none;padding:13px 32px;border-radius:10px;box-shadow:0 4px 14px rgba(37,99,235,0.3);text-align:center;">' +
      'Access Management Portal &rarr;' +
      '</a>' +
      '</td></tr>' +
      '</table>' +

      // Sign-off
      '<table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top:32px;border-top:1px solid #f1f5f9;padding-top:22px;table-layout:fixed;">' +
      '<tr>' +
      '<td valign="bottom" align="left" style="text-align:left;vertical-align:bottom;width:62%;">' +
      '<div style="font-size:13px;color:#64748b;font-weight:500;margin-bottom:3px;">Best Regards,</div>' +
      '<div style="font-size:16px;color:#0f172a;font-weight:800;letter-spacing:-0.2px;margin-bottom:6px;">Team MSC PRPCEM</div>' +
      '<div style="height:3px;width:42px;background-color:#2563eb;border-radius:2px;margin-bottom:10px;"></div>' +
      '<div style="font-size:13px;font-weight:700;color:#1e293b;line-height:1.3;">Microsoft Student Club PRPCEM</div>' +
      '<div style="font-size:11px;color:#64748b;margin-top:2px;line-height:1.4;">P. R. Pote (Patil) College of Engineering &amp; Management, Amravati</div>' +
      '</td>' +
      '<td valign="bottom" align="right" style="text-align:right;vertical-align:bottom;width:38%;">' +
      '<img src="https://www.mscprpcem.techhttps://mscprpcem.blob.core.windows.net/email-template/lower%20banner.png" alt="Be a Force for Good." width="155" style="display:inline-block;max-width:155px;width:100%;height:auto;border:0;" />' +
      '</td>' +
      '</tr>' +
      '</table>' +
      '</td></tr>' +

      // Deep Navy Footer
      '<tr><td style="padding:16px 24px;background-color:#081630;border-bottom-left-radius:20px;border-bottom-right-radius:20px;box-sizing:border-box;">' +
      '<table border="0" cellpadding="0" cellspacing="0" width="100%">' +
      '<tr>' +
      '<td align="left" valign="middle" style="line-height:0;">' +
      '<table border="0" cellpadding="0" cellspacing="0">' +
      '<tr>' +
      '<td style="padding-right:10px;line-height:0;"><a href="https://www.instagram.com/mscprpcem/" target="_blank" style="text-decoration:none;"><img src="https://www.mscprpcem.tech/assets/email/icon_instagram.png" width="30" height="30" alt="Instagram" style="display:block;border:0;" /></a></td>' +
      '<td style="padding-right:10px;line-height:0;"><a href="https://www.linkedin.com/company/mscprpcem/" target="_blank" style="text-decoration:none;"><img src="https://www.mscprpcem.tech/assets/email/icon_linkedin.png" width="30" height="30" alt="LinkedIn" style="display:block;border:0;" /></a></td>' +
      '<td style="padding-right:10px;line-height:0;"><a href="https://youtube.com/@mscprpcem" target="_blank" style="text-decoration:none;"><img src="https://www.mscprpcem.tech/assets/email/icon_youtube.png" width="30" height="30" alt="YouTube" style="display:block;border:0;" /></a></td>' +
      '<td style="padding-right:14px;line-height:0;"><a href="https://www.mscprpcem.tech" target="_blank" style="text-decoration:none;"><img src="https://www.mscprpcem.tech/assets/email/icon_website.png" width="30" height="30" alt="Website" style="display:block;border:0;" /></a></td>' +
      '<td style="border-left:1px solid rgba(255,255,255,0.2);height:24px;width:1px;"></td>' +
      '</tr>' +
      '</table>' +
      '</td>' +
      '<td align="right" valign="middle" style="color:#94a3b8;font-size:11px;line-height:1.35;text-align:right;">' +
      '<div style="color:#ffffff;font-weight:700;font-size:11px;">Microsoft Student Club PRPCEM</div>' +
      '<div style="color:#94a3b8;font-size:10px;margin-top:1px;">P. R. Pote (Patil) College of Engineering &amp; Management</div>' +
      '</td>' +
      '</tr>' +
      '</table>' +
      '</td></tr>' +
      '</table>' +
      '</td></tr></table>' +
      '</body></html>';

    // Recipient Resolution
    var userEmail = Session.getActiveUser().getEmail();
    var recipients = NOTIFICATION_EMAILS || userEmail;

    if (recipients) {
      MailApp.sendEmail({
        to: recipients,
        subject: subject,
        htmlBody: htmlBody
      });
    } else {
      console.warn("No notification email recipient configured.");
    }

  } catch (err) {
    console.error("Email sending error:", err.toString());
  }
}
\n`;

      const updated = content.slice(0, oldFuncStart) + newFunc + content.slice(nextSeparator);
      fs.writeFileSync(codeGsPath, updated, 'utf8');
      console.log('✅ Updated sendEmailNotification in D:/mscprpcem-website/google-apps-script/Code.gs!');
    } else {
      console.warn('Could not locate next separator in Code.gs');
    }
  } else {
    console.warn('Could not locate sendEmailNotification in Code.gs');
  }
}

// Also check and copy email_template_preview.html to mscprpcem-website public/
const srcPreviewHtml = 'D:/Quiz-platform/email_template_preview.html';
const destPreviewHtml = 'D:/mscprpcem-website/public/email_template_preview.html';
if (fs.existsSync(srcPreviewHtml)) {
  fs.copyFileSync(srcPreviewHtml, destPreviewHtml);
  console.log('✅ Copied email_template_preview.html to D:/mscprpcem-website/public/!');
}

console.log('🎉 mscprpcem-website successfully upgraded to standard email template!');
