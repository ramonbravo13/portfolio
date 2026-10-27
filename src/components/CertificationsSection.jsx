import { useState, useMemo } from 'react';
import { 
  Award, CheckCircle2, 
  Terminal, Database, Layers, GraduationCap, ArrowUpRight,
  Clock, Sparkles, BookOpen
} from 'lucide-react';

// Helper to determine the logical category of each certification
export function getCertCategory(cert) {
  // 1. Explicit credential type
  if (cert.credentialType === 'degree' || cert.credentialType === 'master') {
    return 'education';
  }

  const text = `${cert.title} ${cert.title_en || ''} ${cert.tags || ''} ${cert.tags_en || ''}`.toLowerCase();
  
  // 2. Keyword fallback for academic degrees
  if (text.includes('ingenier') || text.includes('licenciatura') || text.includes('título') || text.includes('degree') || text.includes('universidad')) {
    return 'education';
  }
  if (text.includes('gesti') || text.includes('project') || text.includes('scrum') || text.includes('agil')) {
    return 'management';
  }
  if (text.includes('deep learning') || text.includes('machine learning') || text.includes('scikit') || 
      text.includes('pytorch') || text.includes('hugging') || text.includes('ai') || 
      text.includes('inteligencia artificial') || text.includes('supervised')) {
    return 'ml_dl';
  }
  if (text.includes('engineering') || text.includes('etl') || text.includes('big data') || 
      text.includes('cloud') || text.includes('aws') || text.includes('pipeline') || text.includes('developer')) {
    return 'data_eng';
  }
  if (text.includes('análisis') || text.includes('analysis') || text.includes('power bi') || 
      text.includes('tableau') || text.includes('pandas') || text.includes('sql') || 
      text.includes('modelado') || text.includes('datos')) {
    return 'data_analysis';
  }
  return 'ml_dl';
}

// Helper to detect platform / issuer and visual accent
export function getIssuerInfo(cert, isEnglish = false) {
  // Explicit degree or master
  if (cert.credentialType === 'degree') {
    const base = isEnglish ? 'Professional Degree' : 'Título Profesional';
    return {
      name: cert.institution ? `${base} • ${cert.institution}` : base,
      badgeColor: '#8b5cf6',
      badgeBg: 'rgba(139, 92, 246, 0.1)',
      icon: 'academic'
    };
  }

  if (cert.credentialType === 'master') {
    const base = isEnglish ? "Master's Degree" : 'Maestría / Postgrado';
    return {
      name: cert.institution ? `${base} • ${cert.institution}` : base,
      badgeColor: '#ec4899',
      badgeBg: 'rgba(236, 72, 153, 0.1)',
      icon: 'academic'
    };
  }

  if (cert.credentialType === 'custom' && cert.customTypeLabel) {
    return {
      name: cert.institution ? `${cert.customTypeLabel} • ${cert.institution}` : cert.customTypeLabel,
      badgeColor: 'var(--color-voltage)',
      badgeBg: 'rgba(43, 238, 75, 0.1)',
      icon: 'custom'
    };
  }

  if (cert.institution) {
    return {
      name: cert.institution,
      badgeColor: 'var(--color-sage)',
      badgeBg: 'rgba(81, 98, 84, 0.1)',
      icon: 'general'
    };
  }

  // Automatic keyword fallback
  const t = `${cert.title} ${cert.tags || ''}`.toLowerCase();
  
  if (t.includes('ingenier') || t.includes('licenciatura') || t.includes('título')) {
    return {
      name: isEnglish ? 'Professional Degree' : 'Título Profesional',
      badgeColor: '#8b5cf6',
      badgeBg: 'rgba(139, 92, 246, 0.1)',
      icon: 'academic'
    };
  }
  if (t.includes('google')) {
    return {
      name: 'Google',
      badgeColor: '#ea4335',
      badgeBg: 'rgba(234, 67, 53, 0.08)',
      icon: 'google'
    };
  }
  if (t.includes('datacamp') || t.includes('scikit') || t.includes('pandas') || 
      t.includes('hugging') || t.includes('pytorch') || t.includes('explainable') || 
      t.includes('unsupervised') || t.includes('python for developers') || 
      t.includes('understanding data engineering') || t.includes('responsible ai')) {
    return {
      name: 'DataCamp',
      badgeColor: '#03ef62',
      badgeBg: 'rgba(3, 239, 98, 0.1)',
      icon: 'datacamp'
    };
  }
  if (t.includes('aws') || t.includes('amazon')) {
    return {
      name: 'AWS',
      badgeColor: '#ff9900',
      badgeBg: 'rgba(255, 153, 0, 0.1)',
      icon: 'aws'
    };
  }
  if (t.includes('meta')) {
    return {
      name: 'Meta',
      badgeColor: '#0081fb',
      badgeBg: 'rgba(0, 129, 251, 0.1)',
      icon: 'meta'
    };
  }
  if (t.includes('máster') || t.includes('master') || t.includes('diplomado')) {
    return {
      name: isEnglish ? 'Executive Program' : 'Formación Executive',
      badgeColor: '#8b5cf6',
      badgeBg: 'rgba(139, 92, 246, 0.1)',
      icon: 'academic'
    };
  }

  return {
    name: isEnglish ? 'Technical Certification' : 'Certificación Técnica',
    badgeColor: 'var(--color-sage)',
    badgeBg: 'rgba(81, 98, 84, 0.1)',
    icon: 'general'
  };
}

