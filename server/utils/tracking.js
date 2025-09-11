// server/utils/tracking.js

/**
 * Injects a tracking pixel and modifies links for click tracking.
 * @param {string} htmlContent - The HTML content of the email.
 * @param {string} leadId - The ID of the lead.
 * @param {string} campaignId - The ID of the campaign.
 * @param {string} baseUrl - The base URL of the site (e.g., https://warolabs.com).
 * @param {string} emailSendId - The ID of the email send record.
 * @returns {string} The modified HTML.
 */
export function injectTracking(htmlContent, leadId, campaignId, baseUrl, emailSendId = null) {
  // Ensure that the content is a string
  if (typeof htmlContent !== 'string') {
    htmlContent = '';
  }

  // 1. Inject the open tracking pixel
  let pixelUrl = `${baseUrl}api/tracking/open?leadId=${leadId}&campaignId=${campaignId}`;
  if (emailSendId) {
    pixelUrl += `&emailSendId=${emailSendId}`;
  }
  const pixelImg = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;"/>`;
  
  let modifiedHtml;
  // Inject the pixel just before the closing body tag
  if (htmlContent.includes('</body>')) {
    modifiedHtml = htmlContent.replace('</body>', `${pixelImg}</body>`);
  } else {
    modifiedHtml = htmlContent + pixelImg;
  }

  // 2. Modify all links for click tracking
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/g;

  modifiedHtml = modifiedHtml.replace(linkRegex, (match, originalUrl) => {
    // Do not modify anchors, mailto links, or links that are already being tracked
    if (!originalUrl || originalUrl.startsWith('#') || originalUrl.startsWith('mailto:') || originalUrl.includes('/api/tracking/')) {
      return match;
    }

    const encodedUrl = encodeURIComponent(originalUrl);
    let trackingUrl = `${baseUrl}api/tracking/click?leadId=${leadId}&campaignId=${campaignId}&redirectTo=${encodedUrl}`;
    if (emailSendId) {
      trackingUrl += `&emailSendId=${emailSendId}`;
    }
    
    return match.replace(`"${originalUrl}"`, `"${trackingUrl}"`);
  });

  return modifiedHtml;
}
