import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, ExternalLink } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const location = useLocation();

  // Show footer only on the Home page (exact path "/")
  if (location.pathname !== '/') {
    return null;
  }

  return (
    <footer className="app-footer">
      {/* Top accent gradient line */}
      <div className="footer-top-accent"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 text-left">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-6 md:gap-6 pb-8 sm:pb-10 border-b border-zinc-100">
          
          {/* Column 1: Brand (Col span 12 on mobile, 4 on desktop) */}
          <div className="col-span-2 md:col-span-4 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2.5">
              {/* Microsoft Colors Custom Grid Logo */}
              <div className="grid grid-cols-2 gap-[2px] w-4.5 h-4.5 flex-shrink-0">
                <div className="bg-[#F25022] rounded-[0.5px]"></div>
                <div className="bg-[#7FBA00] rounded-[0.5px]"></div>
                <div className="bg-[#00A4EF] rounded-[0.5px]"></div>
                <div className="bg-[#FFB900] rounded-[0.5px]"></div>
              </div>
              <div className="text-left">
                <span className="font-black text-xs sm:text-sm tracking-wide text-brand-textMain uppercase block leading-none">Microsoft Student Club PRPCEM</span>
                <span className="font-extrabold text-[9px] text-brand-blue tracking-widest uppercase block mt-1">Quiz Platform</span>
              </div>
            </div>
          </div>

          {/* Column 2: Club Ecosystem (Col span 1 on mobile, 2 on desktop) */}
          <div className="col-span-1 md:col-span-2 space-y-3 sm:space-y-4">
            <span className="footer-section-title">Club Ecosystem</span>
            <ul className="space-y-2">
              <li>
                <a href="https://www.mscprpcem.tech" target="_blank" rel="noopener noreferrer" className="footer-link flex items-center gap-1">
                  <span>Main Website</span>
                  <ExternalLink size={10} className="text-zinc-400" />
                </a>
              </li>
              <li>
                <Link to="/" className="footer-link">Quiz Platform</Link>
              </li>
              <li>
                <Link to="/courses" className="footer-link">Courses</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources (Col span 1 on mobile, 2 on desktop) */}
          <div className="col-span-1 md:col-span-2 space-y-3 sm:space-y-4">
            <span className="footer-section-title">Resources</span>
            <ul className="space-y-2">
              <li>
                <Link to="/rules" className="footer-link">Quiz Rules</Link>
              </li>
              <li>
                <Link to="/faq" className="footer-link">FAQ</Link>
              </li>
              <li>
                <Link to="/guide" className="footer-link">User Guide</Link>
              </li>
              <li>
                <Link to="/sla" className="footer-link">Support</Link>
              </li>
              <li>
                <Link to="/report-issue" className="footer-link">Report Issue</Link>
              </li>
              <li>
                <Link to="/docs" className="footer-link">Documentation</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal (Col span 1 on mobile, 2 on desktop) */}
          <div className="col-span-1 md:col-span-2 space-y-3 sm:space-y-4">
            <span className="footer-section-title">Legal</span>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="footer-link">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="footer-link">Terms</Link>
              </li>
              <li>
                <Link to="/cookies" className="footer-link">Cookie Policy</Link>
              </li>
              <li>
                <Link to="/code-of-conduct" className="footer-link">Code of Conduct</Link>
              </li>
              <li>
                <Link to="/disclaimer" className="footer-link">Disclaimer</Link>
              </li>
              <li>
                <Link to="/accessibility" className="footer-link">Accessibility</Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Connect (Col span 1 on mobile, 2 on desktop) */}
          <div className="col-span-1 md:col-span-2 space-y-3 sm:space-y-4">
            <span className="footer-section-title">Connect</span>
            <ul className="space-y-2">
              <li>
                <a href="https://linktr.ee/mscprpcem" target="_blank" rel="noopener noreferrer" className="footer-link flex items-center gap-1">
                  <span>Linktree</span>
                  <ExternalLink size={10} className="text-zinc-400" />
                </a>
              </li>
              <li>
                <a href="https://github.com/mscprpcem" target="_blank" rel="noopener noreferrer" className="footer-link flex items-center gap-1">
                  <span>GitHub</span>
                  <ExternalLink size={10} className="text-zinc-400" />
                </a>
              </li>
              <li>
                <a href="https://linkedin.com/company/mscprpcem" target="_blank" rel="noopener noreferrer" className="footer-link flex items-center gap-1">
                  <span>LinkedIn</span>
                  <ExternalLink size={10} className="text-zinc-400" />
                </a>
              </li>
              <li>
                <a href="https://instagram.com/mscprpcem" target="_blank" rel="noopener noreferrer" className="footer-link flex items-center gap-1">
                  <span>Instagram</span>
                  <ExternalLink size={10} className="text-zinc-400" />
                </a>
              </li>
              <li>
                <a href="https://youtube.com/@mscprpcem" target="_blank" rel="noopener noreferrer" className="footer-link flex items-center gap-1">
                  <span>YouTube</span>
                  <ExternalLink size={10} className="text-zinc-400" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar section */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Mail size={12} className="text-zinc-400" />
                <span>Technical Support:</span>
              </div>
              <a href="mailto:mlsc@prpotepatilengg.ac.in" className="text-zinc-500 hover:text-brand-blue normal-case font-bold transition-colors break-all pl-4 sm:pl-0">
                mlsc@prpotepatilengg.ac.in
              </a>
            </div>
            <span className="hidden md:inline text-zinc-200">|</span>
            <div className="flex items-center gap-x-3">
              <span>Version 1.8.2</span>
              <span className="text-zinc-200">|</span>
              <span className="text-zinc-500 font-bold">
                Powered by Azure &amp; <a href="https://neon.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 text-zinc-600 transition-colors">Neon Postgres</a>
              </span>
            </div>
          </div>
          <p className="text-zinc-400">© {new Date().getFullYear()} MSCPRPCEM. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
