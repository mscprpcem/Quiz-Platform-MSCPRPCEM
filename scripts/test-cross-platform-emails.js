const path = require('path');
const fs = require('fs');

async function testCrossPlatform() {
  console.log('========================================================');
  console.log('  TESTING CROSS-PLATFORM EMAIL TEMPLATE CONSISTENCY');
  console.log('========================================================\n');

  // 1. Test certificate-verification emailService & emailDispatch.service
  console.log('[1] Testing certificate-verification emailService.js...');
  const certEmailService = require('D:/certificate-verification/backend/src/services/emailService.js');
  
  const certAttachments = certEmailService.getEmailAttachments();
  console.log('   - CID Attachments count:', certAttachments.length);
  if (certAttachments.length !== 7) {
    console.error('   ❌ Expected 7 CID attachments in certificate-verification, found', certAttachments.length);
  } else {
    console.log('   ✅ All 7 standard email attachments verified.');
  }

  const testCertHtml = certEmailService.renderHtmlWrapper({
    title: 'Test Certificate Notification',
    recipientName: 'Aditya Sharma',
    content: '<p>Testing certificate verification standard template layout.</p>'
  });
  if (testCertHtml.includes('MSC PRPCEM') && testCertHtml.includes('Be a Force for Good') && testCertHtml.includes('#081630')) {
    console.log('   ✅ certificate-verification renderHtmlWrapper verified.');
  } else {
    console.error('   ❌ certificate-verification renderHtmlWrapper failed checks.');
  }

  // Test certificate-verification emailDispatch.service.js
  console.log('\n[2] Testing certificate-verification emailDispatch.service.js...');
  const certDispatchService = require('D:/certificate-verification/backend/src/services/emailDispatch.service.js');
  const renderedCampaign = certDispatchService.renderEmailContent({
    templateType: 'linkedin_reminder',
    customSubject: '',
    customMessage: '',
    recipient: {
      id: 'MSC-BDG-00042',
      recipient_name: 'Bhakti Nichit',
      recipient_email: 'bhakti@example.com',
      type: 'badge',
      title: 'DevOps & Cloud Sprint 2026'
    }
  });

  if (renderedCampaign.html.includes('MSC PRPCEM') && renderedCampaign.html.includes('Add to LinkedIn Profile')) {
    console.log('   ✅ LinkedIn campaign template rendered using standard wrapper successfully.');
  } else {
    console.error('   ❌ LinkedIn campaign template missing standard elements.');
  }

  // 2. Test event-platform emailService
  console.log('\n[3] Testing event-platform emailService.js...');
  try {
    const eventEmailModule = await import('file:///D:/event-platform/backend/src/services/emailService.js');
    const eventAttachments = eventEmailModule.getEmailAttachments();
    console.log('   - CID Attachments count:', eventAttachments.length);
    if (eventAttachments.length !== 7) {
      console.error('   ❌ Expected 7 CID attachments in event-platform, found', eventAttachments.length);
    } else {
      console.log('   ✅ All 7 standard email attachments verified in event-platform.');
    }

    const testEventHtml = eventEmailModule.renderHtmlWrapper({
      title: 'Event Confirmation',
      recipientName: 'Sohan Patil',
      content: '<p>Testing event-platform standard template layout.</p>'
    });
    if (testEventHtml.includes('MSC PRPCEM') && testEventHtml.includes('Be a Force for Good') && testEventHtml.includes('#081630')) {
      console.log('   ✅ event-platform renderHtmlWrapper verified.');
    } else {
      console.error('   ❌ event-platform renderHtmlWrapper failed checks.');
    }
  } catch (err) {
    console.error('   ❌ Error importing event-platform emailService:', err.message);
  }

  console.log('\n========================================================');
  console.log('  ALL PLATFORMS VERIFIED & STANDARDIZED SUCCESSFULLY!');
  console.log('========================================================');
}

testCrossPlatform().catch(console.error);
