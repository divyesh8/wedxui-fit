'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Bot, Dumbbell, Flame, Zap, Apple, Moon } from 'lucide-react';

const coachMessages = [
  { text: 'I\'m your WEDXUI coach. Tell me your goal and equipment — I\'ll build the plan and explain every choice.', icon: Zap },
  { text: 'Push past your limits. That\'s where growth lives.', icon: Flame },
  { text: 'Your only competition is who you were yesterday.', icon: Dumbbell },
  { text: 'Rest is part of the program. Recovery makes you stronger.', icon: Moon },
  { text: 'Fuel your body right. Nutrition is half the battle.', icon: Apple },
];

const tips = [
  { label: 'Suggest Workout', icon: Dumbbell },
  { label: 'Motivate Me', icon: Flame },
  { label: 'Nutrition Tip', icon: Apple },
  { label: 'Recovery Advice', icon: Moon },
];

export function AICoachSection() {
  const [activeTip, setActiveTip] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;
    const message = coachMessages[activeTip].text;
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < message.length) {
        setDisplayedText(message.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [activeTip, isInView]);

  return (
    <section id="ai-coach" className="section-padding relative" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-wed-blue/10 text-wed-blue mb-4">
            Your Companion
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">AI COACH</h2>
          <p className="text-wed-gray-300 max-w-xl mx-auto">
            An AI coach that reads your goal, equipment, and recovery — then recommends, adapts, and explains. Every suggestion is grounded in exercise science.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative w-64 h-64">
              {/* Hologram rings */}
              <div className="absolute inset-0 rounded-full border-2 border-wed-purple/30 animate-ping" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-4 rounded-full border border-wed-blue/20 animate-ping" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
              <div className="absolute inset-8 rounded-full border border-wed-lime/10 animate-ping" style={{ animationDuration: '5s', animationDelay: '1s' }} />

              {/* Core avatar */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-wed-purple/30 to-wed-blue/20 backdrop-blur-xl border border-wed-purple/30 flex items-center justify-center">
                  <Bot className="w-20 h-20 text-wed-purple" />
                </div>
              </div>

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-wed-purple"
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 2 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                  style={{
                    left: `${20 + i * 12}%`,
                    top: `${30 + (i % 3) * 15}%`,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Chat panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="glass p-6 rounded-2xl mb-6 glow-purple">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-wed-purple/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-wed-purple" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-lg leading-relaxed min-h-[3rem]">
                    {displayedText}
                    {isTyping && <span className="animate-pulse text-wed-purple">|</span>}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {tips.map((tip, i) => (
                <button
                  key={tip.label}
                  onClick={() => setActiveTip(i)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                    activeTip === i
                      ? 'border-wed-purple/50 bg-wed-purple/10 text-white'
                      : 'border-white/10 bg-white/5 text-wed-gray-300 hover:border-white/20 hover:bg-white/[0.07]'
                  }`}
                >
                  <tip.icon className={`w-5 h-5 ${activeTip === i ? 'text-wed-purple' : 'text-wed-gray-400'}`} />
                  <span className="text-sm font-medium">{tip.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
