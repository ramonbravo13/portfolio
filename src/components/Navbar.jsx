import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Calendar, Edit, LogOut } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAdminAuth, logoutAdmin } = usePortfolio();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';

  const handleNavClick = (sectionId) => {
    setIsOpen(false);
    if (isHome) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 'var(--nav-height)',
      backgroundColor: scrolled ? 'rgba(10, 10, 10, 0.75)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
      zIndex: 999,
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        height: '100%',
        margin: '0 auto',
        padding: '0 var(--spacing-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--accent-primary)' }}>Ramón</span> Bravo
        </Link>

        {/* Desktop Menu */}
        <div style={{ display: 'none', alignItems: 'center', gap: 'var(--spacing-xl)' }} className="desktop-menu">
          <ul style={{ display: 'flex', listStyle: 'none', gap: 'var(--spacing-xl)' }}>
            <li>
              <button onClick={() => handleNavClick('inicio')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                Inicio
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('proyectos')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                Proyectos
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('experiencia')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                Experiencia
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('contacto')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                Contacto
              </button>
            </li>
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            {isAdminAuth && (
              <>
                <Link to="/admin" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  <Edit size={14} /> Admin
                </Link>
                <button onClick={logoutAdmin} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <LogOut size={14} />
                </button>
              </>
            )}
            
            <button onClick={() => handleNavClick('contacto')} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
              <Calendar size={14} /> Agendar reunión
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} style={{
          display: 'block',
          background: 'none',
          border: 'none',
          color: 'var(--text-primary)',
          cursor: 'pointer'
        }} className="mobile-menu-btn">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 'var(--nav-height)',
          left: 0,
          right: 0,
          backgroundColor: '#0A0A0A',
          borderBottom: '1px solid var(--border-subtle)',
          padding: 'var(--spacing-xl) var(--spacing-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-lg)',
          zIndex: 998
        }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', listStyle: 'none' }}>
            <li>
              <button onClick={() => handleNavClick('inicio')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500, width: '100%', textAlign: 'left' }}>
                Inicio
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('proyectos')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500, width: '100%', textAlign: 'left' }}>
                Proyectos
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('experiencia')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500, width: '100%', textAlign: 'left' }}>
                Experiencia
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('contacto')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500, width: '100%', textAlign: 'left' }}>
                Contacto
              </button>
            </li>
          </ul>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
            {isAdminAuth && (
              <>
                <Link to="/admin" onClick={() => setIsOpen(false)} className="btn-secondary" style={{ justifyContent: 'center' }}>
                  <Edit size={16} /> Admin Panel
                </Link>
                <button onClick={() => { logoutAdmin(); setIsOpen(false); }} className="btn-secondary" style={{ justifyContent: 'center', borderColor: '#ef4444', color: '#ef4444' }}>
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </>
            )}

            <button onClick={() => handleNavClick('contacto')} className="btn-primary" style={{ justifyContent: 'center' }}>
              <Calendar size={16} /> Agendar reunión
            </button>
          </div>
        </div>
      )}

      {/* Embedded CSS for responsive navbar toggle */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-menu {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
