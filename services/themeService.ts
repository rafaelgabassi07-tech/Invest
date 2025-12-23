
import { AppTheme } from '../types';

export const AVAILABLE_THEMES: AppTheme[] = [
  {
    id: 'deep-obsidian',
    name: 'Obsidiana Âmbar',
    type: 'dark',
    colors: { primary: '#f59e0b', secondary: '#d97706', accent: '#10b981', highlight: 'rgba(245, 158, 11, 0.15)', muted: '#09090b' }, 
    preview: 'linear-gradient(135deg, #f59e0b 0%, #09090b 100%)'
  },
  {
    id: 'night-emerald',
    name: 'Esmeralda Noturna',
    type: 'dark',
    colors: { primary: '#10b981', secondary: '#059669', accent: '#34d399', highlight: 'rgba(16, 185, 129, 0.1)', muted: '#06201a' }, 
    preview: 'linear-gradient(135deg, #10b981 0%, #06201a 100%)'
  },
  {
    id: 'royal-sapphire',
    name: 'Safira Real',
    type: 'dark',
    colors: { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa', highlight: 'rgba(59, 130, 246, 0.1)', muted: '#0f172a' }, 
    preview: 'linear-gradient(135deg, #3b82f6 0%, #0f172a 100%)'
  },
  {
    id: 'crimson-oled',
    name: 'Carmesim OLED',
    type: 'dark',
    colors: { primary: '#f43f5e', secondary: '#e11d48', accent: '#fb7185', highlight: 'rgba(244, 63, 94, 0.05)', muted: '#000000' }, 
    preview: 'linear-gradient(135deg, #f43f5e 0%, #000000 100%)'
  },
  {
    id: 'cyber-neon',
    name: 'Ciberpunk',
    type: 'dark',
    colors: { primary: '#06b6d4', secondary: '#d946ef', accent: '#facc15', highlight: 'rgba(6, 182, 212, 0.15)', muted: '#0f172a' }, 
    preview: 'linear-gradient(135deg, #06b6d4 0%, #d946ef 100%)'
  },
  {
    id: 'arctic-white',
    name: 'Branco Ártico',
    type: 'light',
    colors: { primary: '#4f46e5', secondary: '#4338ca', accent: '#0ea5e9', highlight: '#eef2ff', muted: '#f8fafc' }, 
    preview: 'linear-gradient(135deg, #4f46e5 0%, #f8fafc 100%)'
  },
  {
    id: 'soft-amethyst',
    name: 'Ametista Soft',
    type: 'light',
    colors: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa', highlight: 'rgba(59, 130, 246, 0.1)', muted: '#ffffff' }, 
    preview: 'linear-gradient(135deg, #8b5cf6 0%, #ffffff 100%)'
  },
  {
    id: 'golden-glory',
    name: 'Glória Dourada',
    type: 'dark',
    colors: { primary: '#fbbf24', secondary: '#b45309', accent: '#fef3c7', highlight: 'rgba(251, 191, 36, 0.1)', muted: '#1a1a1a' }, 
    preview: 'linear-gradient(135deg, #fbbf24 0%, #1a1a1a 100%)'
  }
];
