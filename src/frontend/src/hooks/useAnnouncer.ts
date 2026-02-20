import { create } from 'zustand';

interface AnnouncerState {
  message: string;
  mode: 'polite' | 'assertive';
  announce: (message: string, mode?: 'polite' | 'assertive') => void;
}

export const useAnnouncer = create<AnnouncerState>((set) => ({
  message: '',
  mode: 'polite',
  announce: (message: string, mode: 'polite' | 'assertive' = 'polite') => {
    set({ message, mode });
    // Clear message after announcement to allow repeated announcements
    setTimeout(() => set({ message: '' }), 100);
  },
}));
