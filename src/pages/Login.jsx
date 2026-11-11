import { Link, Navigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useState, useEffect } from 'react';

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

export default function Login() {
  const { isAdminAuth, authLoading } = usePortfolio();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  if (authLoading) {
    return (
      <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p className="mono" style={{ color: 'var(--text-secondary)' }}>Verificando sesión segura...</p>
      </div>
    );
  }

  if (isAdminAuth) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (lockoutRemaining > 0) return;

    setErrorMsg('');
    setResetMsg('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (error?.code === 'auth/too-many-requests' || nextAttempts >= MAX_ATTEMPTS) {
        setLockoutRemaining(LOCKOUT_SECONDS);
        setErrorMsg('Demasiados intentos fallidos. Por seguridad, el acceso se ha bloqueado temporalmente por 60 segundos.');
      } else {
        // Generic error message to prevent user/email enumeration
        setErrorMsg('Credenciales inválidas o acceso no autorizado.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setErrorMsg('');
    setResetMsg('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Ingresa tu correo electrónico arriba para enviarte el enlace de recuperación.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
    } catch {
      // Do not reveal whether the email exists in Firebase Auth
    }
    setResetMsg('Si el correo está registrado como administrador, recibirás un enlace para restablecer tu contraseña.');
  };

  return (
    <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="premium-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', padding: 'var(--spacing-2xl) var(--spacing-xl)', border: '1px solid var(--border-light)' }}>
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <Link to="/" className="hover-underline mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={14} /> Volver al Portafolio
          </Link>
        </div>

        <h1 style={{ textAlign: 'center', marginBottom: 'var(--spacing-xs)', fontSize: '2rem' }}>Welcome Back</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
          Sign in to your portfolio workspace
        </p>

        {errorMsg && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg} {lockoutRemaining > 0 && `(${lockoutRemaining}s)`}</span>
          </div>
        )}

        {resetMsg && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981', color: '#10b981', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{resetMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} autoComplete="on">
          <div className="form-group">
            <label className="form-label" htmlFor="admin-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                className="form-input"
                placeholder="you@example.com"
                style={{ paddingLeft: '44px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || lockoutRemaining > 0}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
              <label className="form-label" htmlFor="admin-password" style={{ marginBottom: 0 }}>Password</label>
              <button
                type="button"
                onClick={handlePasswordReset}
                style={{ background: 'none', border: 'none', color: 'var(--color-sage)', fontSize: '0.82rem', cursor: 'pointer', padding: 0 }}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="form-input"
                placeholder="••••••••"
                style={{ paddingLeft: '44px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || lockoutRemaining > 0}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || lockoutRemaining > 0}
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
          >
            {lockoutRemaining > 0
              ? `Bloqueado (${lockoutRemaining}s)`
              : loading
              ? 'Verificando...'
              : 'Sign In'}{' '}
            <LogIn size={18} />
          </button>
        </form>

        <p className="mono" style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
          Portfolio Admin Access Only
        </p>
      </div>
    </div>
  );
}
