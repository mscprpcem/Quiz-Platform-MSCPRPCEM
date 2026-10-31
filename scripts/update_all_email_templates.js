const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Comprehensive Email Template & Asset Update Across All Projects...');

const UPPER_BANNER_URL = 'https://mscprpcem.blob.core.windows.net/email-template/upper%20banner.png';
const LOGO_URL = 'https://mscprpcem.blob.core.windows.net/email-template/mscprpcemlogo.png';
const LOWER_BANNER_URL = 'https://mscprpcem.blob.core.windows.net/email-template/lower%20banner.png';

const ICON_INSTAGRAM_URL = 'https://www.mscprpcem.tech/assets/email/icon_instagram.png';
const ICON_LINKEDIN_URL = 'https://www.mscprpcem.tech/assets/email/icon_linkedin.png';
const ICON_YOUTUBE_URL = 'https://www.mscprpcem.tech/assets/email/icon_youtube.png';
const ICON_WEBSITE_URL = 'https://www.mscprpcem.tech/assets/email/icon_website.png';

// =========================================================================
// 1. UPDATE certificate-verification/backend/src/services/emailService.js
// =========================================================================
const certEmailServicePath = 'D:/certificate-verification/backend/src/services/emailService.js';
if (fs.existsSync(certEmailServicePath)) {
  let content = fs.readFileSync(certEmailServicePath, 'utf8');

  // Set default useCid = false
  content = content.replace(/useCid\s*=\s*true/g, 'useCid = false');

  // Replace image sources with Azure Blob CDN URLs
  content = content.replace(
    /const mscLogoSrc = useCid \? 'cid:msc_logo' : [^;]+;/,
    `const mscLogoSrc = useCid ? 'cid:msc_logo' : '${LOGO_URL}';`
  );
  content = content.replace(
    /const heroBannerSrc = useCid \? 'cid:msc_hero_banner' : [^;]+;/,
    `const heroBannerSrc = useCid ? 'cid:msc_hero_banner' : '${UPPER_BANNER_URL}';`
  );
  content = content.replace(
    /const forceForGoodSrc = useCid \? 'cid:msc_force_for_good' : [^;]+;/,
    `const forceForGoodSrc = useCid ? 'cid:msc_force_for_good' : '${LOWER_BANNER_URL}';`
  );
  content = content.replace(
    /const iconInstagramSrc = useCid \? 'cid:msc_icon_instagram' : [^;]+;/,
    `const iconInstagramSrc = useCid ? 'cid:msc_icon_instagram' : (prefix ? \`\${prefix}/assets/email/icon_instagram.png\` : '${ICON_INSTAGRAM_URL}');`
  );
  content = content.replace(
    /const iconLinkedinSrc = useCid \? 'cid:msc_icon_linkedin' : [^;]+;/,
    `const iconLinkedinSrc = useCid ? 'cid:msc_icon_linkedin' : (prefix ? \`\${prefix}/assets/email/icon_linkedin.png\` : '${ICON_LINKEDIN_URL}');`
  );
  content = content.replace(
    /const iconYoutubeSrc = useCid \? 'cid:msc_icon_youtube' : [^;]+;/,
    `const iconYoutubeSrc = useCid ? 'cid:msc_icon_youtube' : (prefix ? \`\${prefix}/assets/email/icon_youtube.png\` : '${ICON_YOUTUBE_URL}');`
  );
  content = content.replace(
    /const iconWebsiteSrc = useCid \? 'cid:msc_icon_website' : [^;]+;/,
    `const iconWebsiteSrc = useCid ? 'cid:msc_icon_website' : (prefix ? \`\${prefix}/assets/email/icon_website.png\` : '${ICON_WEBSITE_URL}');`
  );

  // Remove attachments from email sends
  content = content.replaceAll('attachments: getEmailAttachments(),', 'attachments: [],');

  fs.writeFileSync(certEmailServicePath, content, 'utf8');
  console.log('✅ Updated certificate-verification emailService.js');
}

