'use client';

import { motion } from 'framer-motion';
import { Github, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <span className="text-2xl font-black tracking-tight">
              <span className="text-white">WEDXUI</span>
              <span className="text-wed-purple"> FIT</span>
            </span>
            <p className="text-sm text-wed-gray-400 mt-3 max-w-xs">
              AI-powered training and nutrition that explains every decision it makes. Built for people who want to know why.
            </p>
            <div className="flex gap-3 mt-4">
              {/* aria-label gives each icon-only link a discernible name for
                  screen readers (Lighthouse "link-name"). Swap href="#" for the
                  real profile URLs once those accounts exist. */}
              {([
                [Twitter, 'Twitter'],
                [Instagram, 'Instagram'],
                [Youtube, 'YouTube'],
                [Github, 'GitHub'],
              ] as const).map(([Icon, label]) => (
                <a
                  key={label}
                  href="#"
                  aria-label={`WEDXUI FIT on ${label}`}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-wed-gray-400 hover:text-white hover:border-wed-purple/30 transition-all"
                >
                  <Icon className="w-4 h-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Navigate</h3>
            <ul className="space-y-2">
              {['Workouts', 'Exercises', 'Challenges', 'Tools', 'Progress'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-sm text-wed-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Resources</h3>
            <ul className="space-y-2">
              {['Blog', 'Guides', 'Nutrition', 'Recovery', 'Mobility'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-wed-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Legal</h3>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Disclaimer', 'Cookie Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-wed-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-wed-gray-500">
            © {new Date().getFullYear()} WEDXUI FIT. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-wed-lime animate-pulse" />
            <span className="text-xs text-wed-gray-500">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
