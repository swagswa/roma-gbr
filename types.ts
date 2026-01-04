
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

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}