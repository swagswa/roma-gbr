
// Fix: Import React to provide the React namespace for type definitions like ReactNode.
import React from 'react';

export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  gradientClass: string;
  label: string;
  type: 'vertical' | 'horizontal';
  duration: string;
  videoUrl: string;
  order: number;
}

export interface SocialLink {
  id: string;
  platform: string;
  displayName: string;
  url: string;
  icon: 'instagram' | 'telegram' | 'facebook' | 'x' | 'youtube' | 'link';
}

export interface ContactSettings {
  email: string;
  socialLinks: SocialLink[];
}

export interface Metric {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

export interface Mechanic {
  title: string;
  description: string;
  color: string;
}

declare module '*.jpg';
declare module '*.png';
declare module '*.svg';
declare module '*.mp4';