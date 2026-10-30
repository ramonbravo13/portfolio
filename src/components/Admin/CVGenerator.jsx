import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { 
  FileText, Sparkles, Loader2, Send, CheckCircle2, RotateCcw, 
  Printer, Edit3, Trash2, Plus, Globe, 
  Briefcase, Award, Code, Check, Undo2, Eye, SlidersHorizontal
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Safe helper to extract and parse JSON from LLM output
function extractAndParseJSON(rawText) {
  let cleaned = rawText.trim();
  // Strip code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(cleaned);
  } catch (_err) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    }
    throw new Error('No se pudo procesar el formato de datos devuelto por la IA. Por favor, reintenta.');
  }
}

export default function CVGenerator() {
  const { profile, projects } = usePortfolio();
  
  // Step 1 Inputs
  const [jobDescription, setJobDescription] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  // Contact details for CV header (defaults with profile or customizable)
  const [contactInfo, setContactInfo] = useState({
    email: profile.contactEmail || 'ramonbravo13@gmail.com',
    phone: profile.contactPhone || '+52 33 1500 4877',
    location: 'Guadalajara, México',
    linkedin: 'www.linkedin.com/in/ramón-bravo'
  });

  // State Management
  const [step, setStep] = useState('input'); // 'input' | 'review' | 'final'
  const [proposalData, setProposalData] = useState(null); // Spanish approved/current proposal
  const [englishData, setEnglishData] = useState(null); // English translated version
  const [history, setHistory] = useState([]); // Undo history for proposals
  
  // UI Controls
  const [activeTab, setActiveTab] = useState('es'); // 'es' | 'en'
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'edit'
  const [feedbackInput, setFeedbackInput] = useState('');
  const [loadingAction, setLoadingAction] = useState(null); // 'initial' | 'refine' | 'translate' | 'print'
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Hidden print portal reference
  const cvPrintRef = useRef(null);
  const [printData, setPrintData] = useState(null);
  const [printLang, setPrintLang] = useState('es');

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  // Toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keep contact info synchronized when profile loads
  useEffect(() => {
    if (profile && profile.name !== 'Loading...') {
      setContactInfo(prev => ({
        ...prev,
        email: profile.contactEmail || prev.email,
        phone: profile.contactPhone || prev.phone
      }));
    }
  }, [profile]);

  // Model instance helper
  const getModel = () => {
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY no está configurada en el archivo .env');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash (with standard fallback)
    try {
      return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    } catch {
      return genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    }
  };

  // Compile full verified data from database to send to AI
  const getVerifiedDataToSend = () => ({
    candidate: {
      name: profile.name || 'Juan Ramón Bravo López',
      title: profile.title || 'Software Engineer & Data Scientist',
      bio: profile.bio || '',
      skills: profile.skills || []
    },
    experiences: (profile.experiences || []).flatMap(exp => {
      if (exp.roles && exp.roles.length > 0) {
        return exp.roles.map(r => ({
          company: exp.company,
          role: r.role,
          period: r.period,
          tag: r.tag,
          desc: r.desc
        }));
      }
      return [{
        role: exp.role,
        company: exp.company,
        period: exp.period,
        tag: exp.tag,
        desc: exp.desc
      }];
    }),
    projects: (projects || []).map(p => ({
      title: p.title,
      tags: p.tags,
      problem: p.problem,
      solution: p.solution,
      result: p.result
    })),
    education: (profile.education || []).map(e => ({
      type: e.type,
      title: e.title,
      institution: e.institution,
      period: e.period,
      status: e.status,
      desc: e.desc,
      tags: e.tags
    })),
    certifications: (profile.certs || []).map(c => ({
      title: c.title,
      desc: c.desc,
      tags: c.tags
    }))
  });

  const basePromptRules = `
REGLAS ESTRICTAS DE GENERACIÓN (OBLIGATORIAS):
1. NO INVENTAR DATOS: No inventes años de experiencia, puestos, métricas cuantitativas inventadas (ej. "40% improvement", "zero failures"), resultados financieros, ni tecnologías que no estén explícitamente en los datos provistos. Si no hay métrica numérica verificable, describe el impacto cualitativamente con precisión profesional.
2. POSICIONAMIENTO PROFESIONAL: El objetivo principal es "Data Analyst / Junior Data Scientist". Convierte el background (Ingeniería, Maestría, Management) y los proyectos prácticos en una fortaleza competitiva. No satures el perfil solo con "Data Operations" o "QA".
3. CARGOS REALES: Usa exactamente los títulos de los cargos provistos (ej. "Campus Director"). NUNCA los cambies a "Head of Data Operations" o inventos similares. Destaca responsabilidades de análisis de datos, reporting, optimización de procesos y automatización dentro de esos roles reales, sin inventar que era un puesto 100% de Data.
4. HEADLINE: Usa un headline honesto, potente y competitivo como "DATA ANALYST | DATA SCIENCE & AI", "DATA ANALYST | DATA SCIENCE & AI ENGINEERING" o similar adaptado a la vacante.
5. PROYECTOS (CRÍTICO): Describe los proyectos técnicamente. 
   - Para el proyecto "Herzberg": Enfatiza análisis de datos, NLP/LLM, dashboards, automatización y AI aplicada a toma de decisiones. No lo limites a simples encuestas.
   - Para el proyecto "ERP / POS": Enfatiza Python, bases de datos relacionales, procesamiento transaccional, integridad de datos (usa "data integrity" o "transaction consistency", NO uses "data leakage"), validación y automatización.
6. HABILIDADES (SKILLS): Agrupa o lista lógicamente las tecnologías reales del candidato (Programming, Data Analysis, Machine Learning / AI, BI / Dashboards, Databases, Tools). Prioriza las que hagan match con la vacante.
7. EDUCACIÓN Y CERTIFICACIONES: Diferencia claramente títulos académicos de certificaciones o cursos.
8. METODOLOGÍA STAR: En cada experiencia laboral, redacta entre 2 y 4 viñetas (bullets) en formato STAR concisas (Situación, Tarea, Acción, Resultado), evitando prefijos basura como "+. Situation/Task".
`;

  // 1. GENERATE INITIAL PROPOSAL (ESPAÑOL)
  const handleGenerateProposal = async () => {
    setError(null);
    setLoadingAction('initial');
    try {
      const model = getModel();
      const verifiedData = getVerifiedDataToSend();

      const prompt = `
Actúa como un reclutador Tech senior y redactor experto de CVs para roles de Ciencia de Datos, Análisis e IA.
Tengo los siguientes datos reales y verificados de mi perfil:
${JSON.stringify(verifiedData, null, 2)}

---
DESCRIPCIÓN DE LA VACANTE O PUESTO OBJETIVO:
${jobDescription.trim() ? jobDescription : 'No se especificó vacante particular. Enfocar a Data Analyst / Junior Data Scientist.'}

---
INSTRUCCIONES O ENFOQUE ADICIONAL DEL CANDIDATO:
${customInstructions.trim() ? customInstructions : 'Alinear el perfil de manera óptima para maximizar la relevancia.'}

---
${basePromptRules}

TU TAREA:
Genera una propuesta inicial de CV en ESPAÑOL formal y profesional que destaque el perfil frente a esta vacante sin mentir ni inventar datos.
1. Selecciona y redacta un titular (headline) potente.
2. Escribe un resumen ejecutivo contundente (3 a 5 líneas) adaptado a la vacante.
3. Organiza las habilidades técnicas clave que domina el candidato y que solicita la vacante.
4. Redacta las experiencias laborales más relevantes con metodología STAR enfocadas en datos, impacto y automatización.
5. Selecciona los 3 o 4 proyectos clave más relevantes con sus tecnologías.
6. Incluye las certificaciones destacadas.

Devuelve ÚNICAMENTE un objeto JSON válido con este formato exacto:
{
  "nombre": "${profile.name || 'Juan Ramón Bravo López'}",
  "titulo": "DATA ANALYST | DATA SCIENCE & AI",
  "contacto": {
    "email": "${contactInfo.email}",
    "telefono": "${contactInfo.phone}",
    "ubicacion": "${contactInfo.location}",
    "linkedin": "${contactInfo.linkedin}"
  },
  "resumen_ejecutivo": "Texto del resumen profesional...",
  "skills": ["Python", "SQL", "Pandas", "Machine Learning", "Tableau / Power BI", "Bases de Datos"],
  "experiencias": [
    {
      "empresa": "Nombre Empresa",
      "rol": "Cargo real",
      "periodo": "Periodo",
      "descripcion": [
        "Punto STAR 1...",
        "Punto STAR 2..."
      ]
    }
  ],
  "proyectos_clave": [
    {
      "titulo": "Nombre Proyecto",
      "descripcion": "Descripción del valor, problema y solución...",
      "tecnologias": ["Python", "Pandas", "NLP"]
    }
  ],
  "certificaciones": [
    {
      "titulo": "Nombre Certificación",
      "descripcion": "Detalle / Emisor"
    }
  ]
}
NO agregues explicaciones fuera del JSON. Devuelve exclusivamente JSON válido.
`;

      const result = await model.generateContent(prompt);
      const parsed = extractAndParseJSON(result.response.text());

      // Save and advance to Step 2 (Review)
      setProposalData(parsed);
      setHistory([]);
      setEnglishData(null); // Reset english data if new proposal
      setActiveTab('es');
      setStep('review');
      showToast('¡Propuesta inicial de CV generada con éxito!');
    } catch (err) {
      console.error('Error generando propuesta:', err);
      setError(err.message || 'Error al generar la propuesta de CV.');
    } finally {
      setLoadingAction(null);
    }
  };

  // 2. SUGGEST CHANGES / REFINE PROPOSAL WITH AI
  const handleRefineProposal = async (suggestedText = null) => {
    const feedbackToUse = (suggestedText || feedbackInput).trim();
    if (!feedbackToUse) return;

    setError(null);
    setLoadingAction('refine');
    try {
      const model = getModel();
      const verifiedData = getVerifiedDataToSend();

      const prompt = `
Actúa como un reclutador Tech senior y redactor de CVs.
El usuario está revisando la propuesta actual de su CV y ha solicitado modificaciones específicas.

---
DATOS VERIFICADOS DEL CANDIDATO (ORIGINALES):
${JSON.stringify(verifiedData, null, 2)}

---
DESCRIPCIÓN DE LA VACANTE OBJETIVO:
${jobDescription.trim() ? jobDescription : 'Data Analyst / Data Scientist'}

---
PROPUESTA ACTUAL DE CV (ESPAÑOL):
${JSON.stringify(proposalData, null, 2)}

---
CAMBIOS O SUGERENCIAS SOLICITADAS POR EL USUARIO:
"${feedbackToUse}"

---
${basePromptRules}

TU TAREA:
Aplica rigurosamente los cambios pedidos por el usuario a la propuesta actual de CV.
- Si el usuario pide cambiar el tono, hazlo más conciso, técnico o de liderazgo según lo indique.
- Si pide ajustar un resumen, experiencias o proyectos específicos, actualízalos respetando los datos reales provistos.
- Asegúrate de que el documento completo siga siendo coherente, fluido y profesional.
- Devuelve ÚNICAMENTE el objeto JSON actualizado con la misma estructura (nombre, titulo, contacto, resumen_ejecutivo, skills, experiencias, proyectos_clave, certificaciones).
NO agregues texto fuera del JSON.
`;

      const result = await model.generateContent(prompt);
      const updated = extractAndParseJSON(result.response.text());

      // Push previous proposal to history for undo
      setHistory(prev => [proposalData, ...prev.slice(0, 4)]);
      setProposalData(updated);
      setEnglishData(null); // Invalidate english cache since source changed
      setFeedbackInput('');
      showToast('¡Cambios aplicados por la IA a la propuesta!');
    } catch (err) {
      console.error('Error refinando propuesta:', err);
      setError(err.message || 'Error al aplicar las sugerencias con la IA.');
    } finally {
      setLoadingAction(null);
    }
  };

  // Undo last AI suggestion change
  const handleUndo = () => {
    if (history.length === 0) return;
    const [previous, ...rest] = history;
    setProposalData(previous);
    setHistory(rest);
    setEnglishData(null);
    showToast('Se restableció la versión anterior.');
  };

  // 3. TRANSLATE & LOCALIZE PROPOSAL TO ENGLISH (RESUME)
  const handleTranslateToEnglish = async () => {
    if (!proposalData) return;
    setError(null);
    setLoadingAction('translate');
    try {
      const model = getModel();

      const prompt = `
You are a senior bilingual Tech Recruiter and Executive Resume Writer specializing in the US and global tech markets.
Your task is to translate and professionally localize the following approved Spanish CV into flawless, high-impact American English resume format.

---
APPROVED CV IN SPANISH:
${JSON.stringify(proposalData, null, 2)}

---
TARGET VACANCY:
${jobDescription.trim() ? jobDescription : 'Data Analyst / Junior Data Scientist'}

---
STRICT TRANSLATION AND LOCALIZATION RULES:
1. STRICT FIDELITY: Do NOT invent new jobs, years, certifications or artificial metrics. Maintain total truthfulness to the approved Spanish CV.
2. EXECUTIVE US RESUME TONE: Use punchy action verbs (e.g., Engineered, Spearheaded, Built, Optimized, Deployed, Automated, Analyzed).
3. TERMINOLOGY: Use standard tech/data industry vocabulary (Data Integrity, Transactional Processing, Predictive Modeling, Machine Learning Pipelines).
4. ACCURACY: Write "AI" (capital A, capital I) and NEVER "Al" (lowercase L).
5. TRANSLATE ALL VALUES: Translate headline, summary, skills, experience descriptions, project descriptions, and certifications.

Return ONLY the valid JSON object with the exact same structure in English. Do not add markdown or introductory text.
`;

      const result = await model.generateContent(prompt);
      const translated = extractAndParseJSON(result.response.text());
      setEnglishData(translated);
      setActiveTab('en');
      showToast('¡Versión en Inglés adaptada exitosamente!');
    } catch (err) {
      console.error('Error traduciendo CV:', err);
      setError(err.message || 'Error al traducir el CV al inglés.');
    } finally {
      setLoadingAction(null);
    }
  };

  // 4. PRINT / EXPORT PDF
  const handlePrint = async (lang = 'es') => {
    setLoadingAction('print');
    setPrintLang(lang);

    let dataToPrint = lang === 'en' ? englishData : proposalData;

    // If printing English and it doesn't exist yet, generate it first
    if (lang === 'en' && !dataToPrint) {
      try {
        const model = getModel();
        const prompt = `
You are a senior bilingual Tech Recruiter and Executive Resume Writer.
Translate and professionally localize the following approved Spanish CV into flawless, high-impact American English resume format:
${JSON.stringify(proposalData, null, 2)}

Return ONLY the valid JSON object in English. No explanations.
`;
        const result = await model.generateContent(prompt);
        dataToPrint = extractAndParseJSON(result.response.text());
        setEnglishData(dataToPrint);
      } catch (err) {
        setError('Error al generar la versión en inglés antes de imprimir: ' + err.message);
        setLoadingAction(null);
        return;
      }
    }

    setPrintData(dataToPrint);

    // Give React time to render the portal into #cv-print-area
    setTimeout(() => {
      setLoadingAction(null);
      window.print();
    }, 450);
  };

  // Direct manual editing helpers for proposalData
  const updateProposalField = (field, value) => {
    setProposalData(prev => ({ ...prev, [field]: value }));
    setEnglishData(null); // invalidate translation if edited manually
  };

  const updateExperienceBullet = (expIndex, bulletIndex, value) => {
    setProposalData(prev => {
      const newExps = [...prev.experiencias];
      const newDesc = [...newExps[expIndex].descripcion];
      newDesc[bulletIndex] = value;
      newExps[expIndex] = { ...newExps[expIndex], descripcion: newDesc };
      return { ...prev, experiencias: newExps };
    });
    setEnglishData(null);
  };

  const addExperienceBullet = (expIndex) => {
    setProposalData(prev => {
      const newExps = [...prev.experiencias];
      const newDesc = [...newExps[expIndex].descripcion, 'Nuevo logro o responsabilidad con metodología STAR...'];
      newExps[expIndex] = { ...newExps[expIndex], descripcion: newDesc };
      return { ...prev, experiencias: newExps };
    });
    setEnglishData(null);
  };

  const removeExperienceBullet = (expIndex, bulletIndex) => {
    setProposalData(prev => {
      const newExps = [...prev.experiencias];
      const newDesc = newExps[expIndex].descripcion.filter((_, i) => i !== bulletIndex);
      newExps[expIndex] = { ...newExps[expIndex], descripcion: newDesc };
      return { ...prev, experiencias: newExps };
    });
    setEnglishData(null);
  };

  // Quick suggestion prompts
  const quickSuggestions = [
    'Hacer el resumen más orientado a impacto en negocio y liderazgo',
    'Hacer la redacción más concisa para que quepa en 1 página',
    'Resaltar más herramientas de Python, SQL y Dashboards',
    'Destacar el proyecto Herzberg con mayor énfasis en NLP y toma de decisiones'
  ];

  // Current active data being previewed in tab
  const currentViewData = activeTab === 'en' ? (englishData || proposalData) : proposalData;

  const sectionHeaders = {
    es: { skills: 'Habilidades Técnicas', experience: 'Experiencia Profesional', projects: 'Proyectos Clave', technologies: 'Tecnologías:', certifications: 'Certificaciones' },
    en: { skills: 'Technical Skills', experience: 'Professional Experience', projects: 'Key Projects', technologies: 'Technologies:', certifications: 'Certifications' }
  };
  const t = sectionHeaders[activeTab] || sectionHeaders.es;
  const printT = sectionHeaders[printLang] || sectionHeaders.es;

  return (
    <section className="admin-section" style={{ marginBottom: 'var(--spacing-2xl)' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'var(--color-voltage)',
          color: 'var(--color-ink)',
          padding: '0.75rem 1.25rem',
          borderRadius: '6px',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.25s ease'
        }}>
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <FileText className="section-icon" />
          <div>
            <h2 style={{ fontSize: '1.75rem', margin: 0 }}>Generador de CV con IA</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Crea propuestas de CV adaptadas a vacantes, afina el texto con la IA y exporta en Español e Inglés.
            </p>
          </div>
        </div>

        {/* Step indicator breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: 'var(--bg-glass)', padding: '6px 14px', borderRadius: '999px', border: '1px solid var(--border-light)' }}>
          <span style={{ fontWeight: 600, color: step === 'input' ? 'var(--color-voltage)' : 'var(--text-primary)' }}>1. Vacante</span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{ fontWeight: 600, color: step === 'review' ? 'var(--color-voltage)' : 'var(--text-secondary)' }}>2. Revisión y Ajustes</span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{ fontWeight: 600, color: proposalData ? 'var(--color-voltage)' : 'var(--text-secondary)' }}>3. Bilingüe & Descarga</span>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* ================= STEP 1: VACANCY & PARAMETERS ================= */}
      <div className="premium-card" style={{ backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border-light)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ fontSize: '1.15rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={18} color="var(--color-voltage)" />
            {proposalData ? 'Vacante e Instrucciones Utilizadas' : 'Paso 1: Descripción de la Vacante e Instrucciones'}
          </h3>
          {proposalData && (
            <button 
              onClick={() => setStep(step === 'input' ? 'review' : 'input')}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            >
              {step === 'input' ? 'Ocultar campos' : 'Modificar vacante / datos'}
            </button>
          )}
        </div>

        {(step === 'input' || !proposalData) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                <span>Descripción de la Vacante / Requisitos del Puesto</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>Copia y pega la oferta laboral</span>
              </label>
              <textarea 
                className="form-input" 
                style={{ minHeight: '130px', resize: 'vertical', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Pega aquí la descripción completa del puesto, responsabilidades, requisitos técnicos y habilidades deseadas..."
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                <span>Instrucciones o Enfoque Adicional (Opcional)</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)' }}>Indicaciones específicas</span>
              </label>
              <input 
                type="text"
                className="form-input" 
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Ej. Enfatizar Python y SQL, destacar el proyecto Herzberg, hacer énfasis en automatización..."
              />
            </div>

            {/* Editable Contact Info for CV */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-sm)' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Email de Contacto</label>
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ fontSize: '0.85rem' }}
                  value={contactInfo.email} 
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} 
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Teléfono</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ fontSize: '0.85rem' }}
                  value={contactInfo.phone} 
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })} 
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Ubicación</label>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ fontSize: '0.85rem' }}
                  value={contactInfo.location} 
                  onChange={(e) => setContactInfo({ ...contactInfo, location: e.target.value })} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-xs)' }}>
              <button 
                onClick={handleGenerateProposal} 
                disabled={loadingAction !== null}
                className="btn-primary" 
                style={{ minWidth: '240px', justifyContent: 'center' }}
              >
                {loadingAction === 'initial' ? (
                  <><Loader2 size={18} className="animate-spin" /> Analizando vacante y generando propuesta...</>
                ) : (
                  <><Sparkles size={18} /> {proposalData ? 'Regenerar Propuesta Inicial' : '✨ Generar Propuesta de CV con IA'}</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= STEP 2 & 3: PROPOSAL REVIEW, AI REFINEMENT & BILINGUAL EXPORT ================= */}
      {proposalData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          
          {/* AI FEEDBACK / SUGGESTION PANEL */}
          <div className="premium-card" style={{ 
            backgroundColor: 'rgba(43, 238, 75, 0.04)', 
            border: '1px solid rgba(43, 238, 75, 0.35)', 
            padding: 'var(--spacing-lg)', 
            borderRadius: 'var(--radius-md)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="var(--color-voltage)" />
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Sugerir Cambios a la IA</h3>
              </div>

              {history.length > 0 && (
                <button 
                  onClick={handleUndo} 
                  disabled={loadingAction !== null}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Undo2 size={14} /> Deshacer último cambio ({history.length})
                </button>
              )}
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
              Escribe qué quieres que la IA modifique o mejore en la propuesta. La IA actualizará el texto respetando los datos reales de tu perfil y la vacante.
            </p>

            {/* Quick chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 'var(--spacing-sm)' }}>
              {quickSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleRefineProposal(sug)}
                  disabled={loadingAction !== null}
                  style={{
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-primary)',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-voltage)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                >
                  + {sug}
                </button>
              ))}
            </div>

            {/* Feedback input bar */}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
              <input 
                type="text"
                className="form-input"
                style={{ flex: 1, margin: 0, padding: '0.75rem 1rem' }}
                placeholder="Ej. 'Haz el resumen más orientado a impacto cuantitativo', 'Quita tal proyecto y destaca más el ERP', 'Sé más breve'..."
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleRefineProposal();
                  }
                }}
                disabled={loadingAction !== null}
              />
              <button 
                onClick={() => handleRefineProposal()}
                disabled={loadingAction !== null || !feedbackInput.trim()}
                className="btn-primary"
                style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
              >
                {loadingAction === 'refine' ? (
                  <><Loader2 size={18} className="animate-spin" /> Aplicando cambios...</>
                ) : (
                  <><Send size={16} /> Aplicar con IA</>
                )}
              </button>
            </div>
          </div>

          {/* TAB & ACTION CONTROLS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
            
            {/* Language Tabs */}
            <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-glass)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <button
                onClick={() => setActiveTab('es')}
                style={{
                  background: activeTab === 'es' ? 'var(--color-voltage)' : 'transparent',
                  color: activeTab === 'es' ? 'var(--color-ink)' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🇪🇸 Español</span>
                {proposalData && <Check size={14} />}
              </button>

              <button
                onClick={() => {
                  if (!englishData) {
                    handleTranslateToEnglish();
                  } else {
                    setActiveTab('en');
                  }
                }}
                disabled={loadingAction === 'translate'}
                style={{
                  background: activeTab === 'en' ? '#3b82f6' : 'transparent',
                  color: activeTab === 'en' ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🇺🇸 Inglés (Resume)</span>
                {loadingAction === 'translate' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : englishData ? (
                  <Check size={14} />
                ) : (
                  <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>(Generar)</span>
                )}
              </button>
            </div>

            {/* View Mode Toggle (Preview vs Edit) & Print Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setViewMode(viewMode === 'preview' ? 'edit' : 'preview')}
                className="btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {viewMode === 'preview' ? <Edit3 size={16} /> : <Eye size={16} />}
                {viewMode === 'preview' ? 'Modo Edición Manual' : 'Previsualización Real'}
              </button>

              {/* Print in Spanish */}
              <button
                onClick={() => handlePrint('es')}
                disabled={loadingAction !== null}
                className="btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
              >
                <Printer size={16} /> Imprimir PDF (ES)
              </button>

              {/* Print in English */}
              <button
                onClick={() => handlePrint('en')}
                disabled={loadingAction !== null}
                className="btn-primary"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', backgroundColor: '#3b82f6', borderColor: '#3b82f6', color: '#fff' }}
              >
                {loadingAction === 'print' && printLang === 'en' ? (
                  <><Loader2 size={16} className="animate-spin" /> Preparando...</>
                ) : (
                  <><Printer size={16} /> Imprimir PDF (EN)</>
                )}
              </button>
            </div>
          </div>

          {/* EDIT MODE: Form fields to manually adjust anything */}
          {viewMode === 'edit' && activeTab === 'es' && (
            <div className="premium-card" style={{ backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border-light)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit3 size={18} color="var(--color-voltage)" /> Edición Manual de la Propuesta
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cualquier cambio aquí se reflejará al imprimir o previsualizar</span>
              </div>

              <div className="form-group">
                <label className="form-label">Titular Profesional / Headline</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={proposalData.titulo || ''} 
                  onChange={(e) => updateProposalField('titulo', e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resumen Ejecutivo</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  value={proposalData.resumen_ejecutivo || ''} 
                  onChange={(e) => updateProposalField('resumen_ejecutivo', e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Habilidades Técnicas (separadas por comas)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={(proposalData.skills || []).join(', ')} 
                  onChange={(e) => updateProposalField('skills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} 
                />
              </div>

              {/* Experiences */}
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Experiencia Laboral (Bullets STAR)</label>
                {(proposalData.experiencias || []).map((exp, expIdx) => (
                  <div key={expIdx} style={{ padding: 'var(--spacing-sm)', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', marginBottom: 'var(--spacing-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>
                      <span>{exp.rol} — {exp.empresa}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{exp.periodo}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(exp.descripcion || []).map((bullet, bIdx) => (
                        <div key={bIdx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--color-voltage)', paddingTop: '6px' }}>•</span>
                          <textarea
                            className="form-input"
                            rows="2"
                            style={{ margin: 0, fontSize: '0.85rem' }}
                            value={bullet}
                            onChange={(e) => updateExperienceBullet(expIdx, bIdx, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeExperienceBullet(expIdx, bIdx)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                            title="Eliminar bullet"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addExperienceBullet(expIdx)}
                        className="btn-secondary"
                        style={{ alignSelf: 'flex-start', padding: '2px 8px', fontSize: '0.75rem', marginTop: '4px' }}
                      >
                        <Plus size={14} /> Agregar punto STAR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DOCUMENT PREVIEW CONTAINER (Realistic A4 Canvas) */}
          <div style={{
            background: '#33373b',
            padding: '2rem 1rem',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.4)',
            overflowX: 'auto'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '210mm',
              minHeight: '297mm',
              margin: '0 auto',
              backgroundColor: '#ffffff',
              color: '#111111',
              fontFamily: '"Inter", sans-serif',
              fontSize: '10pt',
              lineHeight: 1.5,
              padding: '18mm 18mm',
              boxSizing: 'border-box',
              borderRadius: '2px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}>
              
              {/* CV Header */}
              <header style={{ borderBottom: '2px solid #222', paddingBottom: '12pt', marginBottom: '14pt' }}>
                <h1 style={{ fontSize: '22pt', margin: '0 0 4pt 0', color: '#000', textTransform: 'uppercase', letterSpacing: '-0.02em', fontWeight: 700 }}>
                  {currentViewData.nombre || profile.name}
                </h1>
                <h2 style={{ fontSize: '12pt', margin: 0, color: '#333', fontWeight: 600, letterSpacing: '0.02em' }}>
                  {currentViewData.titulo}
                </h2>
                <div style={{ marginTop: '8pt', fontSize: '8.5pt', color: '#555', display: 'flex', gap: '14pt', flexWrap: 'wrap' }}>
                  {currentViewData.contacto?.email && <span>✉ {currentViewData.contacto.email}</span>}
                  {currentViewData.contacto?.telefono && <span>📞 {currentViewData.contacto.telefono}</span>}
                  {currentViewData.contacto?.ubicacion && <span>📍 {currentViewData.contacto.ubicacion}</span>}
                  {currentViewData.contacto?.linkedin && <span>🔗 {currentViewData.contacto.linkedin}</span>}
                </div>
              </header>

              {/* Executive Summary */}
              {currentViewData.resumen_ejecutivo && (
                <section style={{ marginBottom: '14pt' }}>
                  <p style={{ margin: 0, textAlign: 'justify', color: '#222' }}>
                    {currentViewData.resumen_ejecutivo}
                  </p>
                </section>
              )}

              {/* Skills */}
              {currentViewData.skills && currentViewData.skills.length > 0 && (
                <section style={{ marginBottom: '14pt' }}>
                  <h3 style={{ fontSize: '11pt', margin: '0 0 6pt 0', borderBottom: '1px solid #ddd', paddingBottom: '3pt', textTransform: 'uppercase', fontWeight: 700, color: '#111' }}>
                    {t.skills}
                  </h3>
                  <p style={{ margin: 0, lineHeight: 1.6, color: '#222' }}>
                    {currentViewData.skills.join(' • ')}
                  </p>
                </section>
              )}

              {/* Experience */}
              {currentViewData.experiencias && currentViewData.experiencias.length > 0 && (
                <section style={{ marginBottom: '14pt' }}>
                  <h3 style={{ fontSize: '11pt', margin: '0 0 8pt 0', borderBottom: '1px solid #ddd', paddingBottom: '3pt', textTransform: 'uppercase', fontWeight: 700, color: '#111' }}>
                    {t.experience}
                  </h3>
                  {currentViewData.experiencias.map((exp, idx) => (
                    <div key={idx} style={{ marginBottom: '10pt' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2pt' }}>
                        <strong style={{ fontSize: '10.5pt', color: '#000' }}>{exp.rol}</strong>
                        <span style={{ fontSize: '9pt', color: '#666', whiteSpace: 'nowrap' }}>{exp.periodo}</span>
                      </div>
                      <div style={{ fontWeight: 600, marginBottom: '4pt', fontSize: '9.5pt', color: '#444' }}>
                        {exp.empresa}
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '16pt', textAlign: 'justify', color: '#222' }}>
                        {(exp.descripcion || []).map((bullet, bIdx) => (
                          <li key={bIdx} style={{ marginBottom: '3pt' }}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </section>
              )}

              {/* Key Projects */}
              {currentViewData.proyectos_clave && currentViewData.proyectos_clave.length > 0 && (
                <section style={{ marginBottom: '14pt' }}>
                  <h3 style={{ fontSize: '11pt', margin: '0 0 8pt 0', borderBottom: '1px solid #ddd', paddingBottom: '3pt', textTransform: 'uppercase', fontWeight: 700, color: '#111' }}>
                    {t.projects}
                  </h3>
                  {currentViewData.proyectos_clave.map((proj, idx) => (
                    <div key={idx} style={{ marginBottom: '8pt' }}>
                      <strong style={{ fontSize: '10.5pt', display: 'block', marginBottom: '2pt', color: '#000' }}>
                        {proj.titulo}
                      </strong>
                      <p style={{ margin: '0 0 2pt 0', textAlign: 'justify', color: '#222' }}>
                        {proj.descripcion}
                      </p>
                      {proj.tecnologias && proj.tecnologias.length > 0 && (
                        <div style={{ fontSize: '8.5pt', color: '#555' }}>
                          <strong>{t.technologies}</strong> {proj.tecnologias.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {/* Certifications */}
              {currentViewData.certificaciones && currentViewData.certificaciones.length > 0 && (
                <section>
                  <h3 style={{ fontSize: '11pt', margin: '0 0 6pt 0', borderBottom: '1px solid #ddd', paddingBottom: '3pt', textTransform: 'uppercase', fontWeight: 700, color: '#111' }}>
                    {t.certifications}
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '16pt', color: '#222' }}>
                    {currentViewData.certificaciones.map((cert, idx) => (
                      <li key={idx} style={{ marginBottom: '3pt' }}>
                        <strong style={{ color: '#000' }}>{cert.titulo}</strong> {cert.descripcion ? `— ${cert.descripcion}` : ''}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

            </div>
          </div>

        </div>
      )}

      {/* ================= HIDDEN PRINT PORTAL FOR NATIVE HIGH-RES PDF ================= */}
      {printData && createPortal(
        <div id="cv-print-area">
          <div ref={cvPrintRef} style={{ 
            width: '100%', 
            maxWidth: '210mm',
            margin: '0 auto',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff', 
            color: '#111111', 
            fontFamily: '"Inter", sans-serif', 
            fontSize: '9.5pt', 
            lineHeight: 1.5,
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            padding: '12mm 15mm'
          }}>
            {/* Header */}
            <header style={{ borderBottom: '2px solid #222', paddingBottom: '10pt', marginBottom: '14pt', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <h1 style={{ fontSize: '22pt', margin: '0 0 4pt 0', color: '#000', textTransform: 'uppercase', fontWeight: 700 }}>
                {printData.nombre || profile.name}
              </h1>
              <h2 style={{ fontSize: '12pt', margin: 0, color: '#333', fontWeight: 600 }}>
                {printData.titulo}
              </h2>
              <div style={{ marginTop: '6pt', fontSize: '8.5pt', color: '#555', display: 'flex', gap: '14pt' }}>
                {printData.contacto?.email && <span>✉ {printData.contacto.email}</span>}
                {printData.contacto?.telefono && <span>📞 {printData.contacto.telefono}</span>}
                {printData.contacto?.ubicacion && <span>📍 {printData.contacto.ubicacion}</span>}
                {printData.contacto?.linkedin && <span>🔗 {printData.contacto.linkedin}</span>}
              </div>
            </header>

            {/* Resumen */}
            {printData.resumen_ejecutivo && (
              <section style={{ marginBottom: '14pt', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <p style={{ margin: 0, textAlign: 'justify', color: '#222' }}>{printData.resumen_ejecutivo}</p>
              </section>
            )}

            {/* Skills */}
            {printData.skills && printData.skills.length > 0 && (
              <section style={{ marginBottom: '14pt', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <h3 style={{ fontSize: '11pt', margin: '0 0 6pt 0', borderBottom: '1px solid #ccc', paddingBottom: '3pt', textTransform: 'uppercase', fontWeight: 700, pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
                  {printT.skills}
                </h3>
                <p style={{ margin: 0, lineHeight: 1.6, color: '#222' }}>{printData.skills.join(' • ')}</p>
              </section>
            )}

            {/* Experiencia */}
            {printData.experiencias && printData.experiencias.length > 0 && (
              <section style={{ marginBottom: '14pt' }}>
                <h3 style={{ fontSize: '11pt', margin: '0 0 8pt 0', borderBottom: '1px solid #ccc', paddingBottom: '3pt', textTransform: 'uppercase', fontWeight: 700, pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
                  {printT.experience}
                </h3>
                {printData.experiencias.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: '10pt', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2pt' }}>
                      <strong style={{ fontSize: '10.5pt', color: '#000' }}>{exp.rol}</strong>
                      <span style={{ fontSize: '8.5pt', color: '#666', whiteSpace: 'nowrap' }}>{exp.periodo}</span>
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: '4pt', fontSize: '9.5pt', color: '#333' }}>{exp.empresa}</div>
                    <ul style={{ margin: 0, paddingLeft: '16pt', textAlign: 'justify', color: '#222' }}>
                      {(exp.descripcion || []).map((punto, pIdx) => (
                        <li key={pIdx} style={{ marginBottom: '3pt' }}>{punto}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            {/* Proyectos Clave */}
            {printData.proyectos_clave && printData.proyectos_clave.length > 0 && (
              <section style={{ marginBottom: '14pt' }}>
                <h3 style={{ fontSize: '11pt', margin: '0 0 8pt 0', borderBottom: '1px solid #ccc', paddingBottom: '3pt', textTransform: 'uppercase', fontWeight: 700, pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
                  {printT.projects}
                </h3>
                {printData.proyectos_clave.map((proj, idx) => (
                  <div key={idx} style={{ marginBottom: '8pt', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <strong style={{ fontSize: '10.5pt', display: 'block', marginBottom: '2pt', color: '#000' }}>{proj.titulo}</strong>
                    <p style={{ margin: '0 0 2pt 0', textAlign: 'justify', color: '#222' }}>{proj.descripcion}</p>
                    {proj.tecnologias && proj.tecnologias.length > 0 && (
                      <div style={{ fontSize: '8.5pt', color: '#555' }}>
                        <strong>{printT.technologies}</strong> {proj.tecnologias.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {/* Certificaciones */}
            {printData.certificaciones && printData.certificaciones.length > 0 && (
              <section style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <h3 style={{ fontSize: '11pt', margin: '0 0 6pt 0', borderBottom: '1px solid #ccc', paddingBottom: '3pt', textTransform: 'uppercase', fontWeight: 700, pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>
                  {printT.certifications}
                </h3>
                <ul style={{ margin: 0, paddingLeft: '16pt', color: '#222' }}>
                  {printData.certificaciones.map((cert, idx) => (
                    <li key={idx} style={{ marginBottom: '3pt', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <strong style={{ color: '#000' }}>{cert.titulo}</strong> {cert.descripcion ? `— ${cert.descripcion}` : ''}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
