import base64
import os

assets_dir = os.path.join(os.path.dirname(__file__), '../backend/src/assets/email')

def b64(filename):
    path = os.path.join(assets_dir, filename)
    with open(path, 'rb') as f:
        data = f.read()
    return f'data:image/png;base64,{base64.b64encode(data).decode("utf-8")}'

logo_b64 = b64('msc_logo.png')
hero_desktop_b64 = b64('email_hero_desktop.png')
hero_mobile_b64 = b64('email_hero_banner.png')
force_for_good_b64 = b64('email_force_for_good.png')
icon_ig = b64('icon_instagram.png')
icon_li = b64('icon_linkedin.png')
icon_yt = b64('icon_youtube.png')
icon_web = b64('icon_website.png')

html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MSC PRPCEM — Standard Email Template Preview</title>
  <style>
    *, *:before, *:after {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      padding: 0;
      background-color: #0b1329;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
    }}
    
    /* Top Sticky Toolbar */
    .preview-toolbar {{
      position: sticky;
      top: 0;
      z-index: 1000;
      background: rgba(11, 19, 41, 0.96);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }}
    .brand-title {{
      display: flex;
      align-items: center;
      gap: 12px;
      color: #ffffff;
      font-size: 15px;
      font-weight: 800;
    }}
    .brand-badge {{
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: #ffffff;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}
    .device-tabs {{
      display: flex;
      align-items: center;
      gap: 6px;
      background: #1e293b;
      padding: 4px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }}
    .tab-btn {{
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 13px;
      font-weight: 700;
      padding: 8px 18px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 7px;
      transition: all 0.2s ease;
    }}
    .tab-btn:hover {{
      color: #ffffff;
      background: rgba(255, 255, 255, 0.05);
    }}
    .tab-btn.active {{
      background: #2563eb;
      color: #ffffff;
      box-shadow: 0 2px 10px rgba(37, 99, 235, 0.4);
    }}

    /* Preview Canvas */
    .preview-canvas {{
      min-height: calc(100vh - 65px);
      padding: 36px 16px 80px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      background: #f1f5f9;
      transition: all 0.3s ease;
    }}

    .view-section {{
      display: none;
      width: 100%;
    }}
    .view-section.active {{
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: fadeIn 0.25s ease;
    }}

    @keyframes fadeIn {{
      from {{ opacity: 0; transform: translateY(6px); }}
      to {{ opacity: 1; transform: translateY(0); }}
    }}

    /* Sub-view mode toggles (Live Content vs Template Placeholder) */
    .mode-bar {{
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: #e2e8f0;
      padding: 4px;
      border-radius: 10px;
    }}
    .mode-btn {{
      background: transparent;
      border: none;
      color: #475569;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .mode-btn:hover {{
      color: #0f172a;
    }}
    .mode-btn.active {{
      background: #ffffff;
      color: #2563eb;
      font-weight: 800;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }}

    /* Email Container Layouts */
    .email-laptop-card {{
      max-width: 740px;
      width: 100%;
      background: #ffffff;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 16px 48px rgba(15, 23, 42, 0.1);
      overflow: hidden;
      margin: 0 auto;
    }}

    .email-mobile-card {{
      max-width: 420px;
      width: 100%;
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 16px 48px rgba(15, 23, 42, 0.1);
      overflow: hidden;
      margin: 0 auto;
    }}

    /* Dynamic Content Placeholder Box (Matches reference diagram exactly) */
    .dynamic-placeholder-box {{
      margin: 22px 0;
      border: 1.5px dashed #93c5fd;
      background: #f8fafc;
      border-radius: 16px;
      padding: 42px 24px;
      text-align: center;
    }}

    /* Use case selector */
    .use-case-bar {{
      margin-bottom: 22px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }}
    .use-case-btn {{
      background: #ffffff;
      border: 1px solid #cbd5e1;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s ease;
    }}
    .use-case-btn:hover {{
      border-color: #2563eb;
      color: #2563eb;
    }}
    .use-case-btn.active {{
      background: #eff6ff;
      border-color: #2563eb;
      color: #1d4ed8;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
    }}

    /* Rich Content Elements */
    .badge {{
      display: inline-block;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 800;
      border-radius: 6px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }}
    .cta-btn {{
      background: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 15px;
      font-weight: 700;
      padding: 14px 34px;
      border-radius: 10px;
      display: inline-block;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      transition: all 0.2s ease;
    }}
    .cta-btn:hover {{
      background: #1d4ed8;
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
    }}
  </style>
</head>
<body>

  <!-- Top Toolbar -->
  <div class="preview-toolbar">
    <div class="brand-title">
      <img src="{logo_b64}" width="30" height="30" alt="MSC PRPCEM Logo" style="display:block;" />
      <span>MSC PRPCEM Email Template Standard</span>
      <span class="brand-badge">Official Standard</span>
    </div>

    <div class="device-tabs">
      <button class="tab-btn active" onclick="switchDevice('laptop', this)">
        💻 Laptop View (740px)
      </button>
      <button class="tab-btn" onclick="switchDevice('mobile', this)">
        📱 Mobile View (420px)
      </button>
      <button class="tab-btn" onclick="switchDevice('scenarios', this)">
        ⚡ Live Scenarios (OTP, Quiz, Ticket)
      </button>
    </div>
  </div>

  <!-- Main Canvas -->
  <div class="preview-canvas">

    <!-- ══════════════════════════════════════════════════════════════════
         TAB 1: LAPTOP / DESKTOP VIEW (740px)
         Matches media_1790869686492.png exactly!
         ══════════════════════════════════════════════════════════════════ -->
    <div id="view-laptop" class="view-section active">

      <!-- Sub-mode switcher: Real Live Content vs Wireframe Box -->
      <div class="mode-bar">
        <button class="mode-btn active" onclick="switchLaptopMode('real', this)">
          ✨ Live Sample Content
        </button>
        <button class="mode-btn" onclick="switchLaptopMode('placeholder', this)">
          📐 Wireframe (Dynamic Content Area)
        </button>
      </div>

      <div class="email-laptop-card">
        <!-- 1. Header Navigation Bar (Simplified: Logo + MSC PRPCEM on left, Be a Force for Good. on right, vertically centered) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-bottom: 1px solid #f1f5f9;">
          <tr>
            <td style="padding: 22px 36px 18px 36px; vertical-align: middle;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <!-- Left: Logo + "MSC PRPCEM" vertically centered (No extra subtitle text) -->
                  <td align="left" valign="middle" style="vertical-align: middle;">
                    <a href="https://www.mscprpcem.tech" target="_blank" style="text-decoration: none; display: inline-block; vertical-align: middle;">
                      <table border="0" cellpadding="0" cellspacing="0" style="vertical-align: middle;">
                        <tr>
                          <td valign="middle" style="padding-right: 12px; line-height: 0; vertical-align: middle;">
                            <img src="{logo_b64}" alt="MSC PRPCEM Logo" width="46" height="46" style="display: block; width: 46px; height: 46px; border: 0; outline: none; vertical-align: middle;" />
                          </td>
                          <td valign="middle" style="line-height: 1; vertical-align: middle;">
                            <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 21px; font-weight: 900; color: #0f172a; letter-spacing: -0.3px; vertical-align: middle; display: inline-block;">
                              MSC PRPCEM
                            </span>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>

                  <!-- Right: "Be a Force for Good." vertically centered & aligned -->
                  <td align="right" valign="middle" style="vertical-align: middle;">
                    <a href="https://www.mscprpcem.tech" target="_blank" style="text-decoration: none; display: inline-block; vertical-align: middle;">
                      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 17px; font-weight: 800; color: #0f172a; letter-spacing: -0.2px; line-height: 1.2;">
                        Be a <span style="color: #2563eb;">Force for Good</span>.
                      </div>
                      <div style="height: 2.5px; width: 68px; background: linear-gradient(90deg, #2563eb, #6366f1); margin: 3px 0 0 auto; border-radius: 2px;"></div>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- 2. Hero Banner (Campus building & clouds artwork for Laptop) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 0; line-height: 0; background-color: #ffffff;">
              <a href="https://www.mscprpcem.tech" target="_blank" style="display: block; text-decoration: none;">
                <img src="{hero_desktop_b64}" alt="Microsoft Student Club PRPCEM - A community of curious minds, creating opportunities for a better tomorrow." width="740" style="display: block; width: 100%; max-width: 740px; height: auto; border: 0; outline: none;" />
              </a>
            </td>
          </tr>
        </table>

        <!-- 3. Dynamic Content Body Area -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 36px 44px 28px 44px; background-color: #ffffff; color: #334155; font-size: 15px; line-height: 1.65;">
              
              <!-- Greeting: Hi {{Name}}, -->
              <p style="margin: 0 0 20px 0; font-size: 21px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                Hi <span style="color: #2563eb; font-weight: 800;">Aditya Sharma</span>,
              </p>

              <!-- SUB-MODE A: REAL LIVE SAMPLE CONTENT -->
              <div id="laptop-mode-real">
                
                <!-- Notice Badge -->
                <div style="margin-bottom: 12px;">
                  <span class="badge" style="background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;">
                    🚀 FLAGSHIP EVENT • INVITATION &amp; SCHEDULE
                  </span>
                </div>

                <!-- Event Main Title -->
                <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                  National Tech Odyssey 2026: Campus Code &amp; Quiz Championship
                </h2>

                <p style="margin: 0 0 20px 0; font-size: 15px; color: #475569; line-height: 1.65;">
                  We are thrilled to invite you to the premier technical competition hosted by <strong>Microsoft Student Club PRPCEM</strong>. Test your skills across Cloud Architecture, Web Engineering, and AI Algorithms with students from across the country.
                </p>

                <!-- Key Highlights Card -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin: 20px 0;">
                  <tr>
                    <td style="padding: 20px 24px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td width="33%" style="padding-right: 12px; vertical-align: top; border-right: 1px solid #e2e8f0;">
                            <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 0.5px;">Schedule</div>
                            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 4px;">Oct 10, 2026</div>
                            <div style="font-size: 12px; color: #2563eb; font-weight: 600; margin-top: 2px;">11:00 AM IST</div>
                          </td>
                          <td width="33%" style="padding: 0 16px; vertical-align: top; border-right: 1px solid #e2e8f0;">
                            <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 0.5px;">Format</div>
                            <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 4px;">60 Minutes</div>
                            <div style="font-size: 12px; color: #475569; margin-top: 2px;">40 MCQs + 2 Code</div>
                          </td>
                          <td width="34%" style="padding-left: 16px; vertical-align: top;">
                            <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 0.5px;">Recognition</div>
                            <div style="font-size: 15px; font-weight: 800; color: #16a34a; margin-top: 4px;">₹15,000 Pool</div>
                            <div style="font-size: 12px; color: #475569; margin-top: 2px;">Verified Certificate</div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Action Button -->
                <div style="text-align: center; margin: 26px 0 24px 0;">
                  <a href="https://quiz.mscprpcem.tech" target="_blank" class="cta-btn">
                    🚀 Confirm Participation &amp; View Portal &rarr;
                  </a>
                  <div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">
                    Pass ID: <span style="font-family: monospace; font-weight: 700; color: #475569;">MSC-2026-NTO-8492</span> • Proctored Assessment
                  </div>
                </div>

                <!-- Guidelines List -->
                <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 8px; padding: 14px 18px; margin-top: 20px;">
                  <div style="font-weight: 800; color: #1e3a8a; font-size: 13px; margin-bottom: 6px;">
                    Important Participant Guidelines:
                  </div>
                  <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #3b82f6; line-height: 1.6;">
                    <li><span style="color: #334155;">Ensure laptop with webcam and stable internet connection.</span></li>
                    <li><span style="color: #334155;">Results and leaderboard will be announced immediately after conclusion.</span></li>
                    <li><span style="color: #334155;">Official verified credentials issued via verify.mscprpcem.tech platform.</span></li>
                  </ul>
                </div>

              </div>

              <!-- SUB-MODE B: DYNAMIC CONTENT AREA WIREFRAME PLACEHOLDER -->
              <div id="laptop-mode-placeholder" style="display: none;">
                <div class="dynamic-placeholder-box">
                  <!-- Photo/Media placeholder icon (clean outline without inner blue box) -->
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: 0 auto 14px auto;">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 17px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">
                    Dynamic Content Area
                  </div>
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #64748b; line-height: 1.5; max-width: 440px; margin: 0 auto;">
                    (Event details, certificate, voucher, reminder,<br />updates, etc. will appear here)
                  </div>
                </div>
              </div>

              <!-- Sign-off Section -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 36px; border-top: 1px solid #f1f5f9; padding-top: 24px;">
                <tr>
                  <!-- Left: Official Signature -->
                  <td valign="bottom" align="left" style="text-align: left; vertical-align: bottom; width: 62%;">
                    <div style="font-size: 13px; color: #64748b; font-weight: 500; margin-bottom: 3px;">Best Regards,</div>
                    <div style="font-size: 17px; color: #0f172a; font-weight: 800; letter-spacing: -0.2px; margin-bottom: 6px;">Team MSC PRPCEM</div>
                    <div style="height: 3px; width: 44px; background-color: #2563eb; border-radius: 2px; margin-bottom: 10px;"></div>
                    <div style="font-size: 13px; font-weight: 700; color: #1e293b; line-height: 1.3;">Microsoft Student Club PRPCEM</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px; line-height: 1.4;">P. R. Pote (Patil) College of Engineering &amp; Management, Amravati</div>
                  </td>
                  <!-- Right: Be a Force for Good graphic -->
                  <td valign="bottom" align="right" style="text-align: right; vertical-align: bottom; width: 38%;">
                    <img src="{force_for_good_b64}" alt="Be a Force for Good." width="170" style="display: inline-block; max-width: 170px; width: 100%; height: auto; border: 0; outline: none;" />
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- 4. Deep Navy Footer Bar (#081630) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 16px 36px; background-color: #081630; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <!-- Clean Transparent Circular Social Media Icons on Left -->
                  <td align="left" valign="middle" style="line-height: 0;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right: 12px; line-height: 0;">
                          <a href="https://www.instagram.com/mscprpcem/" target="_blank" style="text-decoration: none; display: inline-block;" title="Instagram">
                            <img src="{icon_ig}" width="30" height="30" alt="Instagram" style="display: block; border: 0; outline: none;" />
                          </a>
                        </td>
                        <td style="padding-right: 12px; line-height: 0;">
                          <a href="https://www.linkedin.com/company/mscprpcem/" target="_blank" style="text-decoration: none; display: inline-block;" title="LinkedIn">
                            <img src="{icon_li}" width="30" height="30" alt="LinkedIn" style="display: block; border: 0; outline: none;" />
                          </a>
                        </td>
                        <td style="padding-right: 12px; line-height: 0;">
                          <a href="https://youtube.com/@mscprpcem" target="_blank" style="text-decoration: none; display: inline-block;" title="YouTube">
                            <img src="{icon_yt}" width="30" height="30" alt="YouTube" style="display: block; border: 0; outline: none;" />
                          </a>
                        </td>
                        <td style="padding-right: 16px; line-height: 0;">
                          <a href="https://www.mscprpcem.tech" target="_blank" style="text-decoration: none; display: inline-block;" title="Official Website">
                            <img src="{icon_web}" width="30" height="30" alt="Website" style="display: block; border: 0; outline: none;" />
                          </a>
                        </td>
                        <td style="border-left: 1px solid rgba(255, 255, 255, 0.2); height: 24px; width: 1px;"></td>
                      </tr>
                    </table>
                  </td>

                  <!-- Organization Details on Right -->
                  <td align="right" valign="middle" style="color: #94a3b8; font-size: 11px; line-height: 1.35; text-align: right;">
                    <a href="https://www.mscprpcem.tech" target="_blank" style="text-decoration: none; color: inherit;">
                      <div style="color: #ffffff; font-weight: 700; font-size: 11px;">Microsoft Student Club PRPCEM</div>
                      <div style="color: #94a3b8; font-size: 10px; margin-top: 1px;">P. R. Pote (Patil) College of Engineering &amp; Management</div>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════
         TAB 2: MOBILE VIEW (420px)
         Matches media_1790869646940.png exactly!
         ══════════════════════════════════════════════════════════════════ -->
    <div id="view-mobile" class="view-section">

      <!-- Sub-mode switcher -->
      <div class="mode-bar">
        <button class="mode-btn active" onclick="switchMobileMode('real', this)">
          ✨ Live Sample Content
        </button>
        <button class="mode-btn" onclick="switchMobileMode('placeholder', this)">
          📐 Wireframe (Dynamic Content Area)
        </button>
      </div>

      <div class="email-mobile-card">
        <!-- 1. Header Navigation Bar -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-bottom: 1px solid #f1f5f9;">
          <tr>
            <td style="padding: 18px 20px 14px 20px; vertical-align: middle;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <!-- Left: Logo + "MSC PRPCEM" vertically centered -->
                  <td align="left" valign="middle" style="vertical-align: middle;">
                    <a href="https://www.mscprpcem.tech" target="_blank" style="text-decoration: none; display: inline-block; vertical-align: middle;">
                      <table border="0" cellpadding="0" cellspacing="0" style="vertical-align: middle;">
                        <tr>
                          <td valign="middle" style="padding-right: 10px; line-height: 0; vertical-align: middle;">
                            <img src="{logo_b64}" alt="MSC PRPCEM Logo" width="38" height="38" style="display: block; width: 38px; height: 38px; border: 0; outline: none; vertical-align: middle;" />
                          </td>
                          <td valign="middle" style="line-height: 1; vertical-align: middle;">
                            <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -0.3px; vertical-align: middle; display: inline-block;">
                              MSC PRPCEM
                            </span>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>

                  <!-- Right: "Be a Force for Good." -->
                  <td align="right" valign="middle" style="vertical-align: middle;">
                    <a href="https://www.mscprpcem.tech" target="_blank" style="text-decoration: none; display: inline-block; vertical-align: middle;">
                      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 800; color: #0f172a; letter-spacing: -0.2px; line-height: 1.2;">
                        Be a <span style="color: #2563eb;">Force for Good</span>.
                      </div>
                      <div style="height: 2px; width: 54px; background: linear-gradient(90deg, #2563eb, #6366f1); margin: 2px 0 0 auto; border-radius: 2px;"></div>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- 2. Hero Banner (Mobile) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 0; line-height: 0; background-color: #ffffff;">
              <a href="https://www.mscprpcem.tech" target="_blank" style="display: block; text-decoration: none;">
                <img src="{hero_mobile_b64}" alt="Microsoft Student Club PRPCEM" width="420" style="display: block; width: 100%; max-width: 420px; height: auto; border: 0; outline: none;" />
              </a>
            </td>
          </tr>
        </table>

        <!-- 3. Dynamic Content Area -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 24px 22px 20px 22px; background-color: #ffffff; color: #334155; font-size: 14px; line-height: 1.6;">
              
              <p style="margin: 0 0 16px 0; font-size: 19px; font-weight: 700; color: #0f172a; line-height: 1.3;">
                Hi <span style="color: #2563eb; font-weight: 800;">Aditya Sharma</span>,
              </p>

              <!-- SUB-MODE A: REAL LIVE SAMPLE CONTENT (MOBILE) -->
              <div id="mobile-mode-real">
                <div style="margin-bottom: 10px;">
                  <span class="badge" style="background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; font-size: 10px;">
                    🚀 FLAGSHIP EVENT
                  </span>
                </div>

                <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                  National Tech Odyssey 2026: Campus Code &amp; Quiz Championship
                </h3>

                <p style="margin: 0 0 16px 0; font-size: 13.5px; color: #475569; line-height: 1.6;">
                  You are officially invited to the flagship competition hosted by MSC PRPCEM. Test your skills across Cloud, AI &amp; Web DevOps.
                </p>

                <!-- Highlight table mobile -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 14px 0;">
                  <tr>
                    <td style="padding: 14px 16px;">
                      <div style="margin-bottom: 8px;">
                        <span style="font-weight: 700; color: #0f172a;">📅 Date:</span> Saturday, Oct 10, 2026 (11:00 AM)
                      </div>
                      <div style="margin-bottom: 8px;">
                        <span style="font-weight: 700; color: #0f172a;">⏱️ Format:</span> 60 Mins • 40 MCQs + 2 Code
                      </div>
                      <div>
                        <span style="font-weight: 700; color: #16a34a;">🏆 Rewards:</span> ₹15,000 Cash Pool &amp; Verified Certificate
                      </div>
                    </td>
                  </tr>
                </table>

                <div style="text-align: center; margin: 20px 0 16px 0;">
                  <a href="https://quiz.mscprpcem.tech" target="_blank" class="cta-btn" style="display: block; padding: 12px 20px; font-size: 14px;">
                    🚀 Confirm Seat &amp; Enter Portal &rarr;
                  </a>
                  <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">
                    Pass ID: <span style="font-family: monospace; font-weight: 700; color: #475569;">MSC-2026-NTO-8492</span>
                  </div>
                </div>
              </div>

              <!-- SUB-MODE B: DYNAMIC PLACEHOLDER WIREFRAME (MOBILE) -->
              <div id="mobile-mode-placeholder" style="display: none;">
                <div class="dynamic-placeholder-box" style="padding: 30px 16px;">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: 0 auto 12px auto;">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 4px;">
                    Dynamic Content Area
                  </div>
                  <div style="font-size: 12px; color: #64748b; line-height: 1.4;">
                    (Event details, certificate, voucher, reminder, updates, etc. will appear here)
                  </div>
                </div>
              </div>

              <!-- Sign-off Section -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 28px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                <tr>
                  <td valign="bottom" align="left" style="text-align: left; vertical-align: bottom;">
                    <div style="font-size: 12px; color: #64748b; font-weight: 500;">Best Regards,</div>
                    <div style="font-size: 15px; color: #0f172a; font-weight: 800; margin-top: 2px;">Team MSC PRPCEM</div>
                    <div style="height: 3px; width: 36px; background-color: #2563eb; border-radius: 2px; margin: 6px 0 8px 0;"></div>
                    <div style="font-size: 12px; font-weight: 700; color: #1e293b;">Microsoft Student Club PRPCEM</div>
                    <div style="font-size: 10px; color: #64748b; margin-top: 2px;">P. R. Pote (Patil) College of Engineering &amp; Management</div>
                  </td>
                  <td valign="bottom" align="right" style="text-align: right; vertical-align: bottom; width: 130px;">
                    <img src="{force_for_good_b64}" alt="Be a Force for Good." width="125" style="display: inline-block; max-width: 125px; width: 100%; height: auto;" />
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- 4. Footer Bar -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 14px 18px; background-color: #081630; border-bottom-left-radius: 16px; border-bottom-right-radius: 16px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" valign="middle" style="line-height: 0;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right: 8px; line-height: 0;">
                          <a href="https://www.instagram.com/mscprpcem/" target="_blank">
                            <img src="{icon_ig}" width="26" height="26" alt="IG" style="display: block; border: 0;" />
                          </a>
                        </td>
                        <td style="padding-right: 8px; line-height: 0;">
                          <a href="https://www.linkedin.com/company/mscprpcem/" target="_blank">
                            <img src="{icon_li}" width="26" height="26" alt="LI" style="display: block; border: 0;" />
                          </a>
                        </td>
                        <td style="padding-right: 8px; line-height: 0;">
                          <a href="https://youtube.com/@mscprpcem" target="_blank">
                            <img src="{icon_yt}" width="26" height="26" alt="YT" style="display: block; border: 0;" />
                          </a>
                        </td>
                        <td style="padding-right: 10px; line-height: 0;">
                          <a href="https://www.mscprpcem.tech" target="_blank">
                            <img src="{icon_web}" width="26" height="26" alt="Web" style="display: block; border: 0;" />
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle" style="color: #94a3b8; font-size: 10px; text-align: right; line-height: 1.3;">
                    <div style="color: #ffffff; font-weight: 700; font-size: 10px;">MSC PRPCEM</div>
                    <div style="font-size: 9px; color: #94a3b8;">Amravati Chapter</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════
         TAB 3: LIVE SAMPLE SCENARIOS (OTP, QUIZ, TICKET, ANNOUNCEMENT)
         ══════════════════════════════════════════════════════════════════ -->
    <div id="view-scenarios" class="view-section">
      <div class="use-case-bar">
        <button class="use-case-btn active" onclick="switchCase('otp', this)">🔐 6-Digit OTP Verification</button>
        <button class="use-case-btn" onclick="switchCase('quiz', this)">⏱️ Scheduled Quiz Reminder</button>
        <button class="use-case-btn" onclick="switchCase('event', this)">🎟️ Event Registration Ticket</button>
        <button class="use-case-btn" onclick="switchCase('announcement', this)">📢 Admin Announcement &amp; CTA</button>
      </div>

      <div class="email-laptop-card">
        <!-- Header -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-bottom: 1px solid #f1f5f9;">
          <tr>
            <td style="padding: 22px 36px 18px 36px; vertical-align: middle;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" valign="middle" style="vertical-align: middle;">
                    <a href="https://www.mscprpcem.tech" target="_blank" style="text-decoration: none; display: inline-block; vertical-align: middle;">
                      <table border="0" cellpadding="0" cellspacing="0" style="vertical-align: middle;">
                        <tr>
                          <td valign="middle" style="padding-right: 12px; line-height: 0; vertical-align: middle;">
                            <img src="{logo_b64}" width="46" height="46" alt="Logo" style="display:block; vertical-align: middle;" />
                          </td>
                          <td valign="middle" style="line-height: 1; vertical-align: middle;">
                            <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 21px; font-weight: 900; color: #0f172a; vertical-align: middle; display: inline-block;">
                              MSC PRPCEM
                            </span>
                          </td>
                        </tr>
                      </table>
                    </a>
                  </td>
                  <td align="right" valign="middle" style="vertical-align: middle;">
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 17px; font-weight: 800; color: #0f172a; line-height: 1.2;">
                      Be a <span style="color: #2563eb;">Force for Good</span>.
                    </div>
                    <div style="height: 2.5px; width: 68px; background: linear-gradient(90deg, #2563eb, #6366f1); margin: 3px 0 0 auto; border-radius: 2px;"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Hero -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 0; line-height: 0;">
              <img src="{hero_desktop_b64}" width="740" style="width: 100%; display: block;" alt="Hero" />
            </td>
          </tr>
        </table>

        <!-- Dynamic Body -->
        <div style="padding: 36px 44px 28px 44px;">
          <p style="margin: 0 0 18px 0; font-size: 21px; font-weight: 700; color: #0f172a;">
            Hi <span style="color: #2563eb; font-weight: 800;">Aditya</span>,
          </p>

          <!-- CASE 1: OTP -->
          <div id="case-otp" class="case-content">
            <p style="font-size: 15px; color: #334155; margin: 0 0 18px 0; line-height: 1.65;">
              Use the 6-digit verification code below to authenticate your MSC PRPCEM account:
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
              <tr>
                <td align="center" style="background-color: #eff6ff; border: 2px dashed #2563eb; border-radius: 14px; padding: 26px 16px;">
                  <div style="font-family: monospace; font-size: 40px; font-weight: 900; letter-spacing: 8px; color: #1d4ed8; line-height: 1.1;">
                    849201
                  </div>
                  <div style="font-size: 12px; color: #64748b; margin-top: 10px; font-weight: 600;">
                    ⏱️ Valid for 15 minutes • Do not disclose this code to anyone
                  </div>
                </td>
              </tr>
            </table>
            <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
              If you didn't request this verification code, someone may have entered your email by mistake. You can safely disregard this message.
            </p>
          </div>

          <!-- CASE 2: Quiz -->
          <div id="case-quiz" class="case-content" style="display: none;">
            <p style="font-size: 15px; color: #334155; margin: 0 0 16px 0; line-height: 1.65;">
              Get ready! Your scheduled quiz challenge <strong>Cloud &amp; DevOps Mastery 2026</strong> is starting tomorrow.
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 18px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
              <tr>
                <td style="padding: 18px 22px;">
                  <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>📅 Scheduled Time:</strong> Tomorrow at 10:00 AM (IST)</p>
                  <p style="margin: 8px 0; color: #334155; font-size: 14px;"><strong>⏱️ Duration:</strong> 45 Minutes (30 Multiple Choice Questions)</p>
                  <p style="margin: 8px 0 4px 0; color: #334155; font-size: 14px;">
                    <strong>🔑 Join Code:</strong> <code style="background-color: #eff6ff; color: #1d4ed8; padding: 3px 8px; border-radius: 4px; font-weight: 800; font-size: 15px;">DEVOPS26</code>
                  </p>
                </td>
              </tr>
            </table>
            <div style="text-align: center; margin: 26px 0;">
              <a href="https://quiz.mscprpcem.tech" target="_blank" class="cta-btn">
                Start / Join Quiz Now &rarr;
              </a>
            </div>
          </div>

          <!-- CASE 3: Event Ticket -->
          <div id="case-event" class="case-content" style="display: none;">
            <p style="font-size: 15px; color: #334155; margin: 0 0 16px 0; line-height: 1.65;">
              Your seat reservation for <strong>VisionX National Hackathon &amp; Expo 2026</strong> has been officially confirmed!
            </p>
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 18px 0;">
              <tr>
                <td style="padding: 18px 22px; font-size: 13.5px; line-height: 1.6;">
                  <p style="margin: 4px 0;"><strong>Participant:</strong> Aditya Sharma</p>
                  <p style="margin: 4px 0;"><strong>College:</strong> P. R. Pote (Patil) College of Engineering &amp; Management</p>
                  <p style="margin: 4px 0;"><strong>Track:</strong> Generative AI &amp; Cloud Infrastructure</p>
                  <p style="margin: 4px 0;"><strong>Registration Ticket ID:</strong> <span style="font-family: monospace; color: #2563eb; font-weight: 800;">MSC-VX-2026-781</span></p>
                </td>
              </tr>
            </table>
            <div style="text-align: center; margin: 26px 0;">
              <a href="https://quiz.mscprpcem.tech" target="_blank" class="cta-btn">
                Access Participant Dashboard &rarr;
              </a>
            </div>
          </div>

          <!-- CASE 4: Announcement -->
          <div id="case-announcement" class="case-content" style="display: none;">
            <p style="font-size: 15px; color: #334155; line-height: 1.7; margin: 0 0 18px 0;">
              We are pleased to announce the launch of our new <strong>Microsoft Cloud Skills Challenge</strong>! Complete self-paced interactive modules, earn official badges, and get exclusive vouchers and networking access with industry professionals.
            </p>
            <div style="text-align: center; margin: 26px 0;">
              <a href="https://quiz.mscprpcem.tech" target="_blank" class="cta-btn">
                Explore Learning Tracks &rarr;
              </a>
            </div>
          </div>

          <!-- Sign-off -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 36px; border-top: 1px solid #f1f5f9; padding-top: 24px;">
            <tr>
              <td valign="bottom" align="left" style="text-align: left; vertical-align: bottom; width: 62%;">
                <div style="font-size: 13px; color: #64748b;">Best Regards,</div>
                <div style="font-size: 17px; color: #0f172a; font-weight: 800; margin-top: 2px;">Team MSC PRPCEM</div>
                <div style="height: 3px; width: 44px; background-color: #2563eb; border-radius: 2px; margin: 6px 0 10px 0;"></div>
                <div style="font-size: 13px; font-weight: 700; color: #1e293b;">Microsoft Student Club PRPCEM</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">P. R. Pote (Patil) College of Engineering &amp; Management, Amravati</div>
              </td>
              <td valign="bottom" align="right" style="text-align: right; vertical-align: bottom; width: 38%;">
                <img src="{force_for_good_b64}" width="170" alt="Be a Force for Good." style="display: inline-block; max-width: 170px; width: 100%; height: auto;" />
              </td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 16px 36px; background-color: #081630; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" valign="middle" style="line-height: 0;">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right: 12px; line-height: 0;">
                          <img src="{icon_ig}" width="30" height="30" alt="IG" style="display: block; border: 0;" />
                        </td>
                        <td style="padding-right: 12px; line-height: 0;">
                          <img src="{icon_li}" width="30" height="30" alt="LI" style="display: block; border: 0;" />
                        </td>
                        <td style="padding-right: 12px; line-height: 0;">
                          <img src="{icon_yt}" width="30" height="30" alt="YT" style="display: block; border: 0;" />
                        </td>
                        <td style="padding-right: 16px; line-height: 0;">
                          <img src="{icon_web}" width="30" height="30" alt="Web" style="display: block; border: 0;" />
                        </td>
                        <td style="border-left: 1px solid rgba(255, 255, 255, 0.2); height: 24px; width: 1px;"></td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle" style="color: #94a3b8; font-size: 11px; text-align: right;">
                    <div style="color: #ffffff; font-weight: 700; font-size: 11px;">Microsoft Student Club PRPCEM</div>
                    <div style="color: #94a3b8; font-size: 10px; margin-top: 1px;">P. R. Pote (Patil) College of Engineering &amp; Management</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>

  </div>

  <script>
    function switchDevice(view, btn) {{
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
      document.getElementById('view-' + view).classList.add('active');
    }}

    function switchLaptopMode(mode, btn) {{
      const bar = btn.parentElement;
      bar.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (mode === 'real') {{
        document.getElementById('laptop-mode-real').style.display = 'block';
        document.getElementById('laptop-mode-placeholder').style.display = 'none';
      }} else {{
        document.getElementById('laptop-mode-real').style.display = 'none';
        document.getElementById('laptop-mode-placeholder').style.display = 'block';
      }}
    }}

    function switchMobileMode(mode, btn) {{
      const bar = btn.parentElement;
      bar.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (mode === 'real') {{
        document.getElementById('mobile-mode-real').style.display = 'block';
        document.getElementById('mobile-mode-placeholder').style.display = 'none';
      }} else {{
        document.getElementById('mobile-mode-real').style.display = 'none';
        document.getElementById('mobile-mode-placeholder').style.display = 'block';
      }}
    }}

    function switchCase(cName, btn) {{
      document.querySelectorAll('.use-case-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.case-content').forEach(el => el.style.display = 'none');
      document.getElementById('case-' + cName).style.display = 'block';
    }}
  </script>

</body>
</html>'''

out_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../email_template_preview.html'))
with open(out_path, 'w', encoding='utf-8') as out:
    out.write(html_content)

print(f'Generated: {out_path}')
