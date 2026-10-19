import { Building2, CheckCircle2, TrendingUp } from 'lucide-react';

export const COMMERCIAL_BADGES = {
  client: {
    label: 'Proyecto Comercial / Cliente Real',
    label_en: 'Commercial Project / Real Client',
    tag: 'CLIENT SOLUTION',
    color: '#0284c7', // Sky Blue
    bg: 'rgba(2, 132, 199, 0.08)',
    border: 'rgba(2, 132, 199, 0.28)'
  },
  saas: {
    label: 'SaaS Propio / Prototipo Comercial',
    label_en: 'Proprietary SaaS / Commercial Prototype',
    tag: 'ORIGINAL SAAS',
    color: '#9333ea', // Purple
    bg: 'rgba(147, 51, 234, 0.08)',
    border: 'rgba(147, 51, 234, 0.28)'
  },
  research: {
    label: 'I+D / Caso de Estudio Técnico',
    label_en: 'R&D / Technical Case Study',
    tag: 'R&D CASE STUDY',
    color: '#15803d', // Green / Emerald Tech
    bg: 'rgba(21, 128, 61, 0.08)',
    border: 'rgba(21, 128, 61, 0.28)'
  }
};

// Smart fallback generator for commercial impact data
export function getProjectImpactData(project, isEnglish = false) {
  const t = `${project.title || ''} ${project.tags ? (Array.isArray(project.tags) ? project.tags.join(' ') : project.tags) : ''}`.toLowerCase();
  
  let commercialType = project.commercialType;
  let origin = isEnglish && project.origin_en ? project.origin_en : project.origin;
  let status = isEnglish && project.status_en ? project.status_en : project.status;
  let businessValue = isEnglish && project.businessValue_en ? project.businessValue_en : project.businessValue;

  // Infer if not explicitly populated
  if (!commercialType) {
    if (t.includes('erp') || t.includes('pos') || t.includes('ferreter') || t.includes('retail')) {
      commercialType = 'client';
    } else if (t.includes('herzberg') || t.includes('clima') || t.includes('people analytics') || t.includes('saas')) {
      commercialType = 'saas';
    } else {
      commercialType = 'research';
    }
  }

  const badgeConfig = COMMERCIAL_BADGES[commercialType] || COMMERCIAL_BADGES.research;

  if (!origin) {
    if (commercialType === 'client') {
      origin = isEnglish 
        ? 'Consultoría y desarrollo a medida para empresa del sector retail.'
        : 'Consultoría y desarrollo de software a medida para empresa del sector retail.';
    } else if (commercialType === 'saas') {
      origin = isEnglish
        ? 'Iniciativa propia de I+D aplicada a People Analytics y modelos de NLP / LLM.'
        : 'Iniciativa propia de I+D aplicada a People Analytics y modelos de NLP / LLM.';
    } else {
      origin = isEnglish
        ? 'Investigación aplicada y desarrollo en ciencia de datos e inteligencia artificial.'
        : 'Investigación aplicada y desarrollo en ciencia de datos e inteligencia artificial.';
    }
  }

  if (!status) {
    if (commercialType === 'client') {
      status = isEnglish
        ? 'Desplegado en producción • En operación activa continua'
        : 'Desplegado en producción • En operación activa continua';
    } else if (commercialType === 'saas') {
      status = isEnglish
        ? 'Plataforma funcional / Prototipo comercial en vivo'
        : 'Plataforma funcional / Prototipo comercial en vivo';
    } else {
      status = isEnglish
        ? 'Caso de estudio técnico documentado • Arquitectura validada'
        : 'Caso de estudio técnico documentado • Arquitectura validada';
    }
  }

  if (!businessValue) {
    if (commercialType === 'client') {
      businessValue = isEnglish
        ? 'Centralización de inventarios multitienda, facturación y control de caja, reduciendo mermas y tiempos de cobro.'
        : 'Centralización de inventarios multitienda, facturación y control de caja, reduciendo mermas y tiempos de cobro.';
    } else if (commercialType === 'saas') {
      businessValue = isEnglish
        ? 'Diagnóstico automatizado de clima laboral y cumplimiento de NOM-035 con reportes predictivos para directivos.'
        : 'Diagnóstico automatizado de clima laboral y cumplimiento de NOM-035 con reportes predictivos para directivos.';
    } else {
      businessValue = isEnglish
        ? 'Pipelines de Machine Learning validados con alta reproducibilidad y métricas de precisión demostrables.'
        : 'Pipelines de Machine Learning validados con alta reproducibilidad y métricas de precisión demostrables.';
    }
  }

  return {
    commercialType,
    badgeConfig,
    origin,
    status,
    businessValue
  };
}

// Commercial Badge Component
export function ProjectCommercialBadge({ project, isEnglish = false }) {
  const data = getProjectImpactData(project, isEnglish);
  const badge = data.badgeConfig;

  return (
    <span 
      className="mono" 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '999px',
        backgroundColor: badge.bg,
        border: `1px solid ${badge.border}`,
        color: badge.color,
        fontSize: '0.72rem',
        fontWeight: 600,
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap'
      }}
    >
      <span style={{
        display: 'inline-block',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: badge.color
      }} />
      {isEnglish ? badge.label_en : badge.label}
    </span>
  );
}

// 3-Line Compact Origin & Business Impact Box Component
export default function ProjectImpactBox({ project, isEnglish = false }) {
  const data = getProjectImpactData(project, isEnglish);

  return (
    <div className="project-impact-box">
      <div className="project-impact-grid">
        {/* Line 1: Origin */}
        <div className="project-impact-row">
          <span className="project-impact-label">
            <Building2 size={13} style={{ color: 'var(--color-sage)', flexShrink: 0 }} />
            <span>{isEnglish ? 'Origen:' : 'Origen:'}</span>
          </span>
          <span className="project-impact-val">{data.origin}</span>
        </div>

        {/* Line 2: Status */}
        <div className="project-impact-row">
          <span className="project-impact-label">
            <CheckCircle2 size={13} style={{ color: data.badgeConfig.color, flexShrink: 0 }} />
            <span>{isEnglish ? 'Estado:' : 'Estado:'}</span>
          </span>
          <span className="project-impact-val" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {data.status}
          </span>
        </div>

        {/* Line 3: Business Value */}
        <div className="project-impact-row">
          <span className="project-impact-label">
            <TrendingUp size={13} style={{ color: '#15803d', flexShrink: 0 }} />
            <span>{isEnglish ? 'Impacto:' : 'Valor de Negocio:'}</span>
          </span>
          <span className="project-impact-val">{data.businessValue}</span>
        </div>
      </div>
    </div>
  );
}
