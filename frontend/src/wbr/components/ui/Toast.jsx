import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

/**
 * The global toast/alert system called for in frontend-development-plan.md's
 * "Shared / Global Elements": transaction submitted/confirmed/failed, form
 * validation errors, permission-denied events. Mount <ToastProvider> once
 * near the app root; call useToast() anywhere below it.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.show('Wallet connected', { variant: 'success' });
 *   toast.show('Transaction pending…', { variant: 'pending', duration: 8000 });
 */
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, { variant = 'info', duration = 4000 } = {}) => {
      const id = ++idRef.current;
      setToasts((list) => [...list, { id, message, variant }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`toast glass-elevated ${t.variant}`} role="status">
            <span className="toast-msg">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast() must be used inside <ToastProvider>');
  return ctx;
}
