'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, CheckCircle, Database, Sprout, Menu, Globe } from 'lucide-react';
import Link from 'next/link';

// --- Text Content (Bilingual) ---
const content = {
  en: {
    heroTitle: "Stop Food Loss. Save the Future.",
    heroSub: "Empowering Bangladeshi farmers with tech-based storage solutions.",
    cta: "Join HarvestGuard",
    statTitle: "The Crisis in Numbers",
    stat1: "4.5 Million Metric Tonnes",
    stat1Desc: "Food grains lost every year in Bangladesh.",
    stat2: "$1.5 Billion USD",
    stat2Desc: "Annual economic loss due to inadequate storage.",
    stat3: "12–32% Loss",
    stat3Desc: "Of staple foods like rice, vegetables, and dairy.",
    solutionTitle: "How HarvestGuard Works",
    step1: "Data",
    step2: "Warning",
    step3: "Action",
    step4: "Saved",
    footer: "Developed for HackFest 2025 | SDG 12.3",
    login: "Login"
  },
  bn: {
    heroTitle: "খাদ্য অপচয় রোধ করুন। ভবিষ্যৎ বাঁচান।",
    heroSub: "বাংলাদেশের কৃষকদের জন্য প্রযুক্তিগত সংরক্ষণ সমাধান।",
    cta: "হার্ভেস্টগার্ডে যোগ দিন",
    statTitle: "সংকটের পরিসংখ্যান",
    stat1: "৪.৫ মিলিয়ন মেট্রিক টন",
    stat1Desc: "বাংলাদেশে প্রতি বছর খাদ্যশস্য নষ্ট হয়।",
    stat2: "১.৫ বিলিয়ন মার্কিন ডলার",
    stat2Desc: "অপর্যাপ্ত সংরক্ষণের কারণে বার্ষিক অর্থনৈতিক ক্ষতি।",
    stat3: "১২–৩২% ক্ষতি",
    stat3Desc: "চাল, সবজি এবং দুগ্ধজাত পণ্যের মতো প্রধান খাদ্যের।",
    solutionTitle: "হার্ভেস্টগার্ড কীভাবে কাজ করে",
    step1: "তথ্য",
    step2: "সতর্কতা",
    step3: "ব্যবস্থা",
    step4: "সংরক্ষিত",
    footer: "হ্যাকফেস্ট ২০২৫ এর জন্য তৈরি | SDG ১২.৩",
    login: "লগ ইন"
  }
};

export default function LandingPage() {
  const [lang, setLang] = useState('bn'); // Default to Bangla as per requirements
  const t = content[lang];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* --- Navbar --- */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-green-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-2 rounded-lg">
               <Sprout className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-green-800 tracking-tight">HarvestGuard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1 text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 hover:bg-green-100 transition"
            >
              <Globe className="w-4 h-4" />
              {lang === 'en' ? 'বাংলা' : 'English'}
            </button>
            <Link href="/dashboard" className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-green-600">
              {t.login}
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="pt-32 pb-16 px-4 text-center max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider mb-4 border border-orange-200">
            {lang === 'en' ? 'Problem: Food Security' : 'সমস্যা: খাদ্য নিরাপত্তা'}
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            {t.heroTitle}
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t.heroSub}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <button className="h-14 px-8 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-lg shadow-lg shadow-green-600/30 transition transform active:scale-95 flex items-center gap-2">
                {t.cta}
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </motion.div>
      </header>

      {/* --- Problem Statement (Stats) --- */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12 text-slate-800 border-b-4 border-green-500 inline-block pb-2 mx-auto">
            {t.statTitle}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Stat 1 */}
            <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-center">
              <div className="text-4xl font-black text-red-600 mb-2">4.5M</div>
              <div className="text-sm font-bold text-red-800 uppercase tracking-wide">Metric Tonnes</div>
              <p className="mt-3 text-slate-600">{t.stat1Desc}</p>
            </div>

            {/* Stat 2 */}
            <div className="p-6 rounded-2xl bg-orange-50 border border-orange-100 text-center">
              <div className="text-4xl font-black text-orange-600 mb-2">$1.5B</div>
              <div className="text-sm font-bold text-orange-800 uppercase tracking-wide">USD Loss</div>
              <p className="mt-3 text-slate-600">{t.stat2Desc}</p>
            </div>

            {/* Stat 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-4xl font-black text-slate-700 mb-2">32%</div>
              <div className="text-sm font-bold text-slate-800 uppercase tracking-wide">Staple Food Lost</div>
              <p className="mt-3 text-slate-600">{t.stat3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Visual Solution Metaphor (Animation) --- */}
      <section className="py-20 bg-green-900 text-white overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-16">{t.solutionTitle}</h2>
          
          {/* Animated Flow Diagram */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-4 relative">
            
            {/* Step 1: Data */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center z-10"
            >
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/50 mb-4">
                <Database className="w-10 h-10 text-white" />
              </div>
              <span className="font-bold text-lg">{t.step1}</span>
            </motion.div>

            {/* Arrow */}
            <div className="w-1 h-12 md:w-12 md:h-1 bg-green-700/50 rounded-full"></div>

            {/* Step 2: Warning */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center z-10"
            >
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-orange-500/50 mb-4 animate-pulse">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <span className="font-bold text-lg">{t.step2}</span>
            </motion.div>

            {/* Arrow */}
            <div className="w-1 h-12 md:w-12 md:h-1 bg-green-700/50 rounded-full"></div>

            {/* Step 3: Action */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.0 }}
              className="flex flex-col items-center z-10"
            >
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/50 mb-4">
                <Sprout className="w-10 h-10 text-white" />
              </div>
              <span className="font-bold text-lg">{t.step3}</span>
            </motion.div>

            {/* Arrow */}
            <div className="w-1 h-12 md:w-12 md:h-1 bg-green-700/50 rounded-full"></div>

            {/* Step 4: Saved */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.4 }}
              className="flex flex-col items-center z-10"
            >
              <div className="w-24 h-24 bg-green-400 rounded-full flex items-center justify-center shadow-2xl shadow-green-400/50 mb-4 ring-4 ring-green-300 ring-opacity-50">
                <CheckCircle className="w-12 h-12 text-green-900" />
              </div>
              <span className="font-bold text-xl text-green-300">{t.step4}</span>
            </motion.div>

          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
           <img src="https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=2072&auto=format&fit=crop" className="object-cover w-full h-full grayscale" alt="Paddy Field" />
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>{t.footer}</p>
        <p className="mt-2 text-xs opacity-50">Source: The Financial Express (2025), BIDS</p>
      </footer>
    </div>
  );
}
