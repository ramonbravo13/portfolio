import { useState, useMemo } from 'react';
import { 
  GraduationCap, BookOpen, ArrowUpRight, CheckCircle2, Clock, 
  Sparkles, ExternalLink, Calendar, Users, Building2, FileText
} from 'lucide-react';

export default function EducationSection({ education = [], isEnglish = false, onSelectDoc }) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'degrees' | 'papers'

  // Normalize education items
  const normalizedItems = useMemo(() => {
    return education.map((item, idx) => {
      const isPaper = item.type === 'paper';
      const isMaster = item.type === 'master';
      const isDegree = item.type === 'degree' || (!item.type && !isPaper && !isMaster);

      const title = (isEnglish && item.title_en ? item.title_en : item.title) || '';
      const institution = (isEnglish && item.institution_en ? item.institution_en : item.institution) || '';
      const period = (isEnglish && item.period_en ? item.period_en : item.period) || '';
      const desc = (isEnglish && item.desc_en ? item.desc_en : item.desc) || '';
      
      const rawTags = (isEnglish && item.tags_en ? item.tags_en : item.tags) || '';
      const tagsArray = (typeof rawTags === 'string' ? rawTags.split(',') : Array.isArray(rawTags) ? rawTags : [])
        .map(t => t.trim().toUpperCase())
        .filter(Boolean);

      return {
        ...item,
        id: item.id || idx,
        isPaper,
        isMaster,
        isDegree,
        title,
        institution,
        period,
        desc,
        tagsArray
      };
    });
  }, [education, isEnglish]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: normalizedItems.length,
      degrees: normalizedItems.filter(i => i.isDegree || i.isMaster).length,
      papers: normalizedItems.filter(i => i.isPaper).length
    };
  }, [normalizedItems]);

  // Filtered
  const filteredItems = useMemo(() => {
    if (activeFilter === 'degrees') return normalizedItems.filter(i => i.isDegree || i.isMaster);
    if (activeFilter === 'papers') return normalizedItems.filter(i => i.isPaper);
    return normalizedItems;
  }, [normalizedItems, activeFilter]);

  // Helper for status badge
  const renderStatusBadge = (item) => {
    const s = item.status || 'completed';

    if (item.isPaper) {
      if (s === 'in_review') {
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            <Clock size={12} /> {isEnglish ? 'PEER REVIEW' : 'EN REVISIÓN'}
          </span>
        );
      }
      if (s === 'preprint') {
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            <FileText size={12} /> {isEnglish ? 'PREPRINT' : 'PREPRINT'}
          </span>
        );
      }
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(43, 238, 75, 0.14)', color: '#15803d', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
          <CheckCircle2 size={12} /> {isEnglish ? 'PUBLISHED' : 'PUBLICADO'}
        </span>
      );
    }

    // Degree / Master
    if (s === 'in_progress') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(234, 179, 8, 0.14)', color: '#b45309', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
          <Clock size={12} /> {isEnglish ? 'IN PROGRESS' : 'EN CURSO'}
        </span>
      );
    }
    if (s === 'near_grad') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(59, 130, 246, 0.14)', color: '#1d4ed8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
          <Sparkles size={12} /> {isEnglish ? 'NEAR GRADUATION' : 'PRÓXIMO A EGRESAR'}
        </span>
      );
    }
    if (s === 'custom' && item.customStatusLabel) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(18, 22, 19, 0.08)', color: 'var(--color-ink)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
          <CheckCircle2 size={12} /> {(isEnglish && item.customStatusLabel_en ? item.customStatusLabel_en : item.customStatusLabel).toUpperCase()}
        </span>
      );
    }

    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(43, 238, 75, 0.14)', color: '#15803d', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
        <CheckCircle2 size={12} /> {isEnglish ? 'GRADUATED' : 'TITULADO'}
      </span>
    );
  };

  const handleOpenDoc = (item) => {
    if (!item.url) return;
    if (onSelectDoc && item.url.toLowerCase().endsWith('.pdf')) {
      onSelectDoc(item);
    } else {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (normalizedItems.length === 0) {
    return null; // Don't render section if empty
  }

  return (
    <section id="educacion" className="section-container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-2xl)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-sm)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
          <div>
            <span className="mono" style={{ display: 'inline-block', color: 'var(--color-sage)', marginBottom: '4px', letterSpacing: '0.06em' }}>
              {isEnglish ? 'ACADEMIC RIGOR & SCIENTIFIC RESEARCH' : 'RIGOR ACADÉMICO & PRODUCCIÓN CIENTÍFICA'}
            </span>
            <h2 style={{ margin: 0, fontSize: 'clamp(1.85rem, 3.8vw, 3rem)' }}>
              {isEnglish ? 'Education & Research' : 'Educación & Investigación'}
            </h2>
          </div>
          
          <div className="mono" style={{ color: 'var(--color-sage)', fontSize: '0.8rem', paddingBottom: '4px' }}>
            {isEnglish 
              ? `${normalizedItems.length} Academic Qualifications • Juan Ramón Bravo López`
              : `${normalizedItems.length} Acreditaciones Académicas • Juan Ramón Bravo López`}
          </div>
        </div>
      </div>

      {/* Tabs / Filter buttons if we have both degrees and papers */}
      {(counts.degrees > 0 && counts.papers > 0) && (
        <div className="cert-tabs-bar" role="tablist" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <button
            onClick={() => setActiveFilter('all')}
            className={`cert-tab-btn ${activeFilter === 'all' ? 'active' : ''}`}
          >
            <span>{isEnglish ? 'All Academic Records' : 'Todo'}</span>
            <span className="cert-tab-count">{counts.all}</span>
          </button>

          <button
            onClick={() => setActiveFilter('degrees')}
            className={`cert-tab-btn ${activeFilter === 'degrees' ? 'active' : ''}`}
          >
            <span>{isEnglish ? 'Academic Degrees' : 'Títulos Académicos'}</span>
            <span className="cert-tab-count">{counts.degrees}</span>
          </button>

          <button
            onClick={() => setActiveFilter('papers')}
            className={`cert-tab-btn ${activeFilter === 'papers' ? 'active' : ''}`}
          >
            <span>{isEnglish ? 'Publications & Papers' : 'Publicaciones & Papers'}</span>
            <span className="cert-tab-count">{counts.papers}</span>
          </button>
        </div>
      )}

      {/* Editorial Academic Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        {filteredItems.map((item) => (
          <article 
            key={item.id}
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: '14px',
              padding: 'clamp(1.5rem, 3vw, 2.25rem)',
              boxShadow: '0 4px 20px rgba(18, 22, 19, 0.04), 0 1px 3px rgba(18, 22, 19, 0.02)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-ink)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(18, 22, 19, 0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-light)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(18, 22, 19, 0.04), 0 1px 3px rgba(18, 22, 19, 0.02)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            {/* Top metadata line */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: 'var(--spacing-sm)' }}>
              
              {/* Type Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {item.isPaper ? (
                  <span style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '6px', 
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, 
                    color: 'var(--color-voltage)', background: 'var(--color-ink)', 
                    padding: '3px 10px', borderRadius: '4px', letterSpacing: '0.04em' 
                  }}>
                    <BookOpen size={13} /> {isEnglish ? 'SCIENTIFIC PUBLICATION / PAPER' : 'PUBLICACIÓN CIENTÍFICA / PAPER'}
                  </span>
                ) : item.isMaster ? (
                  <span style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '6px', 
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, 
                    color: '#ec4899', background: 'rgba(236, 72, 153, 0.1)', 
                    padding: '3px 10px', borderRadius: '4px', letterSpacing: '0.04em' 
                  }}>
                    <GraduationCap size={14} /> {isEnglish ? "MASTER'S DEGREE" : 'MAESTRÍA / POSTGRADO'}
                  </span>
                ) : (
                  <span style={{ 
                    display: 'inline-flex', alignItems: 'center', gap: '6px', 
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, 
                    color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.12)', 
                    padding: '3px 10px', borderRadius: '4px', letterSpacing: '0.04em' 
                  }}>
                    <GraduationCap size={14} /> {isEnglish ? 'PROFESSIONAL ENGINEERING DEGREE' : 'TÍTULO PROFESIONAL / INGENIERÍA'}
                  </span>
                )}
              </div>

              {/* Status and Period */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {renderStatusBadge(item)}
                {item.period && (
                  <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {item.period}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 style={{ 
              fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)', 
              fontWeight: 700, 
              color: 'var(--text-primary)', 
              margin: '8px 0 10px 0',
              lineHeight: 1.25 
            }}>
              {item.title}
            </h3>

            {/* Institution / Journal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-sage)', fontSize: '0.95rem', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>
              <Building2 size={16} />
              <span>{item.institution}</span>
            </div>

            {/* Authors (for papers) */}
            {item.authors && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 'var(--spacing-sm)' }}>
                <Users size={14} />
                <span><strong>{isEnglish ? 'Authors:' : 'Autores:'}</strong> {item.authors}</span>
              </div>
            )}

            {/* Abstract / Description Box */}
            {item.desc && (
              <div style={{
                background: 'rgba(18, 22, 19, 0.02)',
                borderLeft: item.isPaper ? '3px solid var(--color-voltage)' : '3px solid #8b5cf6',
                padding: '1rem 1.25rem',
                borderRadius: '0 8px 8px 0',
                margin: 'var(--spacing-sm) 0 var(--spacing-md) 0'
              }}>
                <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--color-sage)', display: 'block', marginBottom: '4px', letterSpacing: '0.04em' }}>
                  {item.isPaper ? (isEnglish ? 'ABSTRACT / RESEARCH FOCUS' : 'ABSTRACT / ENFOQUE CIENTÍFICO') : (isEnglish ? 'ACADEMIC SCOPE & SPECIALIZATION' : 'ENFOQUE ACADÉMICO & ESPECIALIZACIÓN')}
                </span>
                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.65, color: 'var(--text-primary)', textAlign: 'justify' }}>
                  {item.desc}
                </p>
              </div>
            )}

            {/* Tags and Action Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
              
              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {item.tagsArray.map((tag, tIdx) => (
                  <span key={tIdx} className="mono tech-badge" style={{ fontSize: '0.72rem' }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Link / Button */}
              {item.url && (
                <button
                  type="button"
                  onClick={() => handleOpenDoc(item)}
                  className="btn-primary"
                  style={{
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.8rem',
                    textDecoration: 'none'
                  }}
                  title={item.isPaper ? 'Leer artículo científico' : 'Ver documento oficial de acreditación'}
                >
                  {item.isPaper ? (
                    <><ExternalLink size={14} /> {isEnglish ? 'Read Paper / DOI' : 'Leer Paper / DOI'}</>
                  ) : (
                    <><ArrowUpRight size={14} /> {isEnglish ? 'View Official Degree' : 'Ver Título Oficial (PDF)'}</>
                  )}
                </button>
              )}
            </div>

          </article>
        ))}
      </div>
    </section>
  );
}
