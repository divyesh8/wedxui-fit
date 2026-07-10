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
              <span className="text-white">WED</span>
              <span className="text-wed-purple">XUI</span>
              <span className="text-white font-light"> Fit</span>
            </span>
            <p className="text-sm text-wed-gray-400 mt-3 max-w-xs">
              Become the strongest version of yourself. Train like the main character of your story.
            </p>
            <div className="flex gap-3 mt-4">
              {[Twitter, Instagram, Youtube, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-wed-gray-400 hover:text-white hover:border-wed-purple/30 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Navigate</h4>
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
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Resources</h4>
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
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wide">Legal</h4>
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
            © {new Date().getFullYear()} WEDXUI Fit. All rights reserved. Built for warriors.
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
