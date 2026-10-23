const axios = require('axios');

/**
 * Service to sync subscriber notifications directly to Google Sheet via Google Apps Script Web App
 * Features dual-mode delivery (POST with text/plain + GET query fallback) to bypass Google Apps Script 403 & CORS issues
 */
async function syncSubscriberToGoogleSheet(subscriberData) {
  let sheetWebhookUrl = process.env.GOOGLE_SHEET_NOTIFY_URL || 
                        process.env.GOOGLE_SCRIPT_URL || 
                        process.env.NOTIFY_SHEET_URL ||
                        process.env.VITE_GOOGLE_SHEET_NOTIFY_URL;

  if (!sheetWebhookUrl) {
    console.log('[GoogleSheetService] Notice: GOOGLE_SHEET_NOTIFY_URL is not set. Subscriber stored in DB.');
    return { 
      success: true, 
      synced: false, 
      message: 'Stored in local database. Set GOOGLE_SHEET_NOTIFY_URL to sync to Google Sheet automatically.' 
    };
  }

  sheetWebhookUrl = sheetWebhookUrl.trim();

  const now = new Date();
  // Convert to IST
  const dateIST = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)).toISOString().replace('T', ' ').substring(0, 19) + ' IST';

  const payload = {
    action: 'subscribe_notify',
    email: (subscriberData.email || '').trim().toLowerCase(),
    source: subscriberData.source || 'Courses Page',
    topic: subscriberData.topic || 'Future Quizzes & Course Releases',
    ip_address: subscriberData.ip_address || 'N/A',
    timestamp: now.toISOString(),
    dateIST: dateIST,
    status: 'active'
  };

  // 1. Primary Method: POST with text/plain (bypasses Google Apps Script preflight & 403 security blocks)
  try {
    const response = await axios.post(sheetWebhookUrl, JSON.stringify(payload), {
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      timeout: 12000,
      maxRedirects: 5
    });

    console.log('[GoogleSheetService] Successfully synced email to Google Sheet via POST:', subscriberData.email);
    return { success: true, synced: true, data: response.data };
  } catch (postErr) {
    console.warn(`[GoogleSheetService] Primary POST sync returned (${postErr.message}). Retrying with form-urlencoded POST...`);

    // 2. Fallback Method: POST with application/x-www-form-urlencoded (avoids putting PII in GET query strings)
    try {
      const formParams = new URLSearchParams(payload);
      const retryResponse = await axios.post(sheetWebhookUrl, formParams.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 12000,
        maxRedirects: 5
      });

      console.log('[GoogleSheetService] Successfully synced email to Google Sheet via form-urlencoded POST:', subscriberData.email);
      return { success: true, synced: true, data: retryResponse.data };
    } catch (retryErr) {
      console.error('[GoogleSheetService] Error syncing subscriber to Google Sheet:', retryErr.message);
      return { 
        success: false, 
        synced: false, 
        error: `Google Apps Script returned error: ${retryErr.message}. Stored in local database.` 
      };
    }
  }
}

module.exports = {
  syncSubscriberToGoogleSheet
};
