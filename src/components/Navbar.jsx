import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MessageCircle, Github, Linkedin } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, toggleLanguage } = usePortfolio();
  const location = useLocation();
  const navigate = useNavigate();

  const isEnglish = language === 'en';

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
      backgroundColor: scrolled ? 'var(--bg-navbar)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border-light)' : '1px solid transparent',
      zIndex: 999,
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1440px',
        height: '100%',
        margin: '0 auto',
        padding: '0 var(--spacing-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link to="/" style={{ fontSize: '1.15rem', fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
          <span style={{ color: 'var(--color-sage)', fontWeight: 500 }}>Juan Ramón</span> Bravo López
        </Link>

        {/* Desktop Menu */}
        <div style={{ display: 'none', alignItems: 'center', gap: 'var(--spacing-xl)' }} className="desktop-menu">
          <ul style={{ display: 'flex', listStyle: 'none', gap: 'var(--spacing-xl)' }}>
            <li>
              <button onClick={() => handleNavClick('inicio')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                {isEnglish ? 'Home' : 'Inicio'}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('proyectos')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                {isEnglish ? 'Projects & Dev' : 'Proyectos y Desarrollo'}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('experiencia')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                {isEnglish ? 'Experience' : 'Experiencia'}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('educacion')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                {isEnglish ? 'Education & Research' : 'Educación & I+D'}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('certificaciones')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                {isEnglish ? 'Certifications' : 'Certificaciones'}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('contacto')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                {isEnglish ? 'Contact' : 'Contacto'}
              </button>
            </li>
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <button onClick={toggleLanguage} className="btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', minWidth: '40px' }}>
              {language === 'es' ? 'EN' : 'ES'}
            </button>
            
            <a href="https://github.com/ramonbravo13" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="GitHub">
              <Github size={18} />
            </a>
            <a href="https://www.linkedin.com/in/ramón-bravo" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="LinkedIn">
              <Linkedin size={18} />
            </a>
            <a href="https://wa.me/523315004877" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1.25rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>
              <MessageCircle size={14} /> WhatsApp
            </a>
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
          backgroundColor: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-light)',
          padding: 'var(--spacing-xl) var(--spacing-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-lg)',
          zIndex: 998
        }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', listStyle: 'none' }}>
            <li>
              <button onClick={() => handleNavClick('inicio')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500, width: '100%', textAlign: 'left' }}>
                {isEnglish ? 'Home' : 'Inicio'}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('proyectos')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500, width: '100%', textAlign: 'left' }}>
                {isEnglish ? 'Projects & Dev' : 'Proyectos y Desarrollo'}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('experiencia')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500, width: '100%', textAlign: 'left' }}>
                {isEnglish ? 'Experience' : 'Experiencia Profesional'}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('educacion')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500, width: '100%', textAlign: 'left' }}>
                {isEnglish ? 'Education & Research' : 'Educación & Investigación'}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('certificaciones')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500, width: '100%', textAlign: 'left' }}>
                {isEnglish ? 'Certifications' : 'Certificaciones'}
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('contacto')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500, width: '100%', textAlign: 'left' }}>
                {isEnglish ? 'Contact' : 'Contacto'}
              </button>
            </li>
          </ul>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
            <button onClick={() => { toggleLanguage(); setIsOpen(false); }} className="btn-secondary" style={{ justifyContent: 'center' }}>
              {isEnglish ? 'Cambiar a Español' : 'Switch to English'}
            </button>

            <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', marginTop: 'var(--spacing-xs)' }}>
              <a href="https://github.com/ramonbravo13" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Github size={20} />
              </a>
              <a href="https://www.linkedin.com/in/ramón-bravo" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.6rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Linkedin size={20} />
              </a>
            </div>
            <a href="https://wa.me/523315004877" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center', textDecoration: 'none' }}>
              <MessageCircle size={16} /> WhatsApp
            </a>
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
