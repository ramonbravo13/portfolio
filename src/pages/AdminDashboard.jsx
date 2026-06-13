import { Link, Navigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { LogOut, Home as HomeIcon } from 'lucide-react';
import ProfileEditor from '../components/Admin/ProfileEditor';
import ExperienceEditor from '../components/Admin/ExperienceEditor';
import CertificationsEditor from '../components/Admin/CertificationsEditor';
import ProjectEditor from '../components/Admin/ProjectEditor';

export default function AdminDashboard() {
  const { isAdminAuth, logoutAdmin } = usePortfolio();

  if (!isAdminAuth) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '1000px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-2xl)' }}>
        <div>
          <h1 className="text-gradient" style={{ marginBottom: 'var(--spacing-xs)', fontSize: '2.5rem' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your personal portfolio content</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <Link to="/" className="btn-primary" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}>
            <HomeIcon size={18} /> Visit Site
          </Link>
          <button onClick={() => { logoutAdmin(); window.location.href = '/login'; }} className="btn-primary" style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main>
        <ProfileEditor />
        <ExperienceEditor />
        <CertificationsEditor />
        <ProjectEditor />
      </main>
    </div>
  );
}