// =========================================================================
// 2. UPDATE certificate-verification/backend/src/services/emailDispatch.service.js
// =========================================================================
const certEmailDispatchPath = 'D:/certificate-verification/backend/src/services/emailDispatch.service.js';
if (fs.existsSync(certEmailDispatchPath)) {
  let content = fs.readFileSync(certEmailDispatchPath, 'utf8');
  content = content.replaceAll('attachments: getEmailAttachments(),', 'attachments: [],');
  fs.writeFileSync(certEmailDispatchPath, content, 'utf8');
  console.log('✅ Updated certificate-verification emailDispatch.service.js');
}

// =========================================================================
// 3. UPDATE certificate-verification/frontend/src/components/ShareModal.jsx
// =========================================================================
const certShareModalPath = 'D:/certificate-verification/frontend/src/components/ShareModal.jsx';
if (fs.existsSync(certShareModalPath)) {
  let content = fs.readFileSync(certShareModalPath, 'utf8');

  if (!content.includes('handleEmailShare')) {
    // Add handleEmailShare handler before handleCopyLink
    const copyLinkAnchor = '  // 4. Copy Link to Clipboard';
    const emailHandler = `  // 3b. Share via Email
  const handleEmailShare = () => {
    const subject = encodeURIComponent(\`Verified Credential: \${credTitle} — Microsoft Student Club PRPCEM\`);
    const body = encodeURIComponent(
      \`Hello,\\n\\nPlease view and verify my official achievement from Microsoft Student Club PRPCEM:\\n\\n\${credTitle}\\nCredential ID: \${credId}\\nDirect Verification Link: \${verificationUrl}\\n\\nBest Regards,\\nTeam MSC PRPCEM\`
    );
    window.location.href = \`mailto:?subject=\${subject}&body=\${body}\`;
  };

`;
    if (content.includes(copyLinkAnchor)) {
      content = content.replace(copyLinkAnchor, emailHandler + copyLinkAnchor);
    }

    // Add button in share list
    const twitterButtonAnchor = '          {/* Native Mobile / Device Share Sheet */}';
    const emailButton = `          {/* Share via Email */}
          <button
            type="button"
            onClick={handleEmailShare}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '13px 18px',
              borderRadius: '12px',
              background: '#eff6ff',
              color: '#1d4ed8',
              border: '1.5px solid #93c5fd',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className="fa-solid fa-envelope" style={{ fontSize: '18px', color: '#2563eb' }}></i>
              <span>Share via Email</span>
            </span>
            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '12px', opacity: 0.9 }}></i>
          </button>

`;
    if (content.includes(twitterButtonAnchor)) {
      content = content.replace(twitterButtonAnchor, emailButton + twitterButtonAnchor);
    }

    fs.writeFileSync(certShareModalPath, content, 'utf8');
    console.log('✅ Updated certificate-verification ShareModal.jsx with Share via Email');
  }
}

