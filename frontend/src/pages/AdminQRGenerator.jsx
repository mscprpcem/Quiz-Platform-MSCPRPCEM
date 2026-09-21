import React, { useState, useEffect } from 'react';
import {
  QrCode, Sparkles, Download, Copy, Check, ExternalLink, RefreshCw,
  Palette, Layers, Image as ImageIcon, Play, Sliders, Maximize2,
  Minimize2, Compass, Link as LinkIcon, Eye, CheckCircle2, Globe, FileText
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import CustomStyledQRCode from '../components/CustomStyledQRCode';
import {
  downloadQROnlyImage,
  downloadCustomDesignerCard
} from '../utils/qrCardGenerator';

// Official Design Templates
const DESIGN_TEMPLATES = [
  {
    id: 'azure',
    name: 'Azure Horizon',
    description: 'Official Microsoft Azure corporate blue with cyan accents and rounded eyes',
    color1: '#0078D4',
    color2: '#00A4EF',
    angle: 45,
    bgColor: '#FFFFFF',
    cornerOuterColor: '#0078D4',
    cornerInnerColor: '#0078D4',
    cornerShape: 'rounded',
    dotShape: 'rounded',
    margin: 2,
    animation: 'circular-text',
    glowColor: '#0078D4'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'High-contrast violet & fuchsia with circular ring eyes and dynamic glow',
    color1: '#7C3AED',
    color2: '#C026D3',
    angle: 135,
    bgColor: '#FFFFFF',
    cornerOuterColor: '#7C3AED',
    cornerInnerColor: '#06B6D4',
    cornerShape: 'circle',
    dotShape: 'rounded',
    animation: 'curved-arrows',
    glowColor: '#A855F7'
  },
  {
    id: 'emerald',
    name: 'Emerald Matrix',
    description: 'Vibrant forest to mint gradient with organic smooth leaf corners',
    color1: '#047857',
    color2: '#10B981',
    angle: 90,
    bgColor: '#FFFFFF',
    cornerOuterColor: '#047857',
    cornerInnerColor: '#059669',
    cornerShape: 'leaf',
    dotShape: 'circle',
    animation: 'pulse-glow',
    glowColor: '#10B981'
  },
  {
    id: 'sunset',
    name: 'Sunset Flare',
    description: 'Dynamic rose to amber gradient with warm rounded shapes',
    color1: '#E11D48',
    color2: '#F59E0B',
    angle: 45,
    bgColor: '#FFFFFF',
    cornerOuterColor: '#E11D48',
    cornerInnerColor: '#D97706',
    cornerShape: 'rounded',
    dotShape: 'rounded',
    animation: 'curved-arrows',
    glowColor: '#F43F5E'
  },
  {
    id: 'midnight',
    name: 'Midnight Stealth',
    description: 'Deep onyx obsidian with luxury indigo accent on dark background',
    color1: '#6366F1',
    color2: '#38BDF8',
    angle: 135,
    bgColor: '#0F172A',
    cornerOuterColor: '#818CF8',
    cornerInnerColor: '#38BDF8',
    cornerShape: 'circle',
    dotShape: 'rounded',
    animation: 'orbiting-particles',
    glowColor: '#6366F1'
  },
  {
    id: 'golden',
    name: 'Golden Prestige',
    description: 'Luxury champagne bronze to amber gold with refined corners',
    color1: '#B45309',
    color2: '#FBBF24',
    angle: 45,
    bgColor: '#FFFFFF',
    cornerOuterColor: '#92400E',
    cornerInnerColor: '#D97706',
    cornerShape: 'leaf',
    dotShape: 'rounded',
    animation: 'pulse-glow',
    glowColor: '#F59E0B'
  }
];

export default function AdminQRGenerator() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'colors' | 'shapes' | 'animation' | 'card'
  const [previewMode, setPreviewMode] = useState('qr'); // 'qr' | 'card'
  const [fullscreenMode, setFullscreenMode] = useState(false);

  // Target Link Configuration (Default to official portal)
  const [targetUrl, setTargetUrl] = useState('https://www.mscprpcem.tech');

  // Official Default Microsoft Color Palette
  const DEFAULT_PRIMARY = '#0078D4'; // Azure Blue
  const DEFAULT_SECONDARY = '#00A4EF'; // Cyan Accent

  // Design & Color Configuration (Default to official Azure Horizon)
  const [selectedTemplate, setSelectedTemplate] = useState('azure');
  const [fillMode, setFillMode] = useState('gradient'); // 'gradient' | 'solid'
  const [color1, setColor1] = useState(DEFAULT_PRIMARY);
  const [color2, setColor2] = useState(DEFAULT_SECONDARY);
  const [gradientAngle, setGradientAngle] = useState(45);
  const [bgColor, setBgColor] = useState('#FFFFFF');

  // Custom Corner Eye Shapes & Colors (Default to official colors)
  const [cornerShape, setCornerShape] = useState('rounded'); // 'square' | 'rounded' | 'circle' | 'leaf'
  const [cornerOuterColor, setCornerOuterColor] = useState(DEFAULT_PRIMARY);
  const [cornerInnerColor, setCornerInnerColor] = useState(DEFAULT_PRIMARY);
  const [dotShape, setDotShape] = useState('rounded'); // 'square' | 'rounded' | 'circle'
  const [margin, setMargin] = useState(2); // Quiet zone margin in module units (Default: 2 for clean corner breathing room)

  // Center MSC Logo Settings (Clean Transparent Background, No White Space)
  const [includeLogo, setIncludeLogo] = useState(true);
  const [logoSrc, setLogoSrc] = useState('/logo.png');

  // Animation Settings (NO scanning laser line animation)
  // 'none' | 'curved-arrows' | 'circular-text' | 'pulse-glow' | 'orbiting-particles'
  const [selectedAnimation, setSelectedAnimation] = useState('curved-arrows');
  const [animationSpeed, setAnimationSpeed] = useState('normal'); // 'slow' | 'normal' | 'fast'
  const [glowColor, setGlowColor] = useState(DEFAULT_PRIMARY);

  // Designer Card Text Settings (Applied live in preview and download)
  const [cardTitle, setCardTitle] = useState('SCAN TO REGISTER & JOIN');
  const [cardSubtitle, setCardSubtitle] = useState('MICROSOFT STUDENT CLUB • PRPCEM AMRAVATI');
  const [cardDescription, setCardDescription] = useState('Point your camera at this QR code to access the official event link.');
  const [cardTheme, setCardTheme] = useState('light'); // 'light' | 'dark'

  // Action feedback states
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedQr, setCopiedQr] = useState(false);

  // Restore Official Default Microsoft Azure Palette
  const applyDefaultColors = () => {
    setSelectedTemplate('azure');
    setColor1(DEFAULT_PRIMARY);
    setColor2(DEFAULT_SECONDARY);
    setGradientAngle(45);
    setBgColor('#FFFFFF');
    setCornerOuterColor(DEFAULT_PRIMARY);
    setCornerInnerColor(DEFAULT_PRIMARY);
    setCornerShape('rounded');
    setDotShape('rounded');
    setMargin(2);
    setSelectedAnimation('curved-arrows');
    setGlowColor(DEFAULT_PRIMARY);
    setFillMode('gradient');
    toast.success('Restored official Microsoft Azure default colors!', 'Default Colors Applied');
  };

  // Apply a template preset
  const applyTemplate = (tmpl) => {
    setSelectedTemplate(tmpl.id);
    setColor1(tmpl.color1);
    setColor2(tmpl.color2);
    setGradientAngle(tmpl.angle);
    setBgColor(tmpl.bgColor);
    setCornerOuterColor(tmpl.cornerOuterColor);
    setCornerInnerColor(tmpl.cornerInnerColor);
    setCornerShape(tmpl.cornerShape);
    setDotShape(tmpl.dotShape || 'rounded');
    setMargin(tmpl.margin !== undefined ? tmpl.margin : 2);
    setSelectedAnimation(tmpl.animation || 'curved-arrows');
    setGlowColor(tmpl.glowColor || tmpl.color1);
    setFillMode('gradient');
    toast.success(`Applied ${tmpl.name} template!`, 'Template Loaded');
  };

  // Copy target link to clipboard
  const handleCopyLink = () => {
    if (!targetUrl) return;
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast.success('Target URL copied to clipboard!', 'Link Copied');
  };

  // Copy QR Image to clipboard
  const handleCopyQRImage = async () => {
    const svgEl = document.getElementById('studio-qr-svg');
    if (!svgEl) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      img.onload = async () => {
        ctx.drawImage(img, 0, 0, 1024, 1024);
        URL.revokeObjectURL(url);
        canvas.toBlob(async (pngBlob) => {
          if (pngBlob && navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([
              new window.ClipboardItem({ 'image/png': pngBlob })
            ]);
            setCopiedQr(true);
            setTimeout(() => setCopiedQr(false), 2000);
            toast.success('High-resolution QR image copied to clipboard!', 'Image Copied');
          } else {
            toast.warning('Direct image copying is not supported on this browser. Use download instead.');
          }
        }, 'image/png');
      };
      img.src = url;
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      toast.error('Failed to copy image to clipboard.');
    }
  };

  // Download QR Code Only
  const handleDownloadQROnly = async (format = 'png', size = 1024) => {
    try {
      setDownloading(true);
      const cleanSlug = targetUrl.replace(/^https?:\/\//i, '').replace(/[^a-z0-9]/gi, '-').slice(0, 24);
      const fileName = `msc-prpcem-qr-${cleanSlug || 'custom'}.${format}`;
      await downloadQROnlyImage({
        svgElementId: 'studio-qr-svg',
        size,
        format,
        fileName,
        includeLogo,
        logoSrc
      });
      toast.success(`QR Code downloaded successfully (${format.toUpperCase()} format)!`, 'Download Complete');
    } catch (err) {
      console.error('Download QR failed:', err);
      toast.error('Failed to download QR code image.');
    } finally {
      setDownloading(false);
    }
  };

  // Download Branded Designer Card
  const handleDownloadCard = async () => {
    try {
      setDownloading(true);
      const cleanSlug = targetUrl.replace(/^https?:\/\//i, '').replace(/[^a-z0-9]/gi, '-').slice(0, 24);
      const fileName = `msc-prpcem-card-${cleanSlug || 'presentation'}.png`;
      await downloadCustomDesignerCard({
        svgElementId: 'studio-qr-svg',
        cardTitle,
        cardSubtitle,
        cardDescription,
        targetUrl,
        theme: cardTheme,
        primaryColor: color1,
        secondaryColor: fillMode === 'gradient' ? color2 : color1,
        fileName,
        includeArrow: selectedAnimation === 'curved-arrows',
        includeLogo,
        logoSrc
      });
      toast.success('High-resolution presentation card downloaded!', 'Card Saved');
    } catch (err) {
      console.error('Download card failed:', err);
      toast.error('Failed to generate branded presentation card.');
    } finally {
      setDownloading(false);
    }
  };

  // Animation Speed CSS helper
  const getAnimDuration = () => {
    switch (animationSpeed) {
      case 'slow': return '6s';
      case 'fast': return '1.8s';
      case 'normal':
      default: return '3.2s';
    }
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-12 font-segoe text-slate-800">

      {/* ════════ HEADER BAR (RESPONSIVE) ════════ */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <QrCode size={24} className="sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                MSC PRPCEM QR Studio
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 uppercase tracking-wide border border-blue-200">
                STUDIO
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Custom QR code generator for any external URL or portal link with official MSC branding.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFullscreenMode(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            title="Open Fullscreen Presenter Mode"
          >
            <Maximize2 size={14} />
            <span>Presenter Mode</span>
          </button>
        </div>
      </div>

      {/* 1. Target URL Input Card (Full width on all screens for fast, direct entry) */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <LinkIcon size={14} className="text-[#0078D4]" />
            <span>1. Target Link / URL</span>
          </label>
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold">Any External Link or Event</span>
        </div>

        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Compass size={16} />
          </div>
          <input
            type="url"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            placeholder="https://www.eventbrite.com/... or https://www.mscprpcem.tech"
            className="w-full pl-10 pr-20 sm:pr-24 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs font-mono font-bold text-slate-900 outline-none focus:bg-white focus:border-[#0078D4] focus:ring-2 focus:ring-[#0078D4]/20 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg sm:rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              title="Copy link"
            >
              {copiedLink ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
            {targetUrl && (
              <a
                href={targetUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-[#0078D4] hover:text-[#005a9e] hover:bg-blue-50 rounded-lg sm:rounded-xl cursor-pointer transition-colors"
                title="Open link in new tab"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Paste any external link (Eventbrite, Form, Portal, etc.) or web address. Updates in real-time.</span>
        </div>
      </div>

      {/* ════════ MAIN 2-COLUMN WORKSPACE (RESPONSIVE: PREVIEW ON TOP FOR MOBILE) ════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">

        {/* ─── LEFT COLUMN: STUDIO CONFIGURATION CONTROLS (7 Cols on desktop, order-2 on mobile) ─── */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5 order-2 lg:order-1">

          {/* 2. Studio Customization Tabs */}
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sliders size={14} className="text-blue-600" />
                <span>2. Customize Design & Colors</span>
              </span>
            </div>

            {/* Segmented Tab Headers (Scrollable on Mobile, Grid on Tablet+) */}
            <div className="flex overflow-x-auto no-scrollbar sm:grid sm:grid-cols-5 gap-1 p-1 bg-slate-100 rounded-2xl">
              {[
                { id: 'templates', label: 'Presets', icon: Sparkles },
                { id: 'colors', label: 'Colors', icon: Palette },
                { id: 'shapes', label: 'Corners', icon: Layers },
                { id: 'animation', label: 'Animation', icon: Play },
                { id: 'card', label: 'Card Text', icon: ImageIcon }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-3 sm:px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 sm:shrink ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-xs border border-blue-100 font-black'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={14} />
                    <span className="whitespace-nowrap sm:truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT 1: PRESETS */}
            {activeTab === 'templates' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Select an Official Preset Style:</span>
                  <span className="text-[10px] text-blue-600 font-bold">1-Click Apply</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DESIGN_TEMPLATES.map((tmpl) => {
                    const isSelected = selectedTemplate === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => applyTemplate(tmpl)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 relative group ${
                          isSelected
                            ? 'bg-blue-50/40 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        {/* Gradient Swatch Box */}
                        <div
                          className="w-10 h-10 rounded-xl shadow-xs shrink-0 flex items-center justify-center text-white font-black text-xs"
                          style={{
                            background: `linear-gradient(${tmpl.angle}deg, ${tmpl.color1}, ${tmpl.color2})`
                          }}
                        >
                          <QrCode size={18} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                              {tmpl.name}
                            </span>
                            {isSelected && (
                              <CheckCircle2 size={15} className="text-blue-600 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed font-medium">
                            {tmpl.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: COLORS & GRADIENT */}
            {activeTab === 'colors' && (
              <div className="space-y-5 animate-fade-in text-xs">
                
                {/* Official Default Microsoft Palette Banner */}
                <div className="flex items-center justify-between p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl shadow-xs shrink-0 flex items-center justify-center text-white"
                      style={{ background: 'linear-gradient(45deg, #0078D4, #00A4EF)' }}
                    >
                      <Palette size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Official Microsoft Default Palette
                      </span>
                      <span className="text-[10px] text-blue-700 font-medium">
                        Azure Blue (#0078D4) & Cyan (#00A4EF)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={applyDefaultColors}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs"
                  >
                    Keep Default Color
                  </button>
                </div>
                
                {/* Fill Mode Switcher */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    QR Foreground Fill Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFillMode('gradient')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        fillMode === 'gradient'
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-black shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      🌈 Linear Gradient
                    </button>
                    <button
                      type="button"
                      onClick={() => setFillMode('solid')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        fillMode === 'solid'
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-black shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                      }`}
                    >
                      ⬛ Solid Color
                    </button>
                  </div>
                </div>

                {/* Primary & Secondary Color Pickers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Primary Color (Color 1)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color1}
                        onChange={(e) => setColor1(e.target.value)}
                        className="w-10 h-10 rounded-xl border border-slate-200 p-0.5 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color1}
                        onChange={(e) => setColor1(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase text-slate-800"
                      />
                    </div>
                  </div>

                  {fillMode === 'gradient' && (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Secondary Color (Color 2)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color2}
                          onChange={(e) => setColor2(e.target.value)}
                          className="w-10 h-10 rounded-xl border border-slate-200 p-0.5 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={color2}
                          onChange={(e) => setColor2(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase text-slate-800"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Gradient Direction Angle */}
                {fillMode === 'gradient' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Gradient Angle</span>
                      <span className="text-blue-600 font-black">{gradientAngle}°</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: '45° Diagonal', val: 45 },
                        { label: '90° Horizontal', val: 90 },
                        { label: '135° Inverse', val: 135 },
                        { label: '180° Vertical', val: 180 }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setGradientAngle(item.val)}
                          className={`py-2 px-1 text-center rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                            gradientAngle === item.val
                              ? 'bg-blue-100 text-blue-900 border-blue-300 font-black'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Background Color */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Canvas Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border border-slate-200 p-0.5 cursor-pointer"
                    />
                    <div className="flex gap-2">
                      {[
                        { label: 'Pure White', val: '#FFFFFF' },
                        { label: 'Off-White', val: '#F8FAFC' },
                        { label: 'Slate Dark', val: '#0F172A' }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setBgColor(item.val)}
                          className={`px-3 py-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                            bgColor === item.val
                              ? 'bg-slate-800 text-white border-slate-900 shadow-2xs font-extrabold'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT 3: CORNERS & SHAPES (Circular rings, leaf, outer & inner colors) */}
            {activeTab === 'shapes' && (
              <div className="space-y-5 animate-fade-in text-xs">
                
                {/* Corner Eye Shape (Circle Ring, Leaf, Rounded, Square) */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-2">
                    Corner Eye Frame & Finder Shape
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'circle', label: 'Circular Ring', icon: '🔘', desc: 'Perfect circular outer ring & pupil' },
                      { id: 'leaf', label: 'Smooth Leaf', icon: '🍃', desc: 'Dual-curve organic leaf corners' },
                      { id: 'rounded', label: 'Smooth Rounded', icon: '🔲', desc: 'Soft modern rounded boxes' },
                      { id: 'square', label: 'Classic Square', icon: '⬛', desc: 'Crisp traditional square frame' }
                    ].map((shape) => (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() => setCornerShape(shape.id)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          cornerShape === shape.id
                            ? 'bg-blue-50 border-blue-600 text-blue-900 font-black shadow-2xs ring-2 ring-blue-500/20'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                      >
                        <span className="text-xl block mb-1">{shape.icon}</span>
                        <span className="text-xs font-black block">{shape.label}</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">{shape.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Corner Eye Colors (Outer Ring & Inner Pupil) */}
                <div className="p-3.5 sm:p-4 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-3">
                  <span className="text-xs font-black text-blue-950 uppercase tracking-wide block">
                    Corner Outer & Inner Ring Colors
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Outer Color Ring (Frame)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={cornerOuterColor}
                          onChange={(e) => setCornerOuterColor(e.target.value)}
                          className="w-9 h-9 rounded-xl border border-blue-200 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={cornerOuterColor}
                          onChange={(e) => setCornerOuterColor(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-xs font-mono font-bold uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Inner Color Ring (Pupil Dot)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={cornerInnerColor}
                          onChange={(e) => setCornerInnerColor(e.target.value)}
                          className="w-9 h-9 rounded-xl border border-blue-200 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={cornerInnerColor}
                          onChange={(e) => setCornerInnerColor(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-xs font-mono font-bold uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body Data Dots Shape */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Body Data Modules Shape
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'rounded', label: 'Smooth Rounded', icon: '▪️' },
                      { id: 'circle', label: 'Circular Dots', icon: '⚪' },
                      { id: 'square', label: 'Sharp Squares', icon: '⬛' }
                    ].map((dt) => (
                      <button
                        key={dt.id}
                        type="button"
                        onClick={() => setDotShape(dt.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          dotShape === dt.id
                            ? 'bg-blue-100 text-blue-900 border-blue-300 font-bold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <span className="text-sm block">{dt.icon}</span>
                        <span className="text-xs font-bold">{dt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Center MSC Logo Controls */}
                <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-2xs">
                        <img src="/logo.png" alt="MSC Logo" className="w-6 h-6 object-contain" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block">
                          MSC PRPCEM Center Logo
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Transparent background (perfectly centered, no white void)
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIncludeLogo(!includeLogo)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs ${
                        includeLogo
                          ? 'bg-[#0078D4] text-white'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {includeLogo ? 'Logo Active' : 'No Logo'}
                    </button>
                  </div>
                </div>

                {/* 5. QR Corner Spacing & Outer Margin (Quiet Zone Adjustment) */}
                <div className="p-3.5 sm:p-4 bg-blue-50/50 border border-blue-200/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-black text-slate-900 block">
                        Corner Spacing & Outer Margin (Quiet Zone)
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Adjust breathing room around corners so the QR doesn't touch the edges when downloading
                      </span>
                    </div>
                    <span className="px-2.5 py-1 bg-white border border-blue-200 rounded-xl text-xs font-mono font-black text-[#0078D4] shadow-2xs">
                      {margin} {margin === 1 ? 'module' : 'modules'} ({margin === 0 ? 'Flush' : margin === 2 ? 'Standard (Default)' : margin === 4 ? 'Wide' : 'Custom'})
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <input
                      type="range"
                      min="0"
                      max="4"
                      step="1"
                      value={margin}
                      onChange={(e) => setMargin(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0078D4]"
                    />

                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {[
                        { val: 0, label: 'Flush', sub: '0' },
                        { val: 1, label: 'Compact', sub: '1' },
                        { val: 2, label: 'Standard', sub: '2 (Default)' },
                        { val: 3, label: 'Spacious', sub: '3' },
                        { val: 4, label: 'Wide', sub: '4' }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setMargin(item.val)}
                          className={`py-1.5 px-1 rounded-xl text-center border transition-all cursor-pointer ${
                            margin === item.val
                              ? 'bg-[#0078D4] text-white border-[#0078D4] font-black shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 font-bold'
                          }`}
                        >
                          <span className="text-[11px] block">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT 4: DYNAMIC ANIMATIONS (NO scanning line) */}
            {activeTab === 'animation' && (
              <div className="space-y-4 animate-fade-in text-xs">
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    Choose QR Animation Effect
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Live dynamic animations for presenter screens, workshops, and projector displays
                  </span>
                </div>

                {/* Selectable Animation Cards (Scanning line animation removed!) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'curved-arrows',
                      title: 'Bouncing Curved Arrows',
                      desc: 'Animated curved neon pointers and "Scan Here!" micro-badge',
                      icon: '🏹'
                    },
                    {
                      id: 'circular-text',
                      title: 'Circular Rotating Ribbon',
                      desc: 'Curved rotating SVG text ribbon around the perimeter',
                      icon: '🔄'
                    },
                    {
                      id: 'pulse-glow',
                      title: 'Pulsing Halo Aura',
                      desc: 'Radiant breathing neon glow radiating from the QR boundary',
                      icon: '💫'
                    },
                    {
                      id: 'orbiting-particles',
                      title: 'Orbiting Particles',
                      desc: 'Cosmic glowing beads spinning in an orbital path',
                      icon: '🪐'
                    },
                    {
                      id: 'none',
                      title: 'Static / Clean Display',
                      desc: 'No animation overlay, ideal for standard print use',
                      icon: '⏸️'
                    }
                  ].map((anim) => {
                    const isSelected = selectedAnimation === anim.id;
                    return (
                      <button
                        key={anim.id}
                        type="button"
                        onClick={() => setSelectedAnimation(anim.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 relative group ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-slate-50/60 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <span className="text-2xl shrink-0 p-1 bg-white rounded-xl shadow-2xs border border-slate-100">
                          {anim.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                              {anim.title}
                            </span>
                            {isSelected && <Check size={14} className="text-blue-600" />}
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                            {anim.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Animation Speed & Accent Glow Color */}
                {selectedAnimation !== 'none' && (
                  <div className="p-3.5 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Animation Speed
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { label: 'Slow', val: 'slow' },
                            { label: 'Normal', val: 'normal' },
                            { label: 'Fast', val: 'fast' }
                          ].map((sp) => (
                            <button
                              key={sp.val}
                              type="button"
                              onClick={() => setAnimationSpeed(sp.val)}
                              className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                animationSpeed === sp.val
                                  ? 'bg-blue-600 text-white border-blue-600 font-black shadow-2xs'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {sp.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">
                          Animation Accent Glow Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={glowColor}
                            onChange={(e) => setGlowColor(e.target.value)}
                            className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={glowColor}
                            onChange={(e) => setGlowColor(e.target.value)}
                            className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 5: DESIGNER CARD TEXT (Live applied!) */}
            {activeTab === 'card' && (
              <div className="space-y-4 animate-fade-in text-xs">
                <div>
                  <span className="text-xs font-black text-slate-900 block">
                    Designer Presentation Card Typography
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold">
                    Updates live in "Card" preview & downloads
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Card Title *
                  </label>
                  <input
                    type="text"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    placeholder="e.g. SCAN TO REGISTER & JOIN"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Card Subtitle / Category
                  </label>
                  <input
                    type="text"
                    value={cardSubtitle}
                    onChange={(e) => setCardSubtitle(e.target.value)}
                    placeholder="e.g. MICROSOFT STUDENT CLUB • PRPCEM AMRAVATI"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Card Description / Scan Prompt
                  </label>
                  <textarea
                    rows={2}
                    value={cardDescription}
                    onChange={(e) => setCardDescription(e.target.value)}
                    placeholder="Point your smartphone camera at this QR code to access the event instantly."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Card Background Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCardTheme('light')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        cardTheme === 'light'
                          ? 'bg-blue-50 text-blue-900 border-blue-500 font-black shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                      }`}
                    >
                      ☀️ Clean Light Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardTheme('dark')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        cardTheme === 'dark'
                          ? 'bg-slate-900 text-white border-slate-900 font-black shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                      }`}
                    >
                      🌙 Midnight Dark Mode
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* ─── RIGHT COLUMN: LIVE STUDIO PREVIEW & DOWNLOADS (5 Cols on desktop, order-1 on mobile) ─── */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-5 order-1 lg:order-2">

          {/* Preview Container Card */}
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5 text-center sticky top-6">

            {/* Preview Toggle Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Eye size={14} className="text-blue-600" />
                <span>Live Preview</span>
              </span>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewMode('qr')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    previewMode === 'qr' ? 'bg-white text-blue-700 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  QR Only
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('card')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    previewMode === 'card' ? 'bg-white text-blue-700 shadow-2xs font-black' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Card
                </button>
              </div>
            </div>

            {/* ═══ LIVE PREVIEW STAGE (RESPONSIVE) ═══ */}
            <div
              className="relative p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[360px] overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: previewMode === 'card' && cardTheme === 'dark' ? '#0F172A' : (previewMode === 'card' ? '#FFFFFF' : bgColor),
                color: previewMode === 'card' && cardTheme === 'dark' ? '#F8FAFC' : '#0F172A'
              }}
            >
              {/* Dynamic Animations Behind / Around QR */}

              {/* 1. Pulsing Halo Aura Animation */}
              {selectedAnimation === 'pulse-glow' && (
                <div
                  className="absolute inset-0 m-auto rounded-full pointer-events-none opacity-40 animate-ping w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] max-w-[85vw] max-h-[85vw]"
                  style={{
                    backgroundColor: glowColor,
                    animationDuration: getAnimDuration()
                  }}
                />
              )}

              {/* 2. Orbiting Particles Animation */}
              {selectedAnimation === 'orbiting-particles' && (
                <div
                  className="absolute inset-0 m-auto pointer-events-none w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] max-w-[85vw] max-h-[85vw]"
                  style={{
                    animation: `spin ${getAnimDuration()} linear infinite`
                  }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-md absolute top-0 left-1/2 -translate-x-1/2 animate-pulse"
                    style={{ backgroundColor: glowColor, boxShadow: `0 0 12px ${glowColor}` }}
                  />
                  <div
                    className="w-2.5 h-2.5 rounded-full shadow-md absolute bottom-0 left-1/2 -translate-x-1/2 opacity-70"
                    style={{ backgroundColor: color2 || glowColor }}
                  />
                  <div
                    className="w-2 h-2 rounded-full absolute top-1/2 right-0 -translate-y-1/2 opacity-50"
                    style={{ backgroundColor: color1 }}
                  />
                </div>
              )}

              {/* 3. Circular Rotating Curved Text Ribbon */}
              {selectedAnimation === 'circular-text' && (
                <div
                  className="absolute pointer-events-none select-none z-20 w-[250px] h-[250px] sm:w-[290px] sm:h-[290px] max-w-[85vw] max-h-[85vw]"
                  style={{
                    animation: `spin ${getAnimDuration()} linear infinite`
                  }}
                >
                  <svg viewBox="0 0 300 300" className="w-full h-full">
                    <defs>
                      <path
                        id="textCirclePath"
                        d="M 150, 150 m -118, 0 a 118,118 0 1,1 236,0 a 118,118 0 1,1 -236,0"
                      />
                    </defs>
                    <text
                      fill={glowColor}
                      fontSize="10"
                      fontWeight="900"
                      letterSpacing="3"
                      style={{ textTransform: 'uppercase' }}
                    >
                      <textPath href="#textCirclePath" startOffset="0%">
                        ★ MSC PRPCEM AMRAVATI ★ SCAN WITH CAMERA ★ JOIN NOW ★
                      </textPath>
                    </text>
                  </svg>
                </div>
              )}

              {/* 4. Bouncing Curved Arrows Animation */}
              {selectedAnimation === 'curved-arrows' && (
                <>
                  <div
                    className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex flex-col items-center animate-bounce"
                    style={{ animationDuration: '1.4s' }}
                  >
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[9px] font-black text-white shadow-md uppercase tracking-wider"
                      style={{ backgroundColor: glowColor }}
                    >
                      Scan Here!
                    </span>
                    <span className="text-base font-black -mt-1" style={{ color: glowColor }}>
                      ▼
                    </span>
                  </div>

                  {/* Left Curved Pointer */}
                  <div
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none z-20 hidden sm:block animate-pulse"
                    style={{ color: glowColor }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12h14" />
                      <path d="M12 6l6 6-6 6" />
                    </svg>
                  </div>

                  {/* Right Curved Pointer */}
                  <div
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none z-20 hidden sm:block animate-pulse"
                    style={{ color: glowColor }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 12H6" />
                      <path d="M12 6l-6 6 6 6" />
                    </svg>
                  </div>
                </>
              )}

              {/* CARD MODE: Live Card Header details */}
              {previewMode === 'card' && (
                <div className="w-full max-w-xs mb-3 space-y-1 text-center animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 mx-auto p-0.5 shadow-2xs mb-1 flex items-center justify-center">
                    <img src="/logo.png" alt="MSC Logo" className="w-6 h-6 object-contain" />
                  </div>
                  <div className="text-[11px] sm:text-[12px] font-black uppercase tracking-wider">
                    {cardTitle}
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-bold opacity-75 truncate">
                    {cardSubtitle}
                  </div>
                </div>
              )}

              {/* ─── THE CORE ULTRA-CUSTOMIZABLE QR CODE SVG COMPONENT ─── */}
              <div className="relative p-2.5 sm:p-3 bg-white rounded-2xl shadow-xs border border-slate-200/80 z-10">
                <CustomStyledQRCode
                  id="studio-qr-svg"
                  value={targetUrl || 'https://www.mscprpcem.tech'}
                  size={previewMode === 'card' ? 160 : 210}
                  margin={margin}
                  fillMode={fillMode}
                  color1={color1}
                  color2={color2}
                  gradientAngle={gradientAngle}
                  bgColor="#FFFFFF"
                  cornerShape={cornerShape}
                  cornerOuterColor={cornerOuterColor}
                  cornerInnerColor={cornerInnerColor}
                  dotShape={dotShape}
                  includeLogo={includeLogo}
                  logoSrc={logoSrc}
                />
              </div>

              {/* CARD MODE: Live Card Footer details */}
              {previewMode === 'card' && (
                <div className="w-full max-w-xs mt-3 space-y-1 text-center animate-fade-in">
                  <div
                    className="py-0.5 px-3 rounded-full text-[9px] font-black text-white inline-block shadow-2xs"
                    style={{
                      background: `linear-gradient(90deg, ${color1}, ${color2})`
                    }}
                  >
                    📷 SCAN WITH CAMERA
                  </div>
                  <div className="text-[9px] font-mono opacity-60 truncate px-2">
                    {targetUrl}
                  </div>
                  <div className="text-[9px] opacity-75 line-clamp-1 px-2">
                    {cardDescription}
                  </div>
                </div>
              )}

            </div>

            {/* ══════ CLEAN, NORMAL DOWNLOAD BUTTONS (JUST PNG/SVG/CARD, NO BUTTONS IN BUTTONS) ══════ */}
            <div className="pt-3 border-t border-slate-100">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={downloading}
                  onClick={() => handleDownloadQROnly('png', 1024)}
                  className="py-2.5 px-3 bg-[#0078D4] hover:bg-[#006cbd] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  title="Download PNG QR"
                >
                  {downloading ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                  <span>PNG</span>
                </button>

                <button
                  type="button"
                  disabled={downloading}
                  onClick={() => handleDownloadQROnly('svg')}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 border border-slate-200 shadow-2xs"
                  title="Download SVG Vector"
                >
                  <Download size={14} />
                  <span>SVG</span>
                </button>

                <button
                  type="button"
                  disabled={downloading}
                  onClick={handleDownloadCard}
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 border border-slate-200 shadow-2xs"
                  title="Download Presentation Card"
                >
                  <Download size={14} />
                  <span>Card</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ════════ FULLSCREEN PRESENTER MODE (AUDITORIUM SCREEN) ════════ */}
      {fullscreenMode && (
        <div className="fixed inset-0 z-[99999] bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 animate-fade-in overflow-hidden select-none">
          
          {/* Top Presenter Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="MSC Logo" className="w-10 h-10 object-contain rounded-xl bg-white p-1" />
              <div>
                <h2 className="text-base font-black tracking-tight leading-none text-white">
                  MICROSOFT STUDENT CLUB
                </h2>
                <span className="text-xs text-blue-400 font-bold block mt-1">
                  PRPCEM AMRAVATI • AUDITORIUM DISPLAY
                </span>
              </div>
            </div>

            <button
              onClick={() => setFullscreenMode(false)}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <Minimize2 size={16} />
              <span>Exit</span>
            </button>
          </div>

          {/* Center Stage: Responsive Giant QR Code */}
          <div className="my-auto flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6">
            
            <div className="space-y-1.5">
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-blue-600/30 text-blue-300 border border-blue-500/40 uppercase tracking-widest inline-block animate-pulse">
                ★ SCAN WITH ANY SMARTPHONE CAMERA ★
              </span>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                {cardTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-lg mx-auto">
                {cardSubtitle}
              </p>
            </div>

            {/* Giant QR with Center Logo */}
            <div className="relative p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-blue-500/50">
              <CustomStyledQRCode
                value={targetUrl || 'https://www.mscprpcem.tech'}
                size={window.innerWidth < 640 ? 220 : 340}
                margin={margin}
                fillMode={fillMode}
                color1={color1}
                color2={color2}
                gradientAngle={gradientAngle}
                bgColor="#FFFFFF"
                cornerShape={cornerShape}
                cornerOuterColor={cornerOuterColor}
                cornerInnerColor={cornerInnerColor}
                dotShape={dotShape}
                includeLogo={includeLogo}
                logoSrc={logoSrc}
              />
            </div>

            {/* Target URL in mono */}
            <div className="bg-white/10 backdrop-blur-md px-4 sm:px-6 py-2 rounded-xl sm:rounded-2xl border border-white/10 font-mono text-xs sm:text-sm text-blue-300 font-bold max-w-sm sm:max-w-md truncate">
              {targetUrl}
            </div>
          </div>

          {/* Presenter Footer */}
          <div className="text-center text-xs text-slate-500 font-semibold">
            Press ESC or click Exit to return to Admin Portal
          </div>
        </div>
      )}

      {/* Global CSS for Spin Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}
