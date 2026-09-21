import api from '../services/api';

/**
 * Validates and sanitizes a hex color code.
 */
export const getValidColor = (hex, fallback = '#0078d4') => {
  if (!hex || typeof hex !== 'string') return fallback;
  const cleaned = hex.trim();
  return /^#[0-9A-F]{6}$/i.test(cleaned) || /^#[0-9A-F]{3}$/i.test(cleaned) ? cleaned : fallback;
};

/**
 * Converts a hex color to rgba string.
 */
export const colorToRgba = (hex, alpha = 1, fallback = '#0078d4') => {
  const color = getValidColor(hex, fallback);
  let c = color.substring(1);
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Default fallback branding configuration for MSC PRPCEM
 */
export const DEFAULT_BRANDING = {
  club_name: 'Microsoft Student Club',
  chapter_name: 'PRPCEM',
  logo_path: 'logo.png',
  primary_color: '#0078d4',
  footer_text: 'Powered by Microsoft Student Club PRPCEM Quiz Platform',
  qr_logo_size: 28
};

let cachedBranding = null;

/**
 * Fetches branding from backend /api/branding or returns cache/default
 */
export const fetchBrandingConfig = async () => {
  if (cachedBranding) return cachedBranding;
  try {
    const res = await api.get('/api/branding');
    cachedBranding = {
      ...DEFAULT_BRANDING,
      ...(res.data || {})
    };
    return cachedBranding;
  } catch (err) {
    console.warn('Failed to load branding, using defaults:', err);
    return DEFAULT_BRANDING;
  }
};

/**
 * Resolves full logo URL
 */
export const getLogoUrl = (logoPath) => {
  if (!logoPath) return '/msc-logo.png';
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://') || logoPath.startsWith('blob:') || logoPath.startsWith('data:')) {
    return logoPath;
  }
  return logoPath.startsWith('/') ? logoPath : `/${logoPath}`;
};

/**
 * Normalizes club name and chapter name to avoid duplicate prefixes or repetitive MSC text
 */
export const formatClubAndChapter = (branding) => {
  const rawClub = (branding?.club_name || 'Microsoft Student Club').trim();
  const rawChapter = (branding?.chapter_name || 'PRPCEM').trim();

  // Normalize club name: strip redundant trailing chapter names (e.g. "Microsoft Student Club PRPCEM")
  let clubName = rawClub.replace(/\s+PRPCEM$/i, '').trim();
  if (!clubName) clubName = 'Microsoft Student Club';

  // Normalize chapter name: remove redundant "Microsoft Student Club", "MSC-", "MSC ", and remove "Chapter" / "CHAPTER"
  let chapterName = rawChapter
    .replace(/^Microsoft\s+Student\s+Club\s*/i, '')
    .replace(/^MSC[-\s]*/i, '')
    .replace(/\s*chapter\s*/gi, '')
    .trim();

  if (!chapterName) chapterName = 'PRPCEM';

  return {
    clubName: clubName.toUpperCase(),
    chapterName: chapterName.toUpperCase()
  };
};

/**
 * Draws the official Microsoft Student Club branded QR card onto a canvas context.
 */