// =========================================================================
// 4. UPDATE event-platform/backend/src/services/emailService.js
// =========================================================================
const eventEmailServicePath = 'D:/event-platform/backend/src/services/emailService.js';
if (fs.existsSync(eventEmailServicePath)) {
  let content = fs.readFileSync(eventEmailServicePath, 'utf8');

  content = content.replace(/useCid\s*=\s*true/g, 'useCid = false');

  content = content.replace(
    /const mscLogoSrc = useCid \? 'cid:msc_logo' : [^;]+;/,
    `const mscLogoSrc = useCid ? 'cid:msc_logo' : '${LOGO_URL}';`
  );
  content = content.replace(
    /const heroBannerSrc = useCid \? 'cid:msc_hero_banner' : [^;]+;/,
    `const heroBannerSrc = useCid ? 'cid:msc_hero_banner' : '${UPPER_BANNER_URL}';`
  );
  content = content.replace(
    /const forceForGoodSrc = useCid \? 'cid:msc_force_for_good' : [^;]+;/,
    `const forceForGoodSrc = useCid ? 'cid:msc_force_for_good' : '${LOWER_BANNER_URL}';`
  );
  content = content.replace(
    /const iconInstagramSrc = useCid \? 'cid:msc_icon_instagram' : [^;]+;/,
    `const iconInstagramSrc = useCid ? 'cid:msc_icon_instagram' : (prefix ? \`\${prefix}/assets/email/icon_instagram.png\` : '${ICON_INSTAGRAM_URL}');`
  );
  content = content.replace(
    /const iconLinkedinSrc = useCid \? 'cid:msc_icon_linkedin' : [^;]+;/,
    `const iconLinkedinSrc = useCid ? 'cid:msc_icon_linkedin' : (prefix ? \`\${prefix}/assets/email/icon_linkedin.png\` : '${ICON_LINKEDIN_URL}');`
  );
  content = content.replace(
    /const iconYoutubeSrc = useCid \? 'cid:msc_icon_youtube' : [^;]+;/,
    `const iconYoutubeSrc = useCid ? 'cid:msc_icon_youtube' : (prefix ? \`\${prefix}/assets/email/icon_youtube.png\` : '${ICON_YOUTUBE_URL}');`
  );
  content = content.replace(
    /const iconWebsiteSrc = useCid \? 'cid:msc_icon_website' : [^;]+;/,
    `const iconWebsiteSrc = useCid ? 'cid:msc_icon_website' : (prefix ? \`\${prefix}/assets/email/icon_website.png\` : '${ICON_WEBSITE_URL}');`
  );

  content = content.replaceAll('attachments: getEmailAttachments(),', 'attachments: [],');

  fs.writeFileSync(eventEmailServicePath, content, 'utf8');
  console.log('✅ Updated event-platform emailService.js');
}

// =========================================================================
// 5. UPDATE mscprpcem-website/google-apps-script/Code.gs
// =========================================================================
const websiteCodeGsPath = 'D:/mscprpcem-website/google-apps-script/Code.gs';
if (fs.existsSync(websiteCodeGsPath)) {
  let content = fs.readFileSync(websiteCodeGsPath, 'utf8');

  // Replace msc_logo with Azure Blob URL
  content = content.replace(
    /<img src="' \+ WEBSITE_URL \+ '\/assets\/email\/msc_logo\.png"/g,
    `<img src="${LOGO_URL}"`
  );
  content = content.replace(
    /<img src="https:\/\/www\.mscprpcem\.tech\/assets\/email\/msc_logo\.png"/g,
    `<img src="${LOGO_URL}"`
  );

  // Replace hero banner with Upper Banner Azure Blob URL
  content = content.replace(
    /<img src="' \+ WEBSITE_URL \+ '\/assets\/email\/email_hero_banner\.png"/g,
    `<img src="${UPPER_BANNER_URL}"`
  );
  content = content.replace(
    /<img src="https:\/\/www\.mscprpcem\.tech\/assets\/email\/email_hero_banner\.png"/g,
    `<img src="${UPPER_BANNER_URL}"`
  );

  // Replace force for good with Lower Banner Azure Blob URL
  content = content.replace(
    /<img src="' \+ WEBSITE_URL \+ '\/assets\/email\/email_force_for_good\.png"/g,
    `<img src="${LOWER_BANNER_URL}"`
  );
  content = content.replace(
    /<img src="https:\/\/www\.mscprpcem\.tech\/assets\/email\/email_force_for_good\.png"/g,
    `<img src="${LOWER_BANNER_URL}"`
  );

  fs.writeFileSync(websiteCodeGsPath, content, 'utf8');
  console.log('✅ Updated mscprpcem-website google-apps-script/Code.gs');
}

