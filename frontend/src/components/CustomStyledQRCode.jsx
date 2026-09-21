import React, { useMemo, useState, useEffect } from 'react';
import QRCode from 'qrcode';

// Global memory cache for base64 encoded logo so it's loaded once and instant everywhere
let cachedLogoDataUrl = null;

/**
 * Helper to convert any image path (like /logo.png) into an inline Base64 Data URL.
 * Embedding the logo as a Data URL directly inside the SVG ensures that:
 * 1. The browser will never block the logo when exporting SVG to Canvas or Blob URLs.
 * 2. Downloaded PNG and SVG files are 100% self-contained and always display the logo.
 */
export const loadLogoAsDataUrl = async (src = '/logo.png') => {
  if (cachedLogoDataUrl && src === '/logo.png') return cachedLogoDataUrl;
  if (!src || src.startsWith('data:image/')) return src;

  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (src === '/logo.png') cachedLogoDataUrl = reader.result;
        resolve(reader.result);
      };
      reader.onerror = () => resolve(src);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Could not load logo as base64, falling back to path:', err);
    return src;
  }
};

// Start background prefetch if in browser
if (typeof window !== 'undefined') {
  loadLogoAsDataUrl('/logo.png').catch(() => {});
}

/**
 * High-performance, ultra-customizable SVG QR Code Component.
 * Supports:
 * - Linear Gradients and Solid Fills
 * - Custom Corner Eye Shapes (Circular Ring, Smooth Leaf, Smooth Rounded, Classic Square)
 * - Custom Corner Outer Ring & Inner Pupil Colors
 * - Custom Body Dot Shapes (Squares, Rounded Dots, Circles)
 * - Center MSC Logo with transparent background (no distracting white void or offset)
 * - 100% SVG Vector fidelity and camera scanning reliability (Level H)
 */