export const drawBrandedQRCard = (ctx, qrImage, quizData, brandData, logoImg) => {
  const W = 400;
  const H = 650;

  const branding = { ...DEFAULT_BRANDING, ...(brandData || {}) };
  const primaryColor = getValidColor(branding.primary_color, '#0078d4');
  
  // Format Header Lines cleanly without repetitive club/chapter strings
  const { clubName, chapterName } = formatClubAndChapter(branding);

  const footerText = branding.footer_text || 'Powered by Microsoft Student Club PRPCEM Quiz Platform';

  // 1. Clean White Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // 2. Azure-style Decorative Wave Paths
  ctx.strokeStyle = colorToRgba(primaryColor, 0.08);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 150);
  ctx.bezierCurveTo(100, 50, 300, 250, W, 150);
  ctx.stroke();

  ctx.strokeStyle = colorToRgba(primaryColor, 0.04);
  ctx.beginPath();
  ctx.moveTo(0, 480);
  ctx.bezierCurveTo(100, 550, 300, 380, W, 480);
  ctx.stroke();

  // 3. Subtle Dot Grid Pattern
  ctx.globalAlpha = 0.035;
  for (let x = 0; x < W; x += 16) {
    for (let y = 0; y < H; y += 16) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fillStyle = primaryColor;
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // 4. Accent Background Nodes
  ctx.fillStyle = colorToRgba(primaryColor, 0.07);
  ctx.beginPath();
  ctx.arc(40, 180, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(360, 520, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(330, 220, 6, 0, Math.PI * 2);
  ctx.fill();

  // 5. Top Color Accent Gradient Bar
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, primaryColor);
  grad.addColorStop(0.5, colorToRgba(primaryColor, 0.8));
  grad.addColorStop(1, primaryColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 8);

  // 6. Top Club Logo Circle
  if (logoImg) {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(200, 34, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.drawImage(logoImg, 178, 12, 44, 44);
  } else {
    // Microsoft 4-color grid fallback
    ctx.fillStyle = '#F25022';
    ctx.fillRect(188, 18, 11, 11);
    ctx.fillStyle = '#7FBA00';
    ctx.fillRect(201, 18, 11, 11);
    ctx.fillStyle = '#00A4EF';
    ctx.fillRect(188, 31, 11, 11);
    ctx.fillStyle = '#FFB900';
    ctx.fillRect(201, 31, 11, 11);
  }

  // 7. Club Name & Chapter Subtitle
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 13px Inter, "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(clubName, 200, 75);

  ctx.fillStyle = primaryColor;
  ctx.font = 'bold 11px Inter, "Segoe UI", system-ui, sans-serif';
  ctx.fillText(chapterName, 200, 95);

  // 8. Separator Line
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, 115);
  ctx.lineTo(360, 115);
  ctx.stroke();

  // 9. Quiz / Event Title & Subtitle/Category
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 16px Inter, "Segoe UI", system-ui, sans-serif';
  const rawTitle = (quizData?.title || 'Quiz Session').toUpperCase();
  const displayTitle = rawTitle.length > 34 ? rawTitle.slice(0, 34) + '...' : rawTitle;
  ctx.fillText(displayTitle, 200, 140);

  ctx.fillStyle = '#64748B';
  ctx.font = '600 10px Inter, "Segoe UI", system-ui, sans-serif';
  const rawSubtitle = (quizData?.subtitle || quizData?.event_name || quizData?.category || (quizData?.schedule_type ? `${quizData.schedule_type} ASSESSMENT` : 'SCHEDULED ASSESSMENT')).toUpperCase();
  const displaySubtitle = rawSubtitle.length > 42 ? rawSubtitle.slice(0, 42) + '...' : rawSubtitle;
  ctx.fillText(displaySubtitle, 200, 160);

  // 10. QR Code Frame Box
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(80, 185, 240, 240);
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.strokeRect(80, 185, 240, 240);

  // 11. Draw QR Code Image
  if (qrImage) {
    ctx.drawImage(qrImage, 90, 195, 220, 220);
  }

  // 12. Center MSC Logo inside the QR Code
  if (logoImg) {
    const logoSize = branding.qr_logo_size !== undefined ? branding.qr_logo_size : 28;
    const L = Math.round(logoSize * 1.375); // ~38px
    const radius = Math.round(L / 2) + 3;

    // White circle cutout background behind the center logo
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(200, 305, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center logo image
    ctx.drawImage(logoImg, 200 - Math.round(L / 2), 305 - Math.round(L / 2), L, L);
  }

  // 13 & 14. Event vs Quiz Layout Differentiation
  const isEvent = Boolean(quizData?.isEvent || quizData?.is_event);

  if (isEvent) {
    // === EVENT REGISTRATION CARD ===
    // 13. Call-to-action prompt
    ctx.fillStyle = '#64748B';
    ctx.font = '600 11px Inter, "Segoe UI", system-ui, sans-serif';
    ctx.fillText('Scan with camera to register, or visit link:', 200, 452);

    // 14. Prominent Full Registration Link Box (replaces slug box with complete link)
    const boxX = 35;
    const boxY = 468;
    const boxW = 330;
    const boxH = 100;
    const boxR = 12;

    ctx.fillStyle = '#F8FAFC';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(boxX, boxY, boxW, boxH, boxR);
    } else {
      ctx.rect(boxX, boxY, boxW, boxH);
    }
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Box Header Label
    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 9px Inter, "Segoe UI", sans-serif';
    ctx.fillText('DIRECT REGISTRATION LINK', 200, boxY + 20);

    // Full Registration Link URL
    const eventHost = 'https://www.mscprpcem.tech';
    const slug = quizData?.custom_slug || quizData?.join_code || '';
    const fullUrl = quizData?.join_url || `${eventHost}/register/${slug}`;

    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 12px Inter, "Segoe UI", monospace, sans-serif';

    const textMetrics = ctx.measureText(fullUrl);
    if (textMetrics.width <= 300) {
      ctx.fillText(fullUrl, 200, boxY + 56);
    } else {
      // Split cleanly across 2 lines so the link is never truncated
      let line1 = '';
      let line2 = '';

      if (fullUrl.includes('/register/')) {
        const parts = fullUrl.split('/register/');
        line1 = `${parts[0]}/register/`;
        line2 = parts[1] || '';
      } else {
        const mid = Math.floor(fullUrl.length / 2);
        const slashIdx = fullUrl.lastIndexOf('/', mid + 10);
        if (slashIdx > 15) {
          line1 = fullUrl.substring(0, slashIdx + 1);
          line2 = fullUrl.substring(slashIdx + 1);
        } else {
          line1 = fullUrl.substring(0, mid);
          line2 = fullUrl.substring(mid);
        }
      }

      ctx.font = 'bold 12px Inter, "Segoe UI", monospace, sans-serif';
      ctx.fillText(line1, 200, boxY + 48);
      ctx.font = 'bold 13px Inter, "Segoe UI", monospace, sans-serif';
      ctx.fillText(line2, 200, boxY + 70);
    }
  } else {
    // === QUIZ SESSION CARD ===
    // 13. Direct URL / Join Link
    ctx.fillStyle = '#64748B';
    ctx.font = '600 11px Inter, "Segoe UI", system-ui, sans-serif';
    const scanLabel = quizData?.scan_label || 'Scan with camera or visit:';
    ctx.fillText(scanLabel, 200, 455);

    const hostOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://quiz.mscprpcem.tech';
    const joinCode = quizData?.join_code || quizData?.custom_slug || '';
    const joinUrl = quizData?.join_url || (joinCode ? `${hostOrigin}/join/${joinCode}` : `${hostOrigin}/q/quiz`);
    
    let urlFont = 12;
    if (joinUrl.length > 40) urlFont = 11;
    if (joinUrl.length > 48) urlFont = 10;
    ctx.fillStyle = primaryColor;
    ctx.font = `bold ${urlFont}px Inter, "Segoe UI", monospace, sans-serif`;
    ctx.fillText(joinUrl, 200, 478);

    // 14. Unique Join Code Box
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(80, 505, 240, 70);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(80, 505, 240, 70);

    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 9px Inter, "Segoe UI", sans-serif';
    const codeLabel = quizData?.code_label || 'UNIQUE JOIN CODE';
    ctx.fillText(codeLabel, 200, 525);

    const codeVal = String(quizData?.join_code || quizData?.custom_slug || 'JOIN').toUpperCase();
    
    let fontSize = 28;
    if (codeVal.length > 8) fontSize = 22;
    if (codeVal.length > 14) fontSize = 16;
    if (codeVal.length > 20) fontSize = 13;

    ctx.fillStyle = primaryColor;
    ctx.font = `900 ${fontSize}px Inter, "Segoe UI", sans-serif`;
    ctx.fillText(codeVal, 200, 560);
  }

  // 15. Footer Text
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 8px Inter, "Segoe UI", system-ui, sans-serif';
  ctx.fillText(footerText, 200, 612);

  // 16. Bottom Gradient Accent Bar
  ctx.fillStyle = grad;
  ctx.fillRect(0, H - 4, W, 4);
};

/**
 * Downloads a branded QR card image as a PNG file.
 * Handles SVG serialization, canvas rendering, and browser download trigger.
 */
export const downloadBrandedQRCard = async ({
  svgElementId,
  quizData = {},
  brandData = null,
  fileName = null
}) => {
  try {
    const branding = brandData || await fetchBrandingConfig();
    const svgElement = document.getElementById(svgElementId);
    if (!svgElement) {
      console.error(`SVG element with id '${svgElementId}' not found.`);
      return;
    }

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const logoSrc = getLogoUrl(branding?.logo_path);

    const qrImage = new Image();
    qrImage.onload = () => {
      const renderAndDownload = (logoImg) => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 650;
        const ctx = canvas.getContext('2d');

        drawBrandedQRCard(ctx, qrImage, quizData, branding, logoImg);

        const pngUrl = canvas.toDataURL('image/png');
        const slugOrCode = quizData?.custom_slug || quizData?.join_code || 'item';
        const defaultPrefix = quizData?.isEvent ? 'msc-event' : 'quiz';
        const defaultName = fileName || `${defaultPrefix}-${slugOrCode}.png`;

        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = defaultName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(blobURL);
      };

      if (logoSrc) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.onload = () => renderAndDownload(logoImg);
        logoImg.onerror = () => renderAndDownload(null);
        logoImg.src = logoSrc;
      } else {
        renderAndDownload(null);
      }
    };

    qrImage.onerror = () => {
      console.error('Failed to load QR image for download');
      URL.revokeObjectURL(blobURL);
    };

    qrImage.src = blobURL;
  } catch (error) {
    console.error('Error generating branded QR card:', error);
  }
};