// Helper to determine status badge (Oficial, Titulado, En Curso, Próximo a Egresar)
export function getCertStatusInfo(cert, isEnglish = false) {
  const status = cert.status || 'completed';

  if (status === 'in_progress') {
    return {
      label: isEnglish ? 'IN PROGRESS' : 'EN CURSO',
      color: '#b45309',
      bg: 'rgba(234, 179, 8, 0.14)',
      icon: 'clock'
    };
  }

  if (status === 'near_grad') {
    return {
      label: isEnglish ? 'NEAR GRADUATION' : 'PRÓXIMO A EGRESAR',
      color: '#1d4ed8',
      bg: 'rgba(59, 130, 246, 0.14)',
      icon: 'sparkles'
    };
  }

  if (status === 'custom' && cert.customStatusLabel) {
    const customTxt = isEnglish && cert.customStatusLabel_en ? cert.customStatusLabel_en : cert.customStatusLabel;
    return {
      label: customTxt.toUpperCase(),
      color: 'var(--color-ink)',
      bg: 'rgba(18, 22, 19, 0.08)',
      icon: 'check'
    };
  }

  // Default: Completed / Titulado / Oficial
  const isDegree = cert.credentialType === 'degree' || cert.credentialType === 'master' ||
    `${cert.title} ${cert.tags || ''}`.toLowerCase().includes('ingenier');

  return {
    label: isDegree ? (isEnglish ? 'GRADUATED' : 'TITULADO') : (isEnglish ? 'VERIFIED' : 'OFICIAL'),
    color: '#15803d',
    bg: 'rgba(43, 238, 75, 0.14)',
    icon: 'check'
  };
}

