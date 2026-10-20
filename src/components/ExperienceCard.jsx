import React from 'react';
import { Building2, Briefcase, Calendar, MapPin } from 'lucide-react';

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
    .replace(/60\+\s*collaborators/gi, (m) => `<strong>${m}</strong>`);
}

export default function ExperienceCard({ item, isEnglish }) {
  if (!item) return null;

  const role = isEnglish && item.role_en ? item.role_en : item.role;
  const period = isEnglish && item.period_en ? item.period_en : item.period;
  const rawTag = isEnglish && item.tag_en ? item.tag_en : item.tag;
  const rawDesc = isEnglish && item.desc_en ? item.desc_en : item.desc;

  // Extract and parse items from tag and desc
  const tagItems = extractListItems(rawTag);
  const descItems = extractListItems(rawDesc);

  // Group into categories (with prefix) and operational responsibilities
  const allParsed = [...tagItems, ...descItems].map(parseExperienceItem);
  const categoryItems = allParsed.filter(p => p.isCategory);
  const regularItems = allParsed.filter(p => !p.isCategory);

  // Format plant name and role
  const isCeti = (item.company || '').toLowerCase().includes('ceti');
  const plantName = isCeti 
    ? (isEnglish ? 'CETI • RIO SANTIAGO PLANTEL' : 'CETI • RIO SANTIAGO PLANTEL')
    : (item.company || 'INSTITUCIÓN');

  const displayRole = isCeti
    ? (isEnglish ? 'CAMPUS DIRECTOR' : 'DIRECTOR DE PLANTEL')
    : (role || 'ROLE').toUpperCase();

  return (
    <div className="exp-saas-card animate-fade-up">
      <div className="exp-card-layout">
        
        {/* Left Column: Institutional Header, Plantel, Role Badge & Period */}
        <div className="exp-left-col">
          <div className="exp-institution-box">
            <div className="exp-emblem-container" title="CETI - Centro de Enseñanza Técnica Industrial">
              <div className="exp-emblem-icon-wrap">
                <Building2 size={22} className="exp-emblem-icon" />
              </div>
              <span className="mono exp-emblem-code">CETI</span>
            </div>
            
            <div className="exp-institution-details">
              <span className="mono exp-org-type-tag">
                {isEnglish ? 'FEDERAL PUBLIC INSTITUTION' : 'ORGANISMO PÚBLICO DESCENTRALIZADO'}
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
              <span>Jalisco, México • Educación Superior & Media Superior</span>
            </div>
          </div>
        </div>

        {/* Right Column: Structured Responsibilities & Metrics */}
        <div className="exp-right-col">
          
          {/* 1. Category Strategic Pillars (DATA & OPERATIONS, PROJECT MANAGEMENT, LEADERSHIP) */}
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

          {/* Subtle separator between categories and operational responsibilities */}
          {categoryItems.length > 0 && regularItems.length > 0 && (
            <div className="exp-card-divider" />
          )}

          {/* 2. Structured Operational Responsibilities with Bolded Metrics */}
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