/**
 * Downloads the styled QR code only (PNG or SVG) in crisp high resolution.
 * Guarantees that the MSC center logo is fully embedded in SVG and drawn on PNG canvas.
 */
export const downloadQROnlyImage = async ({
  svgElementId,
  size = 1024,
  format = 'png',
  fileName = 'msc-qr-code.png',
  includeLogo = true,
  logoSrc = '/logo.png'
}) => {
  const svgEl = document.getElementById(svgElementId);
  if (!svgEl) {
    console.error(`SVG element '${svgElementId}' not found for QR download.`);
    return;
  }

  // Clone SVG to ensure inline base64 logo data url is set for self-contained export
  const clone = svgEl.cloneNode(true);
  let logoDataUrl = null;

  if (includeLogo && logoSrc) {
    try {
      if (logoSrc.startsWith('data:image/')) {
        logoDataUrl = logoSrc;
      } else {
        const res = await fetch(logoSrc);
        const blob = await res.blob();
        logoDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      }

      if (logoDataUrl) {
        const imageEls = clone.querySelectorAll('image');
        imageEls.forEach((img) => {
          img.setAttribute('href', logoDataUrl);
          img.setAttribute('xlink:href', logoDataUrl);
        });
      }
    } catch (err) {
      console.warn('Could not inject base64 logo into cloned SVG:', err);
    }
  }

  const svgData = new XMLSerializer().serializeToString(clone);

  if (format === 'svg') {
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.endsWith('.svg') ? fileName : `${fileName.replace(/\.png$/i, '')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  // PNG High Resolution Canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const img = new Image();
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = async () => {
    // Clear and draw SVG at crisp scale
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, size, size);
    URL.revokeObjectURL(url);

    // Guaranteed Direct Logo Drawing onto the Canvas
    if (includeLogo && (logoDataUrl || logoSrc)) {
      try {
        const overlayImg = new Image();
        overlayImg.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          overlayImg.onload = () => resolve();
          overlayImg.onerror = () => resolve();
          overlayImg.src = logoDataUrl || logoSrc;
        });

        if (overlayImg.width > 0 && overlayImg.height > 0) {
          // Read totalCells and numCells from SVG to perfectly scale logo with quiet zone margin
          const totalCells = parseFloat(svgEl.getAttribute('data-total-cells') || '0');
          const numCells = parseFloat(svgEl.getAttribute('data-num-cells') || '0');
          let logoRatio = 0.22;
          if (totalCells > 0 && numCells > 0) {
            logoRatio = (numCells * 0.22) / totalCells;
          }
          const logoPixelSize = Math.round(size * logoRatio);
          const logoX = Math.round((size - logoPixelSize) / 2);
          const logoY = Math.round((size - logoPixelSize) / 2);
          ctx.drawImage(overlayImg, logoX, logoY, logoPixelSize, logoPixelSize);
        }
      } catch (err) {
        console.warn('Canvas direct logo overlay failed:', err);
      }
    }

    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  img.onerror = () => {
    console.error('Failed to render SVG to canvas for download.');
    URL.revokeObjectURL(url);
  };

  img.src = url;
};

/**
 * Generates and downloads a branded presentation card (poster-style) with high-res typography,
 * official MSC-PRPCEM header, custom title, subtitle, styled QR code with center logo, and CTA badge.
 */
export const downloadCustomDesignerCard = async ({
  svgElementId,
  cardTitle = 'SCAN TO OPEN',
  cardSubtitle = 'MICROSOFT STUDENT CLUB • PRPCEM',
  cardDescription = 'Scan with any smartphone camera to open link',
  targetUrl = '',
  theme = 'light',
  primaryColor = '#0078d4',
  secondaryColor = '#00a4ef',
  fileName = 'msc-qr-card.png',
  includeArrow = true,
  includeLogo = true,
  logoSrc = '/logo.png'
}) => {
  const svgEl = document.getElementById(svgElementId);
  if (!svgEl) {
    console.error(`SVG element '${svgElementId}' not found.`);
    return;
  }

  // Clone SVG and inject base64 logo so the card's QR code renders with center logo
  const clone = svgEl.cloneNode(true);
  let logoDataUrl = null;

  if (includeLogo && logoSrc) {
    try {
      if (logoSrc.startsWith('data:image/')) {
        logoDataUrl = logoSrc;
      } else {
        const res = await fetch(logoSrc);
        const blob = await res.blob();
        logoDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      }

      if (logoDataUrl) {
        const imageEls = clone.querySelectorAll('image');
        imageEls.forEach((img) => {
          img.setAttribute('href', logoDataUrl);
          img.setAttribute('xlink:href', logoDataUrl);
        });
      }
    } catch (err) {
      console.warn('Could not inject base64 logo into cloned SVG for card:', err);
    }
  }

  const svgData = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const qrImg = new Image();
  qrImg.onload = async () => {
    const W = 800; // High resolution 2x canvas
    const H = 1300;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const isDark = theme === 'dark';
    const bgColor = isDark ? '#0F172A' : '#FFFFFF';
    const textColor = isDark ? '#F8FAFC' : '#0F172A';
    const subTextColor = isDark ? '#94A3B8' : '#64748B';
    const cardBorderColor = isDark ? '#1E293B' : '#E2E8F0';

    // 1. Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    // 2. Subtle Accent Background Waves
    ctx.strokeStyle = colorToRgba(primaryColor, isDark ? 0.12 : 0.06);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 240);
    ctx.bezierCurveTo(200, 100, 600, 380, W, 240);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 950);
    ctx.bezierCurveTo(200, 1100, 600, 800, W, 950);
    ctx.stroke();

    // 3. Top Gradient Header Bar
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, primaryColor);
    grad.addColorStop(1, secondaryColor || primaryColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, 14);

    // 4. Official MSC Logo in Top Header Circle
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';

    const finishDrawing = (loadedLogo) => {
      // Draw Logo Plate
      ctx.fillStyle = isDark ? '#1E293B' : '#FFFFFF';
      ctx.beginPath();
      ctx.arc(W / 2, 80, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = cardBorderColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      if (loadedLogo) {
        ctx.drawImage(loadedLogo, W / 2 - 34, 46, 68, 68);
      } else {
        // Microsoft 4-Color Squares Fallback
        ctx.fillStyle = '#F25022';
        ctx.fillRect(W / 2 - 24, 56, 22, 22);
        ctx.fillStyle = '#7FBA00';
        ctx.fillRect(W / 2 + 2, 56, 22, 22);
        ctx.fillStyle = '#00A4EF';
        ctx.fillRect(W / 2 - 24, 82, 22, 22);
        ctx.fillStyle = '#FFB900';
        ctx.fillRect(W / 2 + 2, 82, 22, 22);
      }

      // 5. Club Header Text
      ctx.fillStyle = textColor;
      ctx.font = '900 24px Inter, "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MICROSOFT STUDENT CLUB', W / 2, 160);

      ctx.fillStyle = primaryColor;
      ctx.font = '800 18px Inter, "Segoe UI", system-ui, sans-serif';
      ctx.fillText('PRPCEM CHAPTER • AMRAVATI', W / 2, 192);

      // Separator Line
      ctx.strokeStyle = cardBorderColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 225);
      ctx.lineTo(W - 80, 225);
      ctx.stroke();

      // 6. Custom Card Title & Subtitle
      ctx.fillStyle = textColor;
      ctx.font = '900 32px Inter, "Segoe UI", system-ui, sans-serif';
      const cleanTitle = (cardTitle || 'SCAN TO JOIN').toUpperCase();
      const displayTitle = cleanTitle.length > 32 ? cleanTitle.slice(0, 32) + '...' : cleanTitle;
      ctx.fillText(displayTitle, W / 2, 275);

      ctx.fillStyle = subTextColor;
      ctx.font = '600 18px Inter, "Segoe UI", system-ui, sans-serif';
      const cleanSub = (cardSubtitle || 'OFFICIAL EVENT & PLATFORM ACCESS').toUpperCase();
      const displaySub = cleanSub.length > 46 ? cleanSub.slice(0, 46) + '...' : cleanSub;
      ctx.fillText(displaySub, W / 2, 310);

      // 7. Framed QR Container Box
      const qrBoxX = 140;
      const qrBoxY = 350;
      const qrBoxSize = 520;
      const qrPadding = 30;

      ctx.fillStyle = isDark ? '#1E293B' : '#F8FAFC';
      ctx.strokeStyle = cardBorderColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28);
      ctx.fill();
      ctx.stroke();

      // Draw QR Image Inside Box
      const qrInnerSize = qrBoxSize - qrPadding * 2;
      ctx.drawImage(
        qrImg,
        qrBoxX + qrPadding,
        qrBoxY + qrPadding,
        qrInnerSize,
        qrInnerSize
      );

      // Overlay center MSC Logo directly onto the QR code inside the card
      if (includeLogo && loadedLogo) {
        let logoRatio = 0.22;
        if (svgEl) {
          const totalCells = parseFloat(svgEl.getAttribute('data-total-cells') || '0');
          const numCells = parseFloat(svgEl.getAttribute('data-num-cells') || '0');
          if (totalCells > 0 && numCells > 0) {
            logoRatio = (numCells * 0.22) / totalCells;
          }
        }
        const qrCenterLogoSize = Math.round(qrInnerSize * logoRatio);
        const qrCenterLogoX = qrBoxX + qrPadding + Math.round((qrInnerSize - qrCenterLogoSize) / 2);
        const qrCenterLogoY = qrBoxY + qrPadding + Math.round((qrInnerSize - qrCenterLogoSize) / 2);
        ctx.drawImage(loadedLogo, qrCenterLogoX, qrCenterLogoY, qrCenterLogoSize, qrCenterLogoSize);
      }

      // 8. "SCAN WITH ANY CAMERA" Action Badge
      const badgeY = 910;
      const badgeGrad = ctx.createLinearGradient(W / 2 - 180, badgeY, W / 2 + 180, badgeY);
      badgeGrad.addColorStop(0, primaryColor);
      badgeGrad.addColorStop(1, secondaryColor || primaryColor);

      ctx.fillStyle = badgeGrad;
      ctx.beginPath();
      ctx.roundRect(W / 2 - 190, badgeY - 24, 380, 48, 24);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 16px Inter, "Segoe UI", system-ui, sans-serif';
      ctx.fillText('📷  SCAN WITH CAMERA TO ACCESS', W / 2, badgeY + 7);

      // Optional Bouncing Arrow Decorative Indicators
      if (includeArrow) {
        ctx.fillStyle = primaryColor;
        ctx.font = '900 24px system-ui';
        ctx.fillText('▼', W / 2, badgeY - 35);
      }

      // 9. Target URL Display Box
      if (targetUrl) {
        ctx.fillStyle = isDark ? '#1E293B' : '#F1F5F9';
        ctx.strokeStyle = cardBorderColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(100, 970, W - 200, 80, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = subTextColor;
        ctx.font = '700 14px Inter, "Segoe UI", system-ui, sans-serif';
        ctx.fillText('TARGET LINK / SHORT URL:', W / 2, 1000);

        ctx.fillStyle = primaryColor;
        let urlFontSize = 18;
        if (targetUrl.length > 42) urlFontSize = 15;
        if (targetUrl.length > 56) urlFontSize = 13;
        ctx.font = `800 ${urlFontSize}px Inter, "Segoe UI", monospace, sans-serif`;
        const displayUrl = targetUrl.length > 68 ? targetUrl.slice(0, 68) + '...' : targetUrl;
        ctx.fillText(displayUrl, W / 2, 1032);
      }

      // 10. Card Instruction / Description
      ctx.fillStyle = subTextColor;
      ctx.font = '600 16px Inter, "Segoe UI", system-ui, sans-serif';
      ctx.fillText(cardDescription || 'Point your smartphone camera at the QR code to open the link instantly.', W / 2, 1100);

      // 11. Footer Branding
      ctx.strokeStyle = cardBorderColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(80, 1160);
      ctx.lineTo(W - 80, 1160);
      ctx.stroke();

      ctx.fillStyle = subTextColor;
      ctx.font = '700 14px Inter, "Segoe UI", system-ui, sans-serif';
      ctx.fillText('Department of Computer Science & Engineering • PRPCEM Amravati', W / 2, 1200);

      ctx.font = '600 12px Inter, "Segoe UI", system-ui, sans-serif';
      ctx.fillText('Powered by Microsoft Student Club Official Platform • www.mscprpcem.tech', W / 2, 1228);

      // Bottom Accent Bar
      ctx.fillStyle = grad;
      ctx.fillRect(0, H - 10, W, 10);

      // Trigger Download
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    logoImg.onload = () => finishDrawing(logoImg);
    logoImg.onerror = () => finishDrawing(null);
    logoImg.src = logoDataUrl || logoSrc || '/logo.png';
  };

  qrImg.onerror = () => {
    console.error('Failed to load QR image for card rendering.');
    URL.revokeObjectURL(url);
  };

  qrImg.src = url;
};
