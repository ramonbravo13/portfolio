import { useState } from 'react';
import { Download, FileText, ChevronRight, User, LayoutDashboard, LogIn, Code, Terminal, Database, Edit, LogOut, Award, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import CertificationViewer from '../components/CertificationViewer';
import { usePortfolio } from '../context/PortfolioContext';

export default function Home() {
  const [selectedCert, setSelectedCert] = useState(null);
  const { profile, projects, isAdminAuth, logoutAdmin } = usePortfolio();

  const getIcon = (type) => {
    switch(type) {
      case 'Database': return <Database className="text-gradient" />;
      case 'Terminal': return <Terminal className="text-gradient" />;
      case 'Code': return <Code className="text-gradient" />;
      case 'Award': return <Award className="text-gradient" />;
      case 'Rocket': return <Rocket className="text-gradient" />;
      default: return <Code className="text-gradient" />;
    }
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Navigation Layer */}
      <nav style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-2xl)' }}>
        {isAdminAuth ? (
          <>
            <Link to="/admin" className="btn-primary" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}>
              <Edit size={18} /> Admin Panel
            </Link>
            <button onClick={logoutAdmin} className="btn-primary" style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}>
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--accent-primary)', color: 'var(--text-secondary)' }}>
            <LogIn size={18} /> Admin Login
          </Link>
        )}
      </nav>

      {/* Profile Header section */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-2xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)', flexWrap: 'wrap' }}>
          {profile.profileImage && (
            <div style={{ 
              width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', 
              border: '3px solid var(--accent-primary)', boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' 
            }}>
              <img src={profile.profileImage} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div>
            <h1 className="text-gradient" style={{ marginBottom: 'var(--spacing-xs)', fontSize: '3.5rem' }}>{profile.name}</h1>
            <p className="mono" style={{ color: 'var(--accent-primary)', fontSize: '1.2rem' }}>{profile.title}</p>
          </div>
        </div>
        <button className="btn-primary">
          <Download size={18} /> Download CV
        </button>
      </header>

      {/* About and Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-2xl)' }}>
        <div className="glass-panel">
          <h3>About Me</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {profile.bio}
          </p>
        </div>

        <div className="glass-panel">
          <h3>Core Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
            {(profile.skills || []).map(skill => (
              <span key={skill} style={{ 
                background: 'rgba(99, 102, 241, 0.1)', 
                color: 'var(--text-primary)', 
                padding: '6px 14px', 
                borderRadius: '100px', 
                fontSize: '0.85rem',
                border: '1px solid var(--accent-glow)'
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <section style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)' }}>
          <LayoutDashboard size={24} color="var(--accent-secondary)" />
          <h2 style={{ margin: 0 }}>Featured Projects / Notebook Space</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-xl)' }}>
          {projects.map(project => (
            <Link key={project.id} to={`/project/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="glass-panel" style={{ height: '100%', transition: 'transform 0.2s', cursor: 'pointer' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{project.title}</h3>
                  {getIcon(project.iconType)}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                  {(project.tags || []).map(tag => (
                    <span key={tag} className="mono" style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Certifications Section */}
      <section className="glass-panel" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h3>Certifications</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {(profile.certs || []).map((cert, idx) => (
            <li key={idx} style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: 'var(--spacing-md)', borderBottom: idx < (profile.certs?.length || 0) - 1 ? '1px solid var(--border-glass)' : 'none',
              cursor: 'pointer', transition: 'background 0.2s', borderRadius: 'var(--radius-sm)'
            }} onClick={() => setSelectedCert(cert)}
               onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-glass)'}
               onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <FileText size={20} color="var(--accent-primary)" />
                <span style={{ fontWeight: 500 }}>{cert.title}</span>
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>View PDF</span>
            </li>
          ))}
        </ul>
      </section>

      {selectedCert && (
        <CertificationViewer title={selectedCert.title} pdfUrl={selectedCert.url} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  )
}
