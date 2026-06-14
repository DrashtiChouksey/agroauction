import React from 'react';
import { motion } from 'framer-motion';
import { Globe, ArrowRight } from 'lucide-react';
import { TiltCard } from '../../components/TiltCard';

interface LanguageSelectionProps {
  onSelect: (lang: string) => void;
}

const languages = [
  { code: 'en', label: 'English', native: 'English', icon: '🇬🇧' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', icon: '🇮🇳' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', icon: '🚩' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', icon: '🌾' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', icon: '🏺' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', icon: '🏛️' },
];

export const LanguageSelection = ({ onSelect }: LanguageSelectionProps) => {
  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl text-center space-y-12"
      >
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl animate-bounce">
              <Globe className="text-white" size={40} />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            Choose Your Language
          </h1>
          <p className="text-xl text-white/60 font-medium">अपनी भाषा चुनें • आपली भाषा निवडा • ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {languages.map((lang, index) => (
            <motion.div
              key={lang.code}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(lang.code)}
              className="cursor-pointer group"
            >
              <TiltCard>
                <div className="glass-dark p-8 rounded-[2.5rem] border border-white/10 hover:border-[#C65D3B] transition-all flex flex-col items-center gap-4 group-hover:glow-terracotta">
                  <span className="text-5xl mb-2">{lang.icon}</span>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-1">{lang.native}</h3>
                    <p className="text-sm text-white/40 font-bold uppercase tracking-widest">{lang.label}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#C65D3B] transition-all">
                    <ArrowRight className="text-white" size={20} />
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        <div className="pt-12 text-white/30 text-sm font-bold uppercase tracking-[0.3em]">
          Secure Agriculture Marketplace // 2026
        </div>
      </motion.div>
    </div>
  );
};
