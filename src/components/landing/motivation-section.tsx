'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Quote } from 'lucide-react';
import { getRandomQuote, type AnimeQuote } from '@/data/quotes';

export function MotivationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [displayedText, setDisplayedText] = useState('');
  // Picked in an effect so the random choice never mismatches the server render.
  const [quote, setQuote] = useState<AnimeQuote | null>(null);

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

  useEffect(() => {
    if (!isInView || !quote) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < quote.text.length) {
        setDisplayedText(quote.text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 35);
    return () => clearInterval(interval);
  }, [isInView, quote]);

  return (
    <section id="motivation" className="section-padding relative" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-wed-pink/10 text-wed-pink mb-4">
            Anime Spirit
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">MOTIVATION</h2>
          <p className="text-wed-gray-400 text-sm">A new legend speaks every time you return.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="glass p-8 md:p-12 rounded-3xl text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-wed-purple/10 rounded-br-full" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-wed-blue/10 rounded-tl-full" />

          <Quote className="w-10 h-10 text-wed-purple mx-auto mb-6" />

          <blockquote className="text-2xl md:text-3xl font-bold text-white mb-4 leading-relaxed min-h-[4rem]">
            &quot;{displayedText}&quot;
            <span className="animate-pulse text-wed-purple">|</span>
          </blockquote>

          <cite className="text-wed-gray-400 not-italic">— {quote?.author ?? ''}</cite>
        </motion.div>
      </div>
    </section>
  );
}