export default function CertificationsSection({ certs = [], isEnglish = false, onSelectCert }) {
  const [activeCategory, setActiveCategory] = useState('all');

  // Filter out academic degrees so they shine in Education & Research section
  const technicalCerts = useMemo(() => {
    return certs.filter(c => {
      const isDegree = c.credentialType === 'degree' || c.credentialType === 'master' ||
        `${c.title}`.toLowerCase().includes('ingenier') ||
        `${c.title}`.toLowerCase().includes('licenciatura') ||
        `${c.title}`.toLowerCase().includes('título');
      return !isDegree;
    });
  }, [certs]);

  // Map certs with category, issuer and status
  const enrichedCerts = useMemo(() => {
    return technicalCerts.map((cert, index) => {
      const category = getCertCategory(cert);
      const issuer = getIssuerInfo(cert, isEnglish);
      const statusInfo = getCertStatusInfo(cert, isEnglish);
      
      // Clean and normalize tags as array
      const rawTags = (isEnglish && cert.tags_en ? cert.tags_en : cert.tags) || '';
      const tagsArray = (typeof rawTags === 'string' ? rawTags.split(',') : Array.isArray(rawTags) ? rawTags : [])
        .map(t => t.trim().toUpperCase())
        .filter(Boolean);

      return {
        ...cert,
        index: index + 1,
        category,
        issuer,
        statusInfo,
        tagsArray
      };
    });
  }, [technicalCerts, isEnglish]);

  // Compute counts per category
  const categoryCounts = useMemo(() => {
    const counts = { all: enrichedCerts.length, data_eng: 0, data_analysis: 0, ml_dl: 0, management: 0 };
    enrichedCerts.forEach(c => {
      if (counts[c.category] !== undefined) {
        counts[c.category]++;
      }
    });
    return counts;
  }, [enrichedCerts]);

  // Categories definitions
  const categories = useMemo(() => [
    { id: 'all', label: isEnglish ? 'All Credentials' : 'Todas las Credenciales' },
    { id: 'data_eng', label: isEnglish ? 'Data Engineering & Cloud' : 'Data Engineering & Cloud' },
    { id: 'data_analysis', label: isEnglish ? 'Data Analysis & Viz' : 'Análisis de Datos & BI' },
    { id: 'ml_dl', label: isEnglish ? 'Machine Learning & AI' : 'Machine Learning & Deep Learning' },
    { id: 'management', label: isEnglish ? 'Management & Agile' : 'Gestión & Metodologías' }
  ], [isEnglish]);

  // Filter certs
  const filteredCerts = useMemo(() => {
    if (activeCategory === 'all') return enrichedCerts;
    return enrichedCerts.filter(c => c.category === activeCategory);
  }, [enrichedCerts, activeCategory]);

  const renderIssuerIcon = (icon) => {
    switch(icon) {
      case 'academic':
        return <GraduationCap size={14} style={{ color: '#8b5cf6' }} />;
      case 'custom':
        return <BookOpen size={14} style={{ color: 'var(--color-voltage)' }} />;
      case 'datacamp':
        return <Terminal size={14} style={{ color: '#03ef62' }} />;
      case 'google':
        return <Database size={14} style={{ color: '#ea4335' }} />;
      case 'aws':
        return <Layers size={14} style={{ color: '#ff9900' }} />;
      default:
        return <Award size={14} style={{ color: 'var(--color-sage)' }} />;
    }
  };

  const renderStatusIcon = (icon) => {
    switch(icon) {
      case 'clock':
        return <Clock size={11} />;
      case 'sparkles':
        return <Sparkles size={11} />;
      default:
        return <CheckCircle2 size={11} />;
    }
  };

  const handleOpenDoc = (cert, e) => {
    e.stopPropagation();
    if (cert.url) {
      window.open(cert.url, '_blank', 'noopener,noreferrer');
    } else if (onSelectCert) {
      onSelectCert(cert);
    }
  };

  return (
    <section id="certificaciones" className="section-container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-2xl)' }}>
      {/* Section Header */}
      <div style={{ marginBottom: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-sm)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
          <div>
            <span className="mono" style={{ display: 'inline-block', color: 'var(--color-sage)', marginBottom: '4px', letterSpacing: '0.06em' }}>
              {isEnglish ? 'CONTINUOUS LEARNING & TECHNICAL CREDENTIALS' : 'FORMACIÓN CONTINUA & CREDENCIALES TÉCNICAS'}
            </span>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)' }}>
              {isEnglish ? 'Technical Certifications' : 'Certificaciones Técnicas'}
            </h2>
          </div>
          
          <div className="mono" style={{ color: 'var(--color-sage)', fontSize: '0.8rem', paddingBottom: '4px' }}>
            {isEnglish 
              ? `${enrichedCerts.length} Technical Credentials • Juan Ramón Bravo López`
              : `${enrichedCerts.length} Credenciales Técnicas • Juan Ramón Bravo López`}
          </div>
        </div>
      </div>

      {/* Category Tabs / Filters */}
      <div className="cert-tabs-bar" role="tablist" aria-label="Filtro de Certificaciones">
        {categories.map((cat) => {
          const count = categoryCounts[cat.id] || 0;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveCategory(cat.id)}
              className={`cert-tab-btn ${isActive ? 'active' : ''}`}
            >
              <span>{cat.label}</span>
              <span className="cert-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Compact Grid of Cards */}
      {filteredCerts.length === 0 ? (
        <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>{isEnglish ? 'No certifications in this category.' : 'No hay certificaciones en esta categoría.'}</p>
        </div>
      ) : (
        <div className="certs-grid-compact">
          {filteredCerts.map((cert) => {
            const title = (isEnglish && cert.title_en ? cert.title_en : cert.title).replace('Datoss', 'Datos').replace('Learnig', 'Learning');
            const displayTags = cert.tagsArray.slice(0, 3);
            const remainingTagsCount = cert.tagsArray.length - displayTags.length;

            return (
              <article
                key={cert.id || cert.index}
                onClick={() => onSelectCert ? onSelectCert(cert) : handleOpenDoc(cert, { stopPropagation: () => {} })}
                className="cert-card-compact animate-fade-in"
                style={{ cursor: 'pointer' }}
              >
                <div>
                  {/* Card Header: Issuer + Custom Status Pill */}
                  <div className="cert-card-header">
                    <div className="cert-issuer-badge" style={{ color: cert.issuer.badgeColor }}>
                      {renderIssuerIcon(cert.issuer.icon)}
                      <span title={cert.issuer.name}>{cert.issuer.name}</span>
                    </div>

                    <div 
                      className="cert-verified-pill" 
                      title={cert.statusInfo.label}
                      style={{
                        backgroundColor: cert.statusInfo.bg,
                        color: cert.statusInfo.color
                      }}
                    >
                      {renderStatusIcon(cert.statusInfo.icon)}
                      <span>{cert.statusInfo.label}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="cert-compact-title" title={title}>
                    {title}
                  </h3>

                  {/* Technology Pills */}
                  <div className="cert-compact-pills">
                    {displayTags.length > 0 ? (
                      displayTags.map((tag, tIdx) => (
                        <span key={tIdx} className="cert-tech-pill">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="cert-tech-pill">ACADEMIC</span>
                    )}
                    {remainingTagsCount > 0 && (
                      <span className="cert-tech-pill" style={{ opacity: 0.7 }}>
                        +{remainingTagsCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer: Recipient watermark & Action link */}
                <div className="cert-compact-footer">
                  <span className="mono" style={{ fontSize: '0.68rem', color: 'var(--color-sage)', letterSpacing: '0.04em' }}>
                    Juan Ramón Bravo López
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleOpenDoc(cert, e)}
                    className="cert-action-btn"
                    title={isEnglish ? 'Open official credential in new tab' : 'Abrir credencial oficial en nueva pestaña'}
                  >
                    <span>{isEnglish ? 'Credential' : 'Ver Credencial'}</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
