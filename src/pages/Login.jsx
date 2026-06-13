import { Link, Navigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';

export default function Login() {
  const { isAdminAuth } = usePortfolio();
  const [loading, setLoading] = useState(false);

  if (isAdminAuth) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column' }}>
        <h1 className="text-gradient" style={{ textAlign: 'center', marginBottom: 'var(--spacing-xs)', fontSize: '2rem' }}>Welcome Back</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
          Sign in to your portfolio workspace
        </p>

        <form onSubmit={async (e) => { 
          e.preventDefault(); 
          setLoading(true);
          const email = e.target[0].value;
          const password = e.target[1].value;
          
          try {
            await signInWithEmailAndPassword(auth, email, password);
            // Si el login es exitoso, el onAuthStateChanged del context nos redirigirá automáticamente
          } catch (error) {
            console.error(error);
            alert('Credenciales incorrectas o error de conexión. Detalle: ' + error.message);
          } finally {
            setLoading(false);
          }
        }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" className="form-input" placeholder="you@example.com" style={{ paddingLeft: '44px' }} required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <a href="#" style={{ fontSize: '0.85rem' }}>Forgot?</a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="password" className="form-input" placeholder="••••••••" style={{ paddingLeft: '44px' }} required />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
            {loading ? 'Verificando...' : 'Sign In'} <LogIn size={18} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Portfolio Admin Access Only
        </p>
      </div>
    </div>
  )
}
