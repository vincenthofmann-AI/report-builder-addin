/**
 * Toast Provider
 * ===============
 *
 * Provides global toast functionality using Zenith Toast.
 * Wraps the app and exposes toast functions via context.
 */

import { createContext, useContext, ReactNode } from 'react';
import { useToast as useZenithToast, type IShowToast } from './zenith-adapter';

interface ToastOptions {
  description?: string;
}

interface ToastContextValue {
  success: (message: string, options?: ToastOptions) => IShowToast;
  error: (message: string, options?: ToastOptions) => IShowToast;
  info: (message: string, options?: ToastOptions) => IShowToast;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const { showToast, toasts } = useZenithToast();

  const toast = {
    success: (message: string, options?: ToastOptions): IShowToast => {
      return showToast({
        header: (
          <div>
            <div style={{ fontWeight: 600 }}>{message}</div>
            {options?.description && (
              <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.8 }}>
                {options.description}
              </div>
            )}
          </div>
        ),
        type: 'success',
        showSeconds: 4,
      });
    },

    error: (message: string, options?: ToastOptions): IShowToast => {
      return showToast({
        header: (
          <div>
            <div style={{ fontWeight: 600, color: '#dc2626' }}>{message}</div>
            {options?.description && (
              <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.8 }}>
                {options.description}
              </div>
            )}
          </div>
        ),
        type: 'info',
        showSeconds: 5,
      });
    },

    info: (message: string, options?: ToastOptions): IShowToast => {
      return showToast({
        header: (
          <div>
            <div style={{ fontWeight: 600 }}>{message}</div>
            {options?.description && (
              <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.8 }}>
                {options.description}
              </div>
            )}
          </div>
        ),
        type: 'info',
        showSeconds: 4,
      });
    },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Zenith Toast Container */}
      <div style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 9999 }}>
        {toasts}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to access toast functions
 * Usage: const toast = useToast(); toast.success("Saved!");
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

/**
 * Standalone toast object for non-component contexts
 * Note: This won't work without ToastProvider in the tree
 */
export const toast = {
  success: (message: string, options?: ToastOptions) => console.warn('Toast not initialized:', message),
  error: (message: string, options?: ToastOptions) => console.warn('Toast not initialized:', message),
  info: (message: string, options?: ToastOptions) => console.warn('Toast not initialized:', message),
};
