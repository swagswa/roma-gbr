
import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Metrics } from './components/Metrics';
import { Portfolio } from './components/Portfolio';
import { AIStrategist } from './components/AIStrategist';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import ErrorBoundary from './components/ErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import { getSettings } from './services/settingsPersistence';
import { ContactSettings } from './types';

const getIconColor = (icon: string) => {
  switch (icon) {
    case 'instagram': return '#E4405F';
    case 'telegram': return '#24A1DE';
    case 'facebook': return '#1877F2';
    case 'x': return '#FFFFFF';
    case 'youtube': return '#FF0000';
    case 'link': return '#6366f1';
    default: return '#3b82f6';
  }
};

const SocialIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'instagram':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    case 'telegram':
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
        </svg>
      );
    case 'x':
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"></path>
        </svg>
      );
    case 'youtube':
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 00-1.94 2C1 8.14 1 12 1 12s0 3.86.42 5.58a2.78 2.78 0 001.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 001.94-2C23 15.86 23 12 23 12s0-3.86-.42-5.58zM9.54 15.56V8.44L15.81 12l-6.27 3.56z"></path>
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
  }
};

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [settings, setSettings] = useState<ContactSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const s = await getSettings();
      setSettings(s);
    };
    loadSettings();

    const handleUpdate = (e: any) => {
      setSettings(e.detail);
    };
    window.addEventListener('settings-updated', handleUpdate);

    // Check for admin hash
    const handleHashChange = () => {
      setIsAdmin(window.location.hash === '#admin');
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('open-contact-modal', handleOpenModal);
    
    // Smooth scroll behavior
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (this: HTMLAnchorElement, e: MouseEvent) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (href) {
          document.querySelector(href)?.scrollIntoView({
            behavior: 'smooth'
          });
        }
      });
    });

    return () => {
      window.removeEventListener('open-contact-modal', handleOpenModal);
      window.removeEventListener('settings-updated', handleUpdate);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  if (isAdmin) {
    return <AdminPanel />;
  }

  return (
    <div className="bg-[#050507] text-white min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Metrics />
        <ErrorBoundary>
          <Portfolio />
        </ErrorBoundary>
        <ErrorBoundary>
          <AIStrategist />
        </ErrorBoundary>
      </main>
      <Footer />
      
      {/* Contact Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] p-8 md:p-12 overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-white/30 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-10">
                <h3 className="text-3xl font-[900] italic tracking-tight uppercase mb-2">Let's Connect</h3>
                <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Ready to scale your retention?</p>
              </div>

              <div className="space-y-4">
                {settings?.socialLinks?.map((social) => {
                  const brandColor = getIconColor(social.icon);
                  return (
                    <a 
                      key={social.id}
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-6 bg-white/5 border border-white/5 rounded-2xl transition-all group relative overflow-hidden"
                      style={{ 
                        borderColor: 'rgba(255,255,255,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${brandColor}10`;
                        e.currentTarget.style.borderColor = `${brandColor}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                      }}
                    >
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg"
                        style={{ 
                          backgroundColor: `${brandColor}20`,
                          color: brandColor
                        }}
                      >
                        <SocialIcon icon={social.icon} />
                      </div>
                      <div className="text-left flex-grow min-w-0">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest truncate">{social.platform || 'Link'}</p>
                        <p className="text-lg font-bold truncate">
                          {social.displayName || (social.url ? social.url.replace(/https?:\/\/(www\.)?/, '').split('/')[0] : 'Visit Link')}
                        </p>
                      </div>
                      <div 
                        className="transition-colors flex-shrink-0"
                        style={{ color: 'rgba(255,255,255,0.2)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = brandColor}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </a>
                  );
                })}

                {settings?.email && (
                  <a 
                    href={`mailto:${settings.email}`} 
                    className="flex items-center gap-4 p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-purple-500/10 hover:border-purple-500/30 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left flex-grow">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Email</p>
                      <p className="text-lg font-bold truncate">{settings.email}</p>
                    </div>
                    <div className="text-white/20 group-hover:text-purple-400 transition-colors flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </a>
                )}
              </div>
              
              <p className="mt-10 text-center text-[10px] text-white/20 uppercase tracking-[0.3em]">Available for high-end partnerships</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Global Grain/Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] overflow-hidden">
        <div className="absolute inset-[-200%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] animate-grain" />
      </div>
      
      <style>{`
        @keyframes grain {
          0%, 100% { transform:translate(0, 0) }
          10% { transform:translate(-5%, -10%) }
          20% { transform:translate(-15%, 5%) }
          30% { transform:translate(7%, -25%) }
          40% { transform:translate(-5%, 25%) }
          50% { transform:translate(-15%, 10%) }
          60% { transform:translate(15%, 0%) }
          70% { transform:translate(0%, 15%) }
          80% { transform:translate(3%, 35%) }
          90% { transform:translate(-10%, 10%) }
        }
        .animate-grain {
          animation: grain 8s steps(10) infinite;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default App;
