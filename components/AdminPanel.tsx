import React, { useState, useEffect, useRef } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { supabase, supabaseAvailable } from '../services/supabase';
import { CaseStudy, ContactSettings, SocialLink } from '../types';
import { saveVideoBlob, deleteVideoBlob, saveMetadata, getAllMetadata, deleteMetadata, getVideoBlob } from '../services/videoPersistence';
import { getSettings, saveSettings } from '../services/settingsPersistence';

const CustomSelect = ({ 
  value, 
  onChange, 
  options,
  onOpenChange
}: { 
  value: string, 
  onChange: (val: any) => void, 
  options: { value: string, label: string, color?: string }[],
  onOpenChange?: (isOpen: boolean) => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);
  const selectedLabel = selectedOption?.label || value;
  const selectedColor = (selectedOption as any)?.color;

  return (
    <div className="relative" ref={containerRef} style={{ zIndex: isOpen ? 100 : 1 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
      >
        <div className="flex items-center gap-2">
          {selectedColor && (
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedColor }} />
          )}
          <span>{selectedLabel}</span>
        </div>
        <svg 
          className={`w-3 h-3 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[110] top-full left-0 w-full mt-2 bg-[#1a1a1c] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-white/5 flex items-center gap-3 ${
                  value === opt.value ? 'text-blue-400 bg-blue-400/5' : 'text-white/60'
                }`}
              >
                {(opt as any).color && (
                  <div className="w-2.5 h-2.5 rounded-full shadow-lg shadow-black/20" style={{ backgroundColor: (opt as any).color }} />
                )}
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminVideoCard = ({ 
  video, 
  onDelete, 
  isDragging 
}: { 
  video: CaseStudy, 
  onDelete: (id: string) => void,
  isDragging?: boolean
}) => {
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isHovered]);

  useEffect(() => {
    let url = '';
    const loadVideo = async () => {
      if (video.videoUrl === 'local' || video.videoUrl === 'local_storage_only') {
        try {
          const blob = await getVideoBlob(video.id);
          if (blob) {
            url = URL.createObjectURL(blob);
            setVideoSrc(url);
          }
        } catch (err) {
          console.error("Failed to load local video:", err);
        }
      } else {
        setVideoSrc(video.videoUrl);
      }
    };
    loadVideo();
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [video.videoUrl, video.id]);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group bg-[#0a0a0c] border border-white/10 rounded-2xl overflow-hidden transition-all flex items-center p-3 gap-4 ${
        isDragging ? 'shadow-2xl scale-[1.02] border-blue-500/50 z-50 bg-white/5' : 'hover:border-white/20'
      }`}
    >
      {/* Small Preview Image/Video */}
      <div className={`relative flex-shrink-0 rounded-xl overflow-hidden bg-black border border-white/5 ${
        video.type === 'vertical' ? 'w-16 aspect-[9/16]' : 'w-24 aspect-[16/9]'
      }`}>
        {videoSrc && (
          <video 
            ref={videoRef}
            src={videoSrc}
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            onLoadedMetadata={(e) => {
              const v = e.target as HTMLVideoElement;
              v.currentTime = 0.1;
            }}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-grow min-w-0">
        <div className="flex flex-col">
          <span className="text-blue-400 text-[8px] font-bold tracking-widest uppercase">{video.category}</span>
          <h4 className="text-sm font-bold italic tracking-tight uppercase truncate">{video.title}</h4>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1 text-white/30 text-[9px] font-bold">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {video.duration || '0:15'}
          </div>
          <div className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-bold text-white/40 border border-white/5">
            {video.label || 'Viral Match'}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-white/5 text-white/20 cursor-grab active:cursor-grabbing">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(video.id);
          }}
          className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const AdminPanel: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [videos, setVideos] = useState<CaseStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAdminTab, setActiveAdminTab] = useState<'vertical' | 'horizontal'>('vertical');
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<(CaseStudy & { file: File, preview: string })[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check session
    if (localStorage.getItem('admin_session') === 'true') {
      setIsLoggedIn(true);
    }

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Load settings
        const currentSettings = await getSettings();
        setSettings(currentSettings);

        if (supabaseAvailable) {
          const { data, error } = await supabase
            .from('videos')
            .select('*')
            .order('order', { ascending: true });
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            setVideos(data as CaseStudy[]);
            setIsLoading(false);
            return;
          }
        }
        
        const localVideos = await getAllMetadata();
        setVideos(localVideos.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } catch (err) {
        console.error("Error loading data:", err);
        const localVideos = await getAllMetadata();
        setVideos(localVideos.sort((a, b) => (a.order || 0) - (b.order || 0)));
      } finally {
        setIsLoading(false);
      }
    };

    const loadVideos = async () => {
      if (supabaseAvailable) {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('order', { ascending: true });
        
        if (!error && data) {
          setVideos(data as CaseStudy[]);
        }
      }
    };

    loadInitialData();

    let subscription: any = null;
    if (supabaseAvailable) {
      subscription = supabase
        .channel('videos_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => {
          loadVideos();
        })
        .subscribe();
    }

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newUploads = files.map(file => {
        const url = URL.createObjectURL(file);
        return {
          id: `pending-${Date.now()}-${Math.random()}`,
          title: file.name.split('.')[0].replace(/[_-]/g, ' ').toUpperCase(),
          category: 'New Case',
          duration: '0:15',
          type: activeAdminTab,
          videoUrl: 'local',
          label: 'Viral Match',
          gradientClass: `card-gradient-${(pendingUploads.length % 3) + 1}`,
          order: videos.length + pendingUploads.length,
          file: file,
          preview: url
        };
      });
      setPendingUploads([...pendingUploads, ...newUploads]);
      
      // Reset input value to allow selecting same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpdatePending = (id: string, updates: Partial<CaseStudy>) => {
    setPendingUploads(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const handleRemovePending = (id: string) => {
    setPendingUploads(prev => {
      const filtered = prev.filter(u => u.id === id);
      filtered.forEach(u => URL.revokeObjectURL(u.preview));
      return prev.filter(u => u.id !== id);
    });
  };

  const handlePublishAll = async () => {
    if (pendingUploads.length === 0) return;
    setIsUploading(true);

    try {
      const publishedVideos: CaseStudy[] = [];
      
      for (const pending of pendingUploads) {
        const videoId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
        const finalVideo: CaseStudy = {
          id: videoId,
          title: pending.title,
          category: pending.category,
          duration: pending.duration,
          type: pending.type,
          videoUrl: 'local',
          label: pending.label,
          gradientClass: pending.gradientClass,
          order: videos.length + publishedVideos.length
        };

        // 1. Save to IndexedDB
        await saveVideoBlob(videoId, pending.file);
        await saveMetadata(videoId, finalVideo);

        // 2. Save to Supabase
        if (supabaseAvailable) {
          await supabase.from('videos').upsert([finalVideo]);
        }
        
        publishedVideos.push(finalVideo);
      }

      setVideos(prev => [...prev, ...publishedVideos].sort((a, b) => (a.order || 0) - (b.order || 0)));
      
      // Cleanup
      pendingUploads.forEach(u => URL.revokeObjectURL(u.preview));
      setPendingUploads([]);
    } catch (err) {
      console.error("Batch upload failed:", err);
      alert("Failed to publish some cases. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Delete this case?")) return;

    // Immediate UI update
    const previousVideos = [...videos];
    setVideos(videos.filter(v => v.id !== id));

    try {
      // 1. Delete from IndexedDB
      await deleteVideoBlob(id);
      await deleteMetadata(id);

      // 2. Supabase Update
      if (supabaseAvailable) {
        try {
          const { error: sErr } = await supabase
            .from('videos')
            .delete()
            .eq('id', id);
          
          if (sErr) throw sErr;
        } catch (sErr) {
          console.error("Supabase delete failed:", sErr);
          // Optional: rollback if server delete fails
          // setVideos(previousVideos);
        }
      }
    } catch (err) {
      console.error("Error deleting video:", err);
      setVideos(previousVideos); // Rollback on error
      alert("Error deleting video");
    }
  };

  const handleReorder = async (reorderedVideos: CaseStudy[]) => {
    // We only want to update the order of the currently visible tab
    // but the state contains ALL videos. So we merge the reordered ones back.
    const otherVideos = videos.filter(v => v.type !== activeAdminTab);
    const newAllVideos = [...otherVideos, ...reorderedVideos].sort((a, b) => {
      // If we don't update order values now, they will jump back.
      // We'll update them in the next step.
      return 0; 
    });

    // Correctly update the 'order' property for all videos
    const updatedWithOrder = [...otherVideos, ...reorderedVideos]
      .sort((a, b) => (a.order || 0) - (b.order || 0)); // This is not quite right for reordering
    
    // Better way: map the reordered list to new order values
    const finalVideos = [
      ...otherVideos,
      ...reorderedVideos.map((v, i) => ({ ...v, order: i }))
    ].sort((a, b) => (a.order || 0) - (b.order || 0));

    setVideos(finalVideos);

    // Save to persistence
    try {
      // Local
      for (const v of finalVideos) {
        await saveMetadata(v.id, v);
      }
      // Remote
      if (supabaseAvailable) {
        const { error } = await supabase
          .from('videos')
          .upsert(finalVideos);
        if (error) throw error;
      }
    } catch (err) {
      console.error("Failed to save new order:", err);
    }
  };

  const [activeSelectId, setActiveSelectId] = useState<string | null>(null);

  const handleSaveSettings = async () => {
    if (!settings) return;
    setIsSavingSettings(true);
    try {
      await saveSettings(settings);
      // The saveSettings function already dispatches 'settings-updated' and saves to localStorage
      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Error saving settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddSocial = () => {
    if (!settings) return;
    const newSocial: SocialLink = {
      id: Date.now().toString(),
      platform: 'New Social',
      displayName: '@username',
      url: '',
      icon: 'link'
    };
    setSettings({
      ...settings,
      socialLinks: [...settings.socialLinks, newSocial]
    });
  };

  const handleRemoveSocial = (id: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      socialLinks: settings.socialLinks.filter(s => s.id !== id)
    });
  };

  const handleUpdateSocial = (id: string, updates: Partial<SocialLink>) => {
    if (!settings) return;
    setSettings({
      ...settings,
      socialLinks: settings.socialLinks.map(s => s.id === id ? { ...s, ...updates } : s)
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'roma1337') {
      setIsLoggedIn(true);
      localStorage.setItem('admin_session', 'true');
      setError('');
    } else {
      setError('Неверный пароль');
    }
  };

  const filteredVideos = videos.filter(v => v.type === activeAdminTab);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#0a0a0c] border border-white/10 p-8 rounded-3xl"
        >
          <h2 className="text-2xl font-bold mb-6 text-center italic">ADMIN ACCESS</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Пароль</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all"
            >
              Войти
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-[900] italic tracking-tight">ADMIN PANEL</h1>
          <button 
            onClick={() => {
              localStorage.removeItem('admin_session');
              setIsLoggedIn(false);
            }}
            className="text-white/40 hover:text-white text-xs font-bold uppercase tracking-widest"
          >
            Выйти
          </button>
        </div>

        {/* Contact Settings Section */}
        {settings && (
          <div 
            className="mb-10 bg-[#0a0a0c] border border-white/10 p-8 rounded-[2.5rem] relative"
            style={{ zIndex: activeSelectId?.startsWith('social-') ? 50 : 1 }}
          >
            <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-[900] italic tracking-tight uppercase">Contact Info & Socials</h3>
              <button 
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="bg-white text-black px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50"
              >
                {isSavingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="relative group/field">
                  <label className="block text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1 ml-1">Email</label>
                  <input 
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] ml-1">Social Links</label>
                  <button 
                    onClick={handleAddSocial}
                    className="text-blue-400 text-[8px] font-bold uppercase tracking-widest hover:text-white transition-colors"
                  >
                    + Add Social
                  </button>
                </div>
                <div className="space-y-4">
                  {settings.socialLinks.map((social) => (
                    <div key={social.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl relative group">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="space-y-1">
                          <label className="block text-[7px] font-bold text-white/20 uppercase tracking-widest ml-1">Platform</label>
                          <input 
                            type="text"
                            value={social.platform}
                            onChange={(e) => handleUpdateSocial(social.id, { platform: e.target.value })}
                            placeholder="Platform"
                            className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-bold uppercase outline-none focus:border-blue-500/50 transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[7px] font-bold text-white/20 uppercase tracking-widest ml-1">Display Name</label>
                          <input 
                            type="text"
                            value={social.displayName}
                            onChange={(e) => handleUpdateSocial(social.id, { displayName: e.target.value })}
                            placeholder="@username"
                            className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-bold outline-none focus:border-blue-500/50 transition-all"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[7px] font-bold text-white/20 uppercase tracking-widest ml-1">Icon</label>
                          <CustomSelect 
                            value={social.icon}
                            onChange={(val) => handleUpdateSocial(social.id, { icon: val })}
                            onOpenChange={(isOpen) => setActiveSelectId(isOpen ? `social-${social.id}` : null)}
                            options={[
                              { value: 'instagram', label: 'Instagram', color: '#E4405F' },
                              { value: 'telegram', label: 'Telegram', color: '#24A1DE' },
                              { value: 'facebook', label: 'Facebook', color: '#1877F2' },
                              { value: 'x', label: 'X (Twitter)', color: '#FFFFFF' },
                              { value: 'youtube', label: 'YouTube', color: '#FF0000' },
                              { value: 'link', label: 'Other Link', color: '#6366f1' }
                            ]}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[7px] font-bold text-white/20 uppercase tracking-widest ml-1">URL</label>
                          <input 
                            type="text"
                            value={social.url}
                            onChange={(e) => handleUpdateSocial(social.id, { url: e.target.value })}
                            placeholder="https://..."
                            className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-[10px] outline-none focus:border-blue-500/50 transition-all"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => handleRemoveSocial(social.id)}
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 z-20"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-10">
          {/* Add Video Form */}
          <div 
            className="bg-[#0a0a0c] border border-white/10 p-8 rounded-[2.5rem] h-fit relative"
            style={{ zIndex: activeSelectId?.startsWith('upload-') ? 50 : 1 }}
          >
            <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
            <h3 className="text-2xl font-[900] italic mb-8 tracking-tight uppercase">Upload Cases</h3>
            
            <div className="space-y-6">
              {/* File Drop Area */}
              <div className="relative group">
                <input 
                  ref={fileInputRef}
                  type="file" 
                  multiple
                  accept="video/mp4,video/x-m4v,video/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full bg-white/5 border border-dashed border-white/10 rounded-2xl px-5 py-8 text-center transition-all group-hover:border-blue-500/50">
                  <svg className="w-8 h-8 mx-auto mb-3 text-white/20 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                    Drop videos or click to upload
                  </p>
                  <p className="text-[8px] text-white/20 mt-1 uppercase">Supports multiple files</p>
                </div>
              </div>

              {/* Pending Uploads List */}
              <AnimatePresence>
                {pendingUploads.length > 0 && (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                    {pendingUploads.map((pending) => (
                      <motion.div 
                        key={pending.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-5 rounded-[2rem] bg-white/5 border border-white/10 space-y-5 relative group/item transition-all"
                      >
                        <div className="flex gap-5">
                          <div className="w-24 aspect-video rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/5 shadow-2xl">
                            <video 
                              src={pending.preview} 
                              className="w-full h-full object-cover" 
                              muted 
                              loop
                              playsInline
                              preload="metadata"
                              onLoadedMetadata={(e) => {
                                const v = e.target as HTMLVideoElement;
                                v.currentTime = 0.1;
                              }}
                              onMouseEnter={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                              onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                            />
                          </div>
                          <div className="flex-grow space-y-3">
                            <div className="relative group/field">
                              <label className="block text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1 ml-1">Project Title</label>
                              <div className="relative">
                                <input 
                                  type="text"
                                  value={pending.title}
                                  onChange={(e) => handleUpdatePending(pending.id, { title: e.target.value })}
                                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold italic uppercase outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                                  placeholder="E.G. THE TECH HOOK"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/field:opacity-100 transition-opacity">
                                  <svg className="w-3 h-3 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </div>
                              </div>
                            </div>

                            <div className="relative group/field">
                              <label className="block text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1 ml-1">Category</label>
                              <div className="relative">
                                <input 
                                  type="text"
                                  value={pending.category}
                                  onChange={(e) => handleUpdatePending(pending.id, { category: e.target.value })}
                                  className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-[10px] font-bold uppercase outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                                  placeholder="E.G. TECH REVIEW"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/field:opacity-100 transition-opacity">
                                  <svg className="w-3 h-3 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleRemovePending(pending.id)}
                            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] ml-1">Format</label>
                            <CustomSelect 
                              value={pending.type}
                              onChange={(val) => handleUpdatePending(pending.id, { type: val })}
                              onOpenChange={(isOpen) => setActiveSelectId(isOpen ? `upload-${pending.id}` : null)}
                              options={[
                                { value: 'vertical', label: 'Vertical (9:16)' },
                                { value: 'horizontal', label: 'Horizontal (16:9)' }
                              ]}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] ml-1">Duration</label>
                            <div className="relative group/field">
                              <input 
                                type="text"
                                value={pending.duration}
                                onChange={(e) => handleUpdatePending(pending.id, { duration: e.target.value })}
                                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                placeholder="0:15"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>

              {pendingUploads.length > 0 && (
                <button 
                  onClick={handlePublishAll}
                  disabled={isUploading}
                  className="w-full bg-white text-black hover:bg-blue-500 hover:text-white font-[900] italic py-5 rounded-2xl transition-all uppercase tracking-tighter text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isUploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      PUBLISHING...
                    </>
                  ) : (
                    `PUBLISH ${pendingUploads.length} CASES`
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Video List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-[900] italic tracking-tight uppercase">Active Portfolio</h3>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                {(['vertical', 'horizontal'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveAdminTab(t)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                      activeAdminTab === t 
                        ? 'bg-white text-black' 
                        : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-[2.5rem] border border-white/10">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Loading Database...</p>
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-white/10">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">No {activeAdminTab} cases yet</p>
              </div>
            ) : (
              <Reorder.Group 
                axis="y" 
                values={filteredVideos} 
                onReorder={handleReorder}
                className="space-y-4"
              >
                <AnimatePresence mode="popLayout">
                  {filteredVideos.map((video) => (
                    <Reorder.Item
                      key={video.id}
                      value={video}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <AdminVideoCard 
                        video={video} 
                        onDelete={handleDeleteVideo}
                      />
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