// =========================================================================
// 6. UPDATE dnc26/google-apps-script/Code.gs
// =========================================================================
const dncCodeGsPath = 'D:/dnc26/google-apps-script/Code.gs';
if (fs.existsSync(dncCodeGsPath)) {
  let content = fs.readFileSync(dncCodeGsPath, 'utf8');

  content = content.replaceAll(
    'https://www.mscprpcem.tech/assets/email/msc_logo.png',
    LOGO_URL
  );
  content = content.replaceAll(
    'https://www.mscprpcem.tech/assets/email/email_hero_banner.png',
    UPPER_BANNER_URL
  );
  content = content.replaceAll(
    'https://www.mscprpcem.tech/assets/email/email_force_for_good.png',
    LOWER_BANNER_URL
  );

  fs.writeFileSync(dncCodeGsPath, content, 'utf8');
  console.log('✅ Updated dnc26 google-apps-script/Code.gs');
}

// =========================================================================
// 7. UPDATE CertificateGenerator/frontend/src/pages/EmailQueue.jsx
// =========================================================================
const certGenEmailQueuePath = 'D:/CertificateGenerator/frontend/src/pages/EmailQueue.jsx';
if (fs.existsSync(certGenEmailQueuePath)) {
  let content = fs.readFileSync(certGenEmailQueuePath, 'utf8');
  // Update default subject and body
  if (content.includes('AWS SBG: Your Certificate is Ready!')) {
    content = content.replace(
      'AWS SBG: Your Certificate is Ready!',
      'Microsoft Student Club PRPCEM: Your Certificate is Ready!'
    );
    content = content.replace(
      'AWS Student Builder Group\\nPRPCEM',
      'Team MSC PRPCEM\\nMicrosoft Student Club PRPCEM'
    );
    fs.writeFileSync(certGenEmailQueuePath, content, 'utf8');
    console.log('✅ Updated CertificateGenerator EmailQueue.jsx branding');
  }
}

// =========================================================================
// 8. UPDATE email_template_preview.html across projects
// =========================================================================
const previewFiles = [
  'D:/Quiz-platform/email_template_preview.html',
  'D:/mscprpcem-website/public/email_template_preview.html',
  'D:/mscprpcem-website/public/email-showcase.html',
  'D:/dnc26/dist/email_template_preview.html'
];

previewFiles.forEach(pf => {
  if (fs.existsSync(pf)) {
    let content = fs.readFileSync(pf, 'utf8');
    content = content.replaceAll('/assets/email/msc_logo.png', LOGO_URL);
    content = content.replaceAll('https://www.mscprpcem.tech/assets/email/msc_logo.png', LOGO_URL);
    content = content.replaceAll('/assets/email/email_hero_banner.png', UPPER_BANNER_URL);
    content = content.replaceAll('https://www.mscprpcem.tech/assets/email/email_hero_banner.png', UPPER_BANNER_URL);
    content = content.replaceAll('/assets/email/email_force_for_good.png', LOWER_BANNER_URL);
    content = content.replaceAll('https://www.mscprpcem.tech/assets/email/email_force_for_good.png', LOWER_BANNER_URL);
    fs.writeFileSync(pf, content, 'utf8');
    console.log('✅ Updated preview file:', pf);
  }
});

// =========================================================================
// 9. UPDATE master script apply_universal_email_template.js
// =========================================================================
const masterScriptPath = 'D:/Quiz-platform/scripts/apply_universal_email_template.js';
if (fs.existsSync(masterScriptPath)) {
  let content = fs.readFileSync(masterScriptPath, 'utf8');
  content = content.replaceAll('useCid = true,', 'useCid = false,');
  content = content.replaceAll('attachments: getEmailAttachments(),', 'attachments: [],');
  content = content.replaceAll(`${'${prefix}'}/assets/email/msc_logo.png`, LOGO_URL);
  content = content.replaceAll(`${'${prefix}'}/assets/email/email_hero_banner.png`, UPPER_BANNER_URL);
  content = content.replaceAll(`${'${prefix}'}/assets/email/email_force_for_good.png`, LOWER_BANNER_URL);
  fs.writeFileSync(masterScriptPath, content, 'utf8');
  console.log('✅ Updated scripts/apply_universal_email_template.js');
}

console.log('🎉 ALL EMAIL TEMPLATES & SCRIPTS SYNCHRONIZED SUCCESSFULLY!');
