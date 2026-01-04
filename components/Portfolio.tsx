
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaseStudy } from '../types';

const CASES: CaseStudy[] = [
  // Vertical Videos
  { id: 'v1', title: 'THE TECH HOOK', category: 'Tech Review', duration: '0:15', gradientClass: 'card-gradient-1', label: 'Viral Match', type: 'vertical' },
  { id: 'v2', title: 'NEON LIFESTYLE', category: 'Commercial', duration: '0:20', gradientClass: 'card-gradient-2', label: 'Viral Match', type: 'vertical' },
  { id: 'v3', title: 'AI TRANSFORMATION', category: 'Educational', duration: '0:30', gradientClass: 'card-gradient-3', label: 'High Retention', type: 'vertical' },
  { id: 'v4', title: 'EXTREME RETENTION', category: 'Entertainment', duration: '0:12', gradientClass: 'card-gradient-1', label: 'Viral Match', type: 'vertical' },
  { id: 'v5', title: 'CYBERPUNK EDIT', category: 'Creative', duration: '0:18', gradientClass: 'card-gradient-2', label: 'New Style', type: 'vertical' },
  // Horizontal Videos
  { id: 'h1', title: 'FUTURE CITY', category: 'Cinematic', duration: '1:45', gradientClass: 'card-gradient-3', label: 'Masterpiece', type: 'horizontal' },
  { id: 'h2', title: 'BRAND STORY', category: 'Corporate', duration: '2:30', gradientClass: 'card-gradient-1', label: 'High Quality', type: 'horizontal' },
  { id: 'h3', title: 'PRODUCT LAUNCH', category: 'Marketing', duration: '1:15', gradientClass: 'card-gradient-2', label: 'Top Tier', type: 'horizontal' },
];

export const Portfolio = () => {
  const [activeTab, setActiveTab] = useState<'vertical' | 'horizontal'>('vertical');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredCases = CASES.filter(item => item.type === activeTab);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section id="work" className="py-32 bg-black overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <p className="text-blue-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">Portfolio</p>
          <h2 className="text-5xl md:text-7xl font-[900] italic tracking-tighter uppercase mb-12">
            CRAFTING <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">VIRAL</span> REALITY.
          </h2>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-12">
            {(['vertical', 'horizontal'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all border ${
                  activeTab === tab 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-transparent border-white/10 text-white/50 hover:border-white/30'
                }`}
              >
                {tab === 'vertical' ? 'Vertical' : 'Horizontal'}
              </button>
            ))}
          </div>
        </div>

        <div className="relative group">
          {/* Arrows */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={() => scroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-12 pt-12 px-4 -mt-12"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <AnimatePresence mode="wait">
              {filteredCases.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -10 }}
                  className={`relative flex-shrink-0 snap-center rounded-[2rem] overflow-hidden group cursor-pointer border border-white/5 ${
                    item.type === 'vertical' ? 'w-[280px] aspect-[9/16]' : 'w-[400px] md:w-[600px] aspect-[16/9]'
                  } ${item.gradientClass}`}
                >
                  {/* Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10" />
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-0" />
                  
                  {/* Media Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                       <svg className="w-6 h-6 ml-1 text-white" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M8 5v14l11-7z" />
                       </svg>
                     </div>
                  </div>

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-8 z-20 space-y-3">
                    <div className="flex flex-col gap-1">
                       <span className="text-blue-400 text-[9px] font-bold tracking-widest uppercase">{item.category}</span>
                       <h4 className="text-2xl font-[900] italic tracking-tight">{item.title}</h4>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4">
                       <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold">
                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         {item.duration}
                       </div>
                       <div className="px-2 py-1 rounded bg-white/10 backdrop-blur-md text-[9px] font-bold text-white/80 border border-white/10">
                         {item.label}
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