export default function CustomStyledQRCode({
  value = 'https://www.mscprpcem.tech',
  size = 240,
  margin = 2, // Quiet zone in cell units (Default 2 for clean corner breathing room)
  fillMode = 'gradient', // 'gradient' | 'solid'
  color1 = '#0078D4',
  color2 = '#00A4EF',
  gradientAngle = 45,
  bgColor = '#FFFFFF',
  cornerShape = 'rounded', // 'square' | 'rounded' | 'circle' | 'leaf'
  cornerOuterColor = '#0078D4',
  cornerInnerColor = '#0078D4',
  dotShape = 'rounded', // 'square' | 'rounded' | 'circle'
  includeLogo = true,
  logoSrc = '/logo.png',
  logoScale = 0.22, // 22% of QR dimensions (Level H allows up to 30% without data loss)
  id = 'studio-qr-svg',
  className = ''
}) {
  const [embeddedLogo, setEmbeddedLogo] = useState(cachedLogoDataUrl || logoSrc);

  // Pre-load and cache the logo as a Data URL to guarantee download persistence
  useEffect(() => {
    let isMounted = true;
    if (includeLogo && logoSrc) {
      if (logoSrc.startsWith('data:image/')) {
        setEmbeddedLogo(logoSrc);
      } else {
        loadLogoAsDataUrl(logoSrc).then((dataUrl) => {
          if (isMounted && dataUrl) {
            setEmbeddedLogo(dataUrl);
          }
        });
      }
    }
    return () => { isMounted = false; };
  }, [includeLogo, logoSrc]);

  // Generate QR Matrix using pure JS qrcode engine
  const qr = useMemo(() => {
    try {
      return QRCode.create(value || 'https://www.mscprpcem.tech', {
        errorCorrectionLevel: 'H' // High (30% error recovery for center logo)
      });
    } catch (err) {
      console.error('Failed to create QR matrix:', err);
      return null;
    }
  }, [value]);

  if (!qr || !qr.modules) {
    return (
      <div
        className="flex items-center justify-center bg-slate-100 text-slate-400 text-xs font-bold rounded-2xl"
        style={{ width: size, height: size }}
      >
        Generating QR...
      </div>
    );
  }

  const numCells = qr.modules.size;
  const marginCells = Math.max(0, Number(margin) || 0);
  const totalCells = numCells + marginCells * 2;
  const gradientId = `${id}-grad`;

  // Exact center coordinate of the QR matrix in cell units
  const cx = numCells / 2;
  const cy = numCells / 2;

  // Center logo span and radius in cell units
  const logoSizeInCells = includeLogo ? numCells * logoScale : 0;
  const logoRadius = logoSizeInCells / 2;

  // Determine Gradient Angle Coordinates
  const getGradientCoordinates = (deg) => {
    switch (Number(deg)) {
      case 90:
        return { x1: '0%', y1: '0%', x2: '100%', y2: '0%' };
      case 135:
        return { x1: '0%', y1: '0%', x2: '100%', y2: '100%' };
      case 180:
        return { x1: '0%', y1: '0%', x2: '0%', y2: '100%' };
      case 45:
      default:
        return { x1: '0%', y1: '100%', x2: '100%', y2: '0%' };
    }
  };

  const coords = getGradientCoordinates(gradientAngle);
  const fillUrl = fillMode === 'gradient' ? `url(#${gradientId})` : color1;

  // Reserved Finder Pattern Regions (7x7 eyes + 1-cell separator around each)
  const isFinderPattern = (r, c) => {
    // Top-Left (cells 0..7)
    if (r <= 7 && c <= 7) return true;
    // Top-Right (cells 0..7, c >= numCells - 8)
    if (r <= 7 && c >= numCells - 8) return true;
    // Bottom-Left (r >= numCells - 8, c <= 7)
    if (r >= numCells - 8 && c <= 7) return true;
    return false;
  };

  // Concentric circular clear zone for center logo (no white square diverting the center)
  const isCenterLogoArea = (r, c) => {
    if (!includeLogo) return false;
    // Euclidean distance from cell center (c + 0.5, r + 0.5) to exact QR center (cx, cy)
    const dist = Math.hypot(c + 0.5 - cx, r + 0.5 - cy);
    return dist < logoRadius + 0.15;
  };

  // Build Body Data Modules
  const bodyModules = [];
  for (let r = 0; r < numCells; r++) {
    for (let c = 0; c < numCells; c++) {
      if (qr.modules.get(r, c) === 1) {
        if (!isFinderPattern(r, c) && !isCenterLogoArea(r, c)) {
          bodyModules.push({ r, c });
        }
      }
    }
  }

  // The 3 Corner Finder Pattern coordinates (x, y in cell units)
  const cornerEyes = [
    { x: 0, y: 0, type: 'tl' },
    { x: numCells - 7, y: 0, type: 'tr' },
    { x: 0, y: numCells - 7, type: 'bl' }
  ];

  return (
    <svg
      id={id}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={`0 0 ${totalCells} ${totalCells}`}
      width={size}
      height={size}
      className={`block select-none ${className}`}
      shapeRendering="geometricPrecision"
      data-total-cells={totalCells}
      data-num-cells={numCells}
      data-margin-cells={marginCells}
    >
      <defs>
        {/* Active Linear Gradient defined directly inside SVG for 100% reliability */}
        <linearGradient
          id={gradientId}
          x1={coords.x1}
          y1={coords.y1}
          x2={coords.x2}
          y2={coords.y2}
        >
          <stop offset="0%" stopColor={color1} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>

      {/* SVG Canvas Background Plate Covering Full Quiet Zone Margin */}
      {bgColor && bgColor !== 'transparent' && (
        <rect
          x="0"
          y="0"
          width={totalCells}
          height={totalCells}
          fill={bgColor}
        />
      )}

      {/* Quiet Zone Padding / Margin Group */}
      <g transform={`translate(${marginCells}, ${marginCells})`}>
        {/* ─── 1. BODY DATA MODULES (DOTS) ─── */}
      <g fill={fillUrl}>
        {bodyModules.map(({ r, c }, idx) => {
          if (dotShape === 'circle') {
            return (
              <circle
                key={idx}
                cx={c + 0.5}
                cy={r + 0.5}
                r={0.44}
              />
            );
          }
          if (dotShape === 'rounded') {
            return (
              <rect
                key={idx}
                x={c + 0.05}
                y={r + 0.05}
                width={0.9}
                height={0.9}
                rx={0.36}
              />
            );
          }
          // Classic crisp squares
          return (
            <rect
              key={idx}
              x={c}
              y={r}
              width={1.005}
              height={1.005}
            />
          );
        })}
      </g>

      {/* ─── 2. THE THREE CORNER FINDER PATTERNS (EYES) ─── */}
      {cornerEyes.map((eye) => {
        const { x, y, type } = eye;

        // 1. CIRCULAR RING CORNER SHAPE
        if (cornerShape === 'circle') {
          return (
            <g key={type}>
              {/* Outer Circular Ring: centered at (x+3.5, y+3.5), outer radius 3.5, stroke 1 */}
              <circle
                cx={x + 3.5}
                cy={y + 3.5}
                r={3}
                stroke={cornerOuterColor}
                strokeWidth={1}
                fill="none"
              />
              {/* Inner Circular Pupil Dot */}
              <circle
                cx={x + 3.5}
                cy={y + 3.5}
                r={1.5}
                fill={cornerInnerColor}
              />
            </g>
          );
        }

        // 2. SMOOTH LEAF CORNER SHAPE
        if (cornerShape === 'leaf') {
          const isDiagonal1 = type === 'tl' || type === 'bl';
          return (
            <g key={type}>
              {/* Outer Leaf Ring */}
              {isDiagonal1 ? (
                // Top-Left and Bottom-Right rounded, other corners square
                <path
                  d={`
                    M ${x + 3.2} ${y}
                    H ${x + 7}
                    V ${y + 3.8}
                    A 3.2 3.2 0 0 1 ${x + 3.8} ${y + 7}
                    H ${x}
                    V ${y + 3.2}
                    A 3.2 3.2 0 0 1 ${x + 3.2} ${y}
                    Z
                    M ${x + 2.6} ${y + 1}
                    A 1.6 1.6 0 0 0 ${x + 1} ${y + 2.6}
                    V ${y + 6}
                    H ${x + 4.4}
                    A 1.6 1.6 0 0 0 ${x + 6} ${y + 4.4}
                    V ${y + 1}
                    H ${x + 2.6}
                    Z
                  `}
                  fill={cornerOuterColor}
                  fillRule="evenodd"
                />
              ) : (
                // Top-Right eye: Top-Right and Bottom-Left rounded
                <path
                  d={`
                    M ${x} ${y}
                    H ${x + 3.8}
                    A 3.2 3.2 0 0 1 ${x + 7} ${y + 3.2}
                    V ${y + 7}
                    H ${x + 3.2}
                    A 3.2 3.2 0 0 1 ${x} ${y + 3.8}
                    V ${y}
                    Z
                    M ${x + 1} ${y + 1}
                    V ${y + 4.4}
                    A 1.6 1.6 0 0 0 ${x + 2.6} ${y + 6}
                    H ${x + 6}
                    V ${y + 2.6}
                    A 1.6 1.6 0 0 0 ${x + 4.4} ${y + 1}
                    H ${x + 1}
                    Z
                  `}
                  fill={cornerOuterColor}
                  fillRule="evenodd"
                />
              )}

              {/* Inner Leaf Pupil */}
              {isDiagonal1 ? (
                <path
                  d={`
                    M ${x + 3.2} ${y + 2}
                    H ${x + 5}
                    V ${y + 3.8}
                    A 1.2 1.2 0 0 1 ${x + 3.8} ${y + 5}
                    H ${x + 2}
                    V ${y + 3.2}
                    A 1.2 1.2 0 0 1 ${x + 3.2} ${y + 2}
                    Z
                  `}
                  fill={cornerInnerColor}
                />
              ) : (
                <path
                  d={`
                    M ${x + 2} ${y + 2}
                    H ${x + 3.8}
                    A 1.2 1.2 0 0 1 ${x + 5} ${y + 3.2}
                    V ${y + 5}
                    H ${x + 3.2}
                    A 1.2 1.2 0 0 1 ${x + 2} ${y + 3.8}
                    V ${y + 2}
                    Z
                  `}
                  fill={cornerInnerColor}
                />
              )}
            </g>
          );
        }

        // 3. SMOOTH ROUNDED CORNER SHAPE
        if (cornerShape === 'rounded') {
          return (
            <g key={type}>
              {/* Outer Rounded Box Ring */}
              <rect
                x={x + 0.5}
                y={y + 0.5}
                width={6}
                height={6}
                rx={1.8}
                stroke={cornerOuterColor}
                strokeWidth={1}
                fill="none"
              />
              {/* Inner Rounded Pupil Dot */}
              <rect
                x={x + 2}
                y={y + 2}
                width={3}
                height={3}
                rx={1.0}
                fill={cornerInnerColor}
              />
            </g>
          );
        }

        // 4. CLASSIC SQUARE CORNER SHAPE
        return (
          <g key={type}>
            {/* Outer Square Ring */}
            <rect
              x={x + 0.5}
              y={y + 0.5}
              width={6}
              height={6}
              rx={0}
              stroke={cornerOuterColor}
              strokeWidth={1}
              fill="none"
            />
            {/* Inner Square Pupil Dot */}
            <rect
              x={x + 2}
              y={y + 2}
              width={3}
              height={3}
              rx={0}
              fill={cornerInnerColor}
            />
          </g>
        );
      })}

      {/* ─── 3. CENTER MSC PRPCEM LOGO (ZERO OFFSET, ZERO WHITE BOX, PERFECT CONCENTRIC CENTERING) ─── */}
      {includeLogo && (embeddedLogo || logoSrc) && (
        <image
          href={embeddedLogo || logoSrc}
          xlinkHref={embeddedLogo || logoSrc}
          x={cx - logoRadius}
          y={cy - logoRadius}
          width={logoSizeInCells}
          height={logoSizeInCells}
          preserveAspectRatio="xMidYMid meet"
        />
      )}
      </g>
    </svg>
  );
}
