import '../styles/globals.css';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import styles from '../styles/Builder.module.css';
import { supabase } from '../lib/supabaseClient';

const ToastContext = createContext(null);
const AuthContext = createContext({ user: null, session: null, loading: true });

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function useAuth() {
  return useContext(AuthContext);
}

export default function App({ Component, pageProps }) {
  const [toasts, setToasts] = useState([]);
  const [authState, setAuthState] = useState({ user: null, session: null, loading: true });

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Listen to Supabase Auth State Changes
  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setAuthState({
            session,
            user: session?.user ?? null,
            loading: false
          });
        }
      } catch (err) {
        console.error('Error fetching initial session:', err);
        if (mounted) {
          setAuthState((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setAuthState({
          session,
          user: session?.user ?? null,
          loading: false
        });
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <AuthContext.Provider value={authState}>
        <Component {...pageProps} />
        
        {/* Toast Container */}
        <div className={styles.toastContainer}>
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`${styles.toast} ${
                toast.type === 'error' ? styles.toastError : styles.toastSuccess
              }`}
            >
              <span>{toast.type === 'error' ? '❌' : '✨'}</span>
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      </AuthContext.Provider>
    </ToastContext.Provider>
  );
}
