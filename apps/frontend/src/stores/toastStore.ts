import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // milliseconds, default 3000
}

interface ToastStore {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (type, message, duration = 3000) => {
    const id = crypto.randomUUID();
    const toast: Toast = { id, type, message, duration };

    set(state => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: id => {
    set(state => ({
      toasts: state.toasts.filter(toast => toast.id !== id),
    }));
  },

  success: (message, duration) => get().addToast('success', message, duration),
  error: (message, duration) => get().addToast('error', message, duration),
  info: (message, duration) => get().addToast('info', message, duration),
  warning: (message, duration) => get().addToast('warning', message, duration),
}));
