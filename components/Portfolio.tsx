
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaseStudy } from '../types';
import { supabase, supabaseAvailable } from '../services/supabase';
import { getVideoBlob, getAllMetadata } from '../services/videoPersistence';

const VideoPlayer = ({ item, onClose }: { item: CaseStudy, onClose: () => void }) => {
  const [videoSrc, setVideoSrc] = useState<string>('');

  useEffect(() => {
    let url = '';
    const loadVideo = async () => {
      if (item.videoUrl === 'local' || item.videoUrl === 'local_storage_only') {
        const blob = await getVideoBlob(item.id);
        if (blob) {
          url = URL.createObjectURL(blob);
          setVideoSrc(url);
        }
      } else {
        setVideoSrc(item.videoUrl);
      }
    };
    loadVideo();
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [item.videoUrl, item.id]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 md:p-10"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        {videoSrc && (
          <video 
            src={videoSrc} 
            className="w-full h-full object-contain"
            controls
            autoPlay
            playsInline
          />
        )}
      </motion.div>
    </motion.div>
  );
};

const VideoCard = React.memo(({ 
  item, 
  onClick, 
  isDimmed, 
  isHovered, 
  onHoverStart, 
  onHoverEnd
}: { 
  item: CaseStudy, 
  onClick: () => void,
  isDimmed: boolean,
  isHovered: boolean,
  onHoverStart: () => void,
  onHoverEnd: () => void
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let url = '';
    let isMounted = true;
    const loadVideo = async () => {
      if (item.videoUrl === 'local' || item.videoUrl === 'local_storage_only') {
        const blob = await getVideoBlob(item.id);
        if (blob && isMounted) {
          url = URL.createObjectURL(blob);
          setVideoSrc(url);
        }
      } else if (isMounted) {
        setVideoSrc(item.videoUrl);
      }
    };
    loadVideo();
    return () => {
      isMounted = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [item.videoUrl, item.id]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoSrc]);

  return (
    <div
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
      draggable="false"
      className={`relative flex-shrink-0 rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl transition-all duration-500 ${
        isDimmed ? 'opacity-30 grayscale blur-[2px] scale-95' : 'opacity-100 grayscale-0 blur-0 scale-100'
      } ${
        isHovered ? 'scale-105 z-30' : 'z-20'
      } ${
        item.type === 'vertical' ? 'w-[300px] aspect-[9/16]' : 'w-[500px] md:w-[700px] aspect-[16/9]'
      } ${item.gradientClass}`}
      style={{
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        willChange: 'transform, opacity, filter',
      }}
    >
      {/* Video Preview */}
      <div className="absolute inset-0 overflow-hidden bg-[#050505] pointer-events-none">
        {videoSrc && (
          <video 
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            autoPlay
            playsInline
            preload="auto"
            className={`block w-full h-full object-cover transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoadedData={() => setIsLoaded(true)}
          />
        )}
        
        {/* Glow Effect on Hover */}
        <div className={`absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10`} />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 z-10 pointer-events-none" />
      
      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-10 z-20 space-y-4 pointer-events-none">
        <div className="flex flex-col gap-2">
           <span className="text-blue-400 text-[10px] font-bold tracking-[0.4em] uppercase opacity-70">{item.category}</span>
           <h4 className="text-3xl font-[900] italic tracking-tighter leading-none uppercase">{item.title}</h4>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 text-white/40 text-[10px] font-bold uppercase tracking-widest">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {item.duration}
          </div>
          <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-bold uppercase tracking-widest text-white/60 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all duration-500">
            View Case
          </div>
        </div>
      </div>
    </div>
  );
});

export const Portfolio = () => {
  const [activeTab, setActiveTab] = useState<'vertical' | 'horizontal'>('vertical');
  const [selectedVideo, setSelectedVideo] = useState<CaseStudy | null>(null);
  const [videos, setVideos] = useState<CaseStudy[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDraggingScrollbar, setIsDraggingScrollbar] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);

  const updateScrollProgress = (progress: number) => {
    if (scrollThumbRef.current) {
      // Используем requestAnimationFrame для синхронизации с частотой развертки
      requestAnimationFrame(() => {
        if (scrollThumbRef.current) {
          scrollThumbRef.current.style.transform = `translateX(${progress * 233}%) translateZ(0)`;
        }
      });
    }
  };

  const handleScrollbarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingScrollbar(true);
  };

  const handleScrollbarMove = (e: MouseEvent | React.MouseEvent) => {
    if (!scrollbarRef.current || !scrollContainerRef.current) return;
    
    const rect = scrollbarRef.current.getBoundingClientRect();
    const x = 'clientX' in e ? (e as MouseEvent).clientX : (e as React.MouseEvent).clientX;
    const pos = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
    
    const scrollEl = scrollContainerRef.current;
    const maxScroll = scrollEl.scrollWidth - scrollEl.clientWidth;
    
    // Прямая установка скролла без задержек
    scrollEl.scrollLeft = pos * maxScroll;
    updateScrollProgress(pos);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDraggingScrollbar(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingScrollbar) {
        handleScrollbarMove(e);
      }
    };

    if (isDraggingScrollbar) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', handleMouseUp, { once: true });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingScrollbar]);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        if (supabaseAvailable) {
          const { data, error } = await supabase
            .from('videos')
            .select('*')
            .order('order', { ascending: true });
          
          if (error) throw error;
          if (data && data.length > 0) {
            setVideos(data as CaseStudy[]);
            return;
          }
        }
        const localVideos = await getAllMetadata();
        setVideos(localVideos.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } catch (err) {
        console.error("Error loading videos in Portfolio:", err);
        const localVideos = await getAllMetadata();
        setVideos(localVideos.sort((a, b) => (a.order || 0) - (b.order || 0)));
      }
    };

    loadVideos();

    let subscription: any = null;
    if (supabaseAvailable) {
      subscription = supabase
        .channel('portfolio_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => {
          loadVideos();
        })
        .subscribe();
    }

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  const filteredCases = videos.filter(item => item.type === activeTab);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el || isDraggingScrollbar) return;
    
    // Используем requestAnimationFrame для оптимизации
    requestAnimationFrame(() => {
      const el = scrollContainerRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll > 0) {
        updateScrollProgress(el.scrollLeft / maxScroll);
      }
    });
  };

  // Плавный скролл при клике на табы
  const scrollToStart = () => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  return (
    <section id="work" className="py-32 bg-black overflow-hidden select-none" draggable="false">
      <div className="container mx-auto px-4" draggable="false">
        <div className="mb-16 text-center" draggable="false">
          <p className="text-blue-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">Portfolio</p>
          <h2 className="text-5xl md:text-7xl font-[900] italic tracking-tighter uppercase mb-12">
            CRAFTING <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">VIRAL</span> REALITY.
          </h2>

          <div className="flex justify-center gap-4 mb-12">
            {(['vertical', 'horizontal'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  scrollToStart();
                }}
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

        <div className="relative group/carousel" draggable="false">
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            draggable="false"
            className="flex gap-12 overflow-x-auto scrollbar-hide pb-20 pt-20 px-4 -mt-20 cursor-grab active:cursor-grabbing will-change-scroll"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'auto',
              transform: 'translateZ(0)',
              willChange: 'scroll-position',
            }}
          >
            <AnimatePresence initial={false}>
              {filteredCases.length > 0 ? (
                filteredCases.map((item, idx) => {
                  const uniqueKey = `portfolio-${item.id}-${idx}`;
                  return (
                    <motion.div
                      key={uniqueKey}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4 }}
                    >
                      <VideoCard 
                        item={item} 
                        isDimmed={hoveredId !== null && hoveredId !== uniqueKey}
                        isHovered={hoveredId === uniqueKey}
                        onHoverStart={() => setHoveredId(uniqueKey)}
                        onHoverEnd={() => setHoveredId(null)}
                        onClick={() => setSelectedVideo(item)} 
                      />
                    </motion.div>
                  );
                })
              ) : (
                <div className="w-full flex items-center justify-center py-20 opacity-20">
                   <p className="text-sm font-bold tracking-[0.5em] uppercase">No cases found in this category</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Custom Scroll Progress Bar */}
          {filteredCases.length > 1 && (
            <div className="max-w-xs mx-auto mt-12 px-4 text-center" draggable="false">
              <div 
                ref={scrollbarRef}
                onMouseDown={handleScrollbarMouseDown}
                className="h-[6px] w-full bg-white/5 rounded-full relative mb-4 cursor-pointer touch-none overflow-hidden"
                draggable="false"
              >
                <div 
                  ref={scrollThumbRef}
                  className="absolute top-0 left-0 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] rounded-full will-change-transform"
                  style={{ 
                    width: '30%',
                    transform: 'translateX(0%) translateZ(0)',
                  }}
                  draggable="false"
                />
              </div>
              <div className="flex justify-center items-center gap-2 text-white/20 text-[8px] font-bold uppercase tracking-[0.4em] select-none pointer-events-none">
                {isDraggingScrollbar ? 'Dragging...' : 'Explore portfolio'}
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedVideo && (
          <VideoPlayer 
            item={selectedVideo} 
            onClose={() => setSelectedVideo(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
};
