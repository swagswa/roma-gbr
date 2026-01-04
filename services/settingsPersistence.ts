import { supabase, supabaseAvailable } from './supabase';
import { ContactSettings } from '../types';

const SETTINGS_KEY = 'site_settings';

const defaultSettings: ContactSettings = {
  email: 'roma.gbr@gmail.com',
  socialLinks: [
    { id: '1', platform: 'Instagram', displayName: '@roma.gbr', url: 'https://instagram.com/roma.gbr', icon: 'instagram' },
    { id: '2', platform: 'Telegram', displayName: '@roma_gbr', url: 'https://t.me/roma_gbr', icon: 'telegram' }
  ]
};

export const getSettings = async (): Promise<ContactSettings> => {
  try {
    if (supabaseAvailable) {
      const { data, error } = await supabase
        .from('settings')
        .select('content')
        .eq('id', 'contact_info')
        .single();
      
      if (!error && data) {
        return data.content as ContactSettings;
      }
    }
  } catch (err) {
    console.error('Error fetching settings from Supabase:', err);
  }

  // Fallback to localStorage
  const local = localStorage.getItem(SETTINGS_KEY);
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {
      console.error('Error parsing local settings:', e);
    }
  }

  return defaultSettings;
};

export const saveSettings = async (settings: ContactSettings): Promise<void> => {
  try {
    if (supabaseAvailable) {
      const { error } = await supabase
        .from('settings')
        .upsert({ id: 'contact_info', content: settings });
      
      if (error) throw error;
    }
  } catch (err) {
    console.error('Error saving settings to Supabase:', err);
  }

  // Always save to localStorage as backup
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  
  // Dispatch event for components to update with a small delay to ensure storage is ready
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('settings-updated', { detail: settings }));
    // Also dispatch a storage event for cross-tab synchronization if needed
    window.dispatchEvent(new Event('storage'));
  }, 100);
};
