const fs = require('fs');
const path = require('path');

console.log('🚀 Hardening Zero-Attachment Policy Across All Platforms...');

const UPPER_BANNER_URL = 'https://mscprpcem.blob.core.windows.net/email-template/upper%20banner.png';
const LOGO_URL = 'https://mscprpcem.blob.core.windows.net/email-template/mscprpcemlogo.png';
const LOWER_BANNER_URL = 'https://mscprpcem.blob.core.windows.net/email-template/lower%20banner.png';

const ICON_INSTAGRAM_URL = 'https://www.mscprpcem.tech/assets/email/icon_instagram.png';
const ICON_LINKEDIN_URL = 'https://www.mscprpcem.tech/assets/email/icon_linkedin.png';
const ICON_YOUTUBE_URL = 'https://www.mscprpcem.tech/assets/email/icon_youtube.png';
const ICON_WEBSITE_URL = 'https://www.mscprpcem.tech/assets/email/icon_website.png';

function hardenEmailService(filePath) {
  if (!fs.existsSync(filePath)) return;
  let s = fs.readFileSync(filePath, 'utf8');

  // 1. Force getEmailAttachments to always return []
  s = s.replace(/const getEmailAttachments = \(\) => \{[\s\S]*?\n\};/, 'const getEmailAttachments = () => {\n  return [];\n};');

  // 2. Unconditionally set direct URLs
  s = s.replace(/const mscLogoSrc = [^;]+;/, `const mscLogoSrc = '${LOGO_URL}';`);
  s = s.replace(/const heroBannerSrc = [^;]+;/, `const heroBannerSrc = '${UPPER_BANNER_URL}';`);
  s = s.replace(/const forceForGoodSrc = [^;]+;/, `const forceForGoodSrc = '${LOWER_BANNER_URL}';`);
  s = s.replace(/const iconInstagramSrc = [^;]+;/, `const iconInstagramSrc = '${ICON_INSTAGRAM_URL}';`);
  s = s.replace(/const iconLinkedinSrc = [^;]+;/, `const iconLinkedinSrc = '${ICON_LINKEDIN_URL}';`);
  s = s.replace(/const iconYoutubeSrc = [^;]+;/, `const iconYoutubeSrc = '${ICON_YOUTUBE_URL}';`);
  s = s.replace(/const iconWebsiteSrc = [^;]+;/, `const iconWebsiteSrc = '${ICON_WEBSITE_URL}';`);

  // 3. Remove all attachments from calls
  s = s.replaceAll('attachments: getEmailAttachments(),', 'attachments: [],');

  fs.writeFileSync(filePath, s, 'utf8');
  console.log('✅ Hardened:', filePath);
}

// Apply to Quiz-platform, certificate-verification, event-platform
hardenEmailService('D:/Quiz-platform/backend/src/services/emailService.js');
hardenEmailService('D:/certificate-verification/backend/src/services/emailService.js');
hardenEmailService('D:/event-platform/backend/src/services/emailService.js');

console.log('🎉 Email services hardened: getEmailAttachments returns [] and direct URLs enforced everywhere.');
