import React from 'react';
import { Building2, Briefcase, Calendar, MapPin, TrendingUp, ChevronRight } from 'lucide-react';

/**
 * Extracts individual list items from an HTML string (Quill editor output)
 */
function extractListItems(htmlString) {
  if (!htmlString) return [];
  
  // Clean HTML entities
  const cleanHtml = htmlString
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Extract content inside <li> tags
  const liMatches = [...cleanHtml.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
  if (liMatches.length > 0) {
    return liMatches.map(m => m[1].trim()).filter(Boolean);
  }

  // Fallback if not inside <li>: split by paragraphs, linebreaks or newlines
  return cleanHtml
    .split(/<\/?p[^>]*>|<br\s*\/?>|\n/)
    .map(s => s.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean);
}

/**
 * Parses an experience item into a category badge + content, or a plain bullet
 */
function parseExperienceItem(rawItem) {
  // Strip outer HTML tags but keep inner text
  const cleanText = rawItem.replace(/<[^>]+>/g, '').trim();
  const colonIndex = cleanText.indexOf(':');

  // If colon exists within the first 35 chars, treat prefix as an uppercase Category Tag
  if (colonIndex > 0 && colonIndex <= 35) {
    const category = cleanText.slice(0, colonIndex).trim();
    const content = cleanText.slice(colonIndex + 1).trim();
    return {
      isCategory: true,
      category: category.toUpperCase(),
      content
    };
  }

  return {
    isCategory: false,
    content: cleanText
  };
}

/**
 * Ensures impact metrics like "60+ colaboradores" are bolded with <strong> tags
 */
function formatResponsibilityText(text) {
  if (!text) return '';
  return text
    .replace(/60\+\s*colaboradores/gi, (m) => `<strong>${m}</strong>`)
    .replace(/60\+\s*collaborators/gi, (m) => `<strong>${m}</strong>`)
    .replace(/\b(\d+[\d,]*\+?)\s*(estudiantes|colaboradores|alumnos|proyectos|usuarios|horas|planteles|escuelas)/gi, 
      (m) => `<strong>${m}</strong>`);
}

export default function ExperienceCard({ item, isEnglish }) {
  if (!item) return null;

  const hasMultipleRoles = Array.isArray(item.roles) && item.roles.length > 0;
  const isCeti = (item.company || '').toLowerCase().includes('ceti');

  // Single role fallbacks
  const role = isEnglish && item.role_en ? item.role_en : item.role;
  const period = isEnglish && item.period_en ? item.period_en : item.period;
  const rawTag = isEnglish && item.tag_en ? item.tag_en : item.tag;
  const rawDesc = isEnglish && item.desc_en ? item.desc_en : item.desc;

  const plantName = isCeti 
    ? (isEnglish ? 'CETI • RIO SANTIAGO PLANTEL' : 'CETI • RIO SANTIAGO PLANTEL')
    : (item.company || 'INSTITUCIÓN');

  // Render for nested progression trajectory (Multiple Roles in same organization)
  if (hasMultipleRoles) {
    const totalPeriod = isEnglish && item.period_en ? item.period_en : item.period;

    return (
      <div className="exp-saas-card animate-fade-up">
        <div className="exp-card-layout">
          
          {/* Left Column: Organization Header & Career Progression Stats */}
          <div className="exp-left-col">
            <div className="exp-institution-box">
              <div className="exp-emblem-container" title={item.company}>
                <div className="exp-emblem-icon-wrap">
                  <Building2 size={22} className="exp-emblem-icon" />
                </div>
                <span className="mono exp-emblem-code">{isCeti ? 'CETI' : 'ORG'}</span>
              </div>
              
              <div className="exp-institution-details">
                <span className="mono exp-org-type-tag">
                  {isCeti 
                    ? (isEnglish ? 'FEDERAL PUBLIC INSTITUTION' : 'ORGANISMO PÚBLICO DESCENTRALIZADO')
                    : (isEnglish ? 'ORGANIZATION / ENTERPRISE' : 'EMPRESA / INSTITUCIÓN')}
                </span>
                <h3 className="exp-plantel-title">
                  {plantName}
                </h3>
              </div>
            </div>

            {/* Progression Badge */}
            <div className="exp-info-group">
              <span className="mono exp-info-label">
                {isEnglish ? 'CAREER PROGRESSION' : 'TRAYECTORIA INSTITUCIONAL'}
              </span>
              <div className="exp-progression-badge">
                <TrendingUp size={13} />
                <span>{item.roles.length} {isEnglish ? 'ROLES & PROMOTIONS' : 'PUESTOS Y ASCENSOS'}</span>
              </div>
            </div>

            {/* Total Accumulated Period */}
            <div className="exp-info-group">
              <span className="mono exp-info-label">
                {isEnglish ? 'TOTAL TENURE' : 'TIEMPO ACUMULADO'}
              </span>
              <div className="exp-period-pill mono" style={{ fontWeight: 700 }}>
                <Calendar size={13} />
                <span>{totalPeriod || '10 AÑOS (2014 - PRESENTE)'}</span>
              </div>
            </div>

            {/* Institutional Location / Scope */}
            <div className="exp-info-group">
              <span className="mono exp-info-label">
                {isEnglish ? 'LOCATION & SCOPE' : 'UBICACIÓN Y ALCANCE'}
              </span>
              <div className="exp-scope-info">
                <MapPin size={13} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-sage)' }} />
                <span>{item.location || 'Jalisco, México • Educación Superior & Media Superior'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Internal Timeline with Connected Nodes */}
          <div className="exp-right-col">
            <div className="exp-timeline-wrapper">
              <div className="exp-timeline-line" />

              {item.roles.map((subRole, idx) => {
                const subRoleTitle = isEnglish && subRole.role_en ? subRole.role_en : subRole.role;
                const subPeriod = isEnglish && subRole.period_en ? subRole.period_en : subRole.period;
                const subRawTag = isEnglish && subRole.tag_en ? subRole.tag_en : subRole.tag;
                const subRawDesc = isEnglish && subRole.desc_en ? subRole.desc_en : subRole.desc;

                const tagItems = extractListItems(subRawTag);
                const descItems = extractListItems(subRawDesc);
                const allParsed = [...tagItems, ...descItems].map(parseExperienceItem);
                const categoryItems = allParsed.filter(p => p.isCategory);
                const regularItems = allParsed.filter(p => !p.isCategory);

                const isCurrent = idx === 0;

                return (
                  <div key={idx} className="exp-timeline-step">
                    {/* Node Dot */}
                    <div className={`exp-timeline-marker ${isCurrent ? 'active' : ''}`} title={subRoleTitle} />

                    {/* Role Header */}
                    <div className="exp-step-header">
                      <h4 className="exp-step-title">
                        <Briefcase size={15} color={isCurrent ? 'var(--color-ink)' : 'var(--color-sage)'} />
                        <span>{subRoleTitle}</span>
                        {isCurrent && (
                          <span style={{ fontSize: '0.68rem', background: 'var(--color-voltage)', color: 'var(--color-ink)', padding: '2px 7px', borderRadius: '4px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                            {isEnglish ? 'CURRENT' : 'ACTUAL'}
                          </span>
                        )}
                      </h4>

                      <div className="exp-step-period mono">
                        <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        <span>{subPeriod}</span>
                      </div>
                    </div>

                    {/* Strategic Pillars / Category Tags */}
                    {categoryItems.length > 0 && (
                      <div className="exp-categories-block" style={{ marginTop: '8px', marginBottom: '10px' }}>
                        {categoryItems.map((cat, cIdx) => (
                          <div key={cIdx} className="exp-category-row">
                            <span className="exp-category-badge mono">
                              {cat.category}
                            </span>
                            <p className="exp-category-text">
                              {cat.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Operational Responsibilities */}
                    {regularItems.length > 0 && (
                      <ul className="exp-bullet-list" style={{ marginTop: '8px' }}>
                        {regularItems.map((resp, rIdx) => {
                          const formattedHtml = formatResponsibilityText(resp.content);
                          return (
                            <li key={rIdx} className="exp-bullet-row">
                              <span className="exp-bullet-dot" />
                              <span 
                                className="exp-bullet-content"
                                dangerouslySetInnerHTML={{ __html: formattedHtml }}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Fallback for single role experience item
  const tagItems = extractListItems(rawTag);
  const descItems = extractListItems(rawDesc);
  const allParsed = [...tagItems, ...descItems].map(parseExperienceItem);
  const categoryItems = allParsed.filter(p => p.isCategory);
  const regularItems = allParsed.filter(p => !p.isCategory);

  const displayRole = isCeti
    ? (isEnglish ? 'CAMPUS DIRECTOR' : 'DIRECTOR DE PLANTEL')
    : (role || 'ROLE').toUpperCase();

  return (
    <div className="exp-saas-card animate-fade-up">
      <div className="exp-card-layout">
        
        {/* Left Column */}
        <div className="exp-left-col">
          <div className="exp-institution-box">
            <div className="exp-emblem-container" title={item.company}>
              <div className="exp-emblem-icon-wrap">
                <Building2 size={22} className="exp-emblem-icon" />
              </div>
              <span className="mono exp-emblem-code">{isCeti ? 'CETI' : 'EXP'}</span>
            </div>
            
            <div className="exp-institution-details">
              <span className="mono exp-org-type-tag">
                {isEnglish ? 'PROFESSIONAL EXPERIENCE' : 'ORGANIZACIÓN / EMPRESA'}
              </span>
              <h3 className="exp-plantel-title">
                {plantName}
              </h3>
            </div>
          </div>

          {/* Role / Position Badge */}
          <div className="exp-info-group">
            <span className="mono exp-info-label">
              {isEnglish ? 'ROLE / POSITION' : 'CARGO / PUESTO'}
            </span>
            <div className="exp-role-badge">
              <Briefcase size={14} />
              <span>{displayRole}</span>
            </div>
          </div>

          {/* Period Badge */}
          <div className="exp-info-group">
            <span className="mono exp-info-label">
              {isEnglish ? 'TIMELINE' : 'PERÍODO'}
            </span>
            <div className="exp-period-pill mono">
              <Calendar size={13} />
              <span>{period || '2025 - 2026'}</span>
            </div>
          </div>

          {/* Institutional Location / Scope */}
          <div className="exp-info-group">
            <span className="mono exp-info-label">
              {isEnglish ? 'LOCATION & SCOPE' : 'UBICACIÓN Y ALCANCE'}
            </span>
            <div className="exp-scope-info">
              <MapPin size={13} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-sage)' }} />
              <span>{item.location || 'México • Operaciones y Gestión'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Structured Responsibilities & Metrics */}
        <div className="exp-right-col">
          {categoryItems.length > 0 && (
            <div className="exp-categories-block">
              {categoryItems.map((cat, idx) => (
                <div key={idx} className="exp-category-row">
                  <span className="exp-category-badge mono">
                    {cat.category}
                  </span>
                  <p className="exp-category-text">
                    {cat.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {categoryItems.length > 0 && regularItems.length > 0 && (
            <div className="exp-card-divider" />
          )}

          {regularItems.length > 0 && (
            <ul className="exp-bullet-list">
              {regularItems.map((resp, idx) => {
                const formattedHtml = formatResponsibilityText(resp.content);
                return (
                  <li key={idx} className="exp-bullet-row">
                    <span className="exp-bullet-dot" />
                    <span 
                      className="exp-bullet-content"
                      dangerouslySetInnerHTML={{ __html: formattedHtml }}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
