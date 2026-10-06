import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { FileText, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function CVGenerator() {
  const { profile, projects } = usePortfolio();
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cvRef = useRef(null);
  const [generatedData, setGeneratedData] = useState(null);
  const [currentLang, setCurrentLang] = useState('es');

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''; // Assuming the user has a GEMINI_API_KEY env var

  const handleGenerate = async (lang = 'es') => {
    setCurrentLang(lang);
    if (!apiKey) {
      setError('VITE_GEMINI_API_KEY no está configurada en las variables de entorno.');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedData(null);

    try {
      const dataToSend = {
        profile: {
          name: profile.name,
          title: profile.title,
          bio: profile.bio,
          skills: profile.skills
        },
        experiences: profile.experiences || [],
        projects: projects.map(p => ({
          title: p.title,
          tags: p.tags,
          problem: p.problem,
          solution: p.solution,
          result: p.result
        })),
        certifications: profile.certs || []
      };

      const langInstructions = lang === 'en'
        ? "MUST BE WRITTEN IN FLAWLESS, PROFESSIONAL ENGLISH. Use perfect grammar, appropriate technical terminology for Data Science/AI, and impeccable phrasing. Translate EVERYTHING (titles, descriptions, roles, etc.) to English."
        : "Debe estar escrito en ESPAÑOL profesional y formal, cuidando la ortografía, la gramática y usando una excelente redacción.";

      const basePromptRules = `
REGLAS ESTRICTAS DE GENERACIÓN (OBLIGATORIAS):
1. NO INVENTAR DATOS: No inventes años de experiencia, puestos, métricas (ej. "40% improvement", "zero failures"), resultados financieros, ni tecnologías que no estén explícitamente en los datos provistos. Si no hay métrica verificable, describe el impacto cualitativamente.
2. POSICIONAMIENTO PROFESIONAL: El objetivo es "Data Analyst / Junior Data Scientist". Convierte el background (Ingeniería, Maestría, Management) y los proyectos prácticos en una fortaleza competitiva. No satures el perfil solo con "Data Operations" o "QA".
3. CARGOS REALES: Usa exactamente los títulos de los cargos provistos (ej. "Campus Director"). NUNCA los cambies a "Head of Data Operations" o similares. Destaca responsabilidades de análisis de datos, reporting y automatización dentro de esos roles reales, sin inventar que era un puesto 100% de Data.
4. HEADLINE: Usa un headline como "DATA ANALYST | DATA SCIENCE & AI", "DATA ANALYST | DATA SCIENCE & AI ENGINEERING" o similar, honesto pero competitivo.
5. PROYECTOS (CRÍTICO): Describe los proyectos técnicamente. 
   - Para el proyecto "Herzberg": Enfatiza análisis de datos, NLP/LLM, dashboards, automatización y AI aplicada a toma de decisiones. No lo limites a "encuestas".
   - Para el proyecto "ERP / POS": Enfatiza Python, bases de datos, procesamiento transaccional, integridad de datos (usa "data integrity" o "transaction consistency", NO uses "data leakage"), validación y automatización.
6. HABILIDADES (SKILLS): Agrupa lógicamente (ej. Programming, Data, Machine Learning / AI, BI / Visualization, Databases, Tools). Solo incluye las mencionadas, no inventes para rellenar.
7. EDUCACIÓN Y CERTIFICACIONES: Diferencia claramente títulos académicos de certificaciones o cursos.
8. IDIOMA Y ESTILO: Si es en inglés, usa inglés profesional pero natural (Built, Developed, Analyzed). Asegúrate de escribir "AI" (Inteligencia Artificial) correctamente y NO "Al" (con L minúscula). Evita prefijos basura como "+. Situation/Task".
`;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      const prompt = `
Actúa como un experto reclutador Tech y redactor de CVs para Roles de Ciencia de Datos e IA.
Tengo los siguientes datos de mi perfil extraídos de mi base de datos:
${JSON.stringify(dataToSend, null, 2)}

Instrucciones o vacante objetivo:
${instructions}

Regla de Idioma: ${langInstructions}

${basePromptRules}

Tu tarea:
1. Filtra y selecciona los 3 o 4 proyectos y certificaciones más relevantes para esta vacante o enfoque.
2. Reescribe los puntos de la experiencia laboral usando la metodología STAR (Situación, Tarea, Acción, Resultado) de manera sintética y con métricas de impacto.
3. Genera un JSON estructurado de salida con las claves: \`nombre\`, \`titulo\`, \`resumen_ejecutivo\`, \`experiencias\` (array con \`empresa\`, \`rol\`, \`periodo\`, \`descripcion\`(array de strings STAR)), \`proyectos_clave\` (array con \`titulo\`, \`descripcion\`, \`tecnologias\` (array)), \`certificaciones\` (array con \`titulo\`, \`descripcion\`), \`skills\` (array).
Asegúrate de que TODOS los valores en el JSON generado estén completamente en el idioma solicitado (${lang === 'en' ? 'Inglés' : 'Español'}).
4. Devuelve ÚNICAMENTE el código JSON válido sin ningún texto explicativo o formato Markdown extra. NO incluyas bloques de código \`\`\`json.
`;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text();
      
      // Clean up if the model wrapped it in markdown
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/```json\n?/, '').replace(/```$/, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/```\n?/, '').replace(/```$/, '');
      }

      const cvData = JSON.parse(responseText.trim());
      setGeneratedData(cvData);

      // Wait for React to render the hidden template
      setTimeout(() => {
        generatePDF(lang);
      }, 500);

    } catch (err) {
      console.error('Error generating CV:', err);
      setError(err.message || 'Ocurrió un error al generar el CV.');
      setLoading(false);
    }
  };

  const generatePDF = (lang) => {
    // Rely on native browser printing for true vector, selectable, high-quality text PDF.
    setLoading(false);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const headers = {
    es: { skills: 'Habilidades Técnicas', experience: 'Experiencia Profesional', projects: 'Proyectos Clave', technologies: 'Tecnologías:', certifications: 'Certificaciones' },
    en: { skills: 'Technical Skills', experience: 'Professional Experience', projects: 'Key Projects', technologies: 'Technologies:', certifications: 'Certifications' }
  };
  const t = headers[currentLang];

  return (
    <section className="admin-section" style={{ marginBottom: 'var(--spacing-2xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
        <FileText className="section-icon" />
        <h2 style={{ fontSize: '2rem', margin: 0 }}>Generador de CV con IA</h2>
      </div>

      <div className="premium-card" style={{ borderTop: 'none', borderBottom: 'none', backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border-light)', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)' }}>
        
        <div className="form-group">
          <label className="form-label">Instrucciones o Descripción de la Vacante (Opcional)</label>
          <textarea 
            className="form-input" 
            style={{ minHeight: '120px', resize: 'vertical' }}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Ej. Enfocar más en Machine Learning y Python. O pega aquí la descripción del puesto al que aplicas..."
          />
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '4px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
          <button 
            onClick={() => handleGenerate('es')} 
            disabled={loading}
            className="btn-primary" 
            style={{ flex: '1 1 auto', justifyContent: 'center', minWidth: '200px' }}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Procesando...</>
            ) : (
              <><Sparkles size={18} /> Generar CV en Español</>
            )}
          </button>

          <button 
            onClick={() => handleGenerate('en')} 
            disabled={loading}
            className="btn-primary" 
            style={{ flex: '1 1 auto', justifyContent: 'center', backgroundColor: '#3b82f6', borderColor: '#3b82f6', color: '#fff', minWidth: '200px' }}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Processing...</>
            ) : (
              <><Sparkles size={18} /> Generar CV en Inglés</>
            )}
          </button>
        </div>
      </div>

      {/* Hidden CV Template for Native Printing via Portal */}
      {generatedData && createPortal(
        <div id="cv-print-area">
          <div ref={cvRef} style={{ 
            width: '100%', 
            maxWidth: '210mm',
            margin: '0 auto',
            boxSizing: 'border-box',
            backgroundColor: '#fff', 
            color: '#111', 
            fontFamily: '"Inter", sans-serif', 
            fontSize: '10pt', 
            lineHeight: 1.5,
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
            
            {/* Header */}
            <header style={{ borderBottom: '2px solid #222', paddingBottom: '12pt', marginBottom: '16pt', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <h1 style={{ fontSize: '24pt', margin: '0 0 4pt 0', color: '#000', textTransform: 'uppercase' }}>{generatedData.nombre}</h1>
              <h2 style={{ fontSize: '13pt', margin: 0, color: '#444', fontWeight: 500 }}>{generatedData.titulo}</h2>
              <div style={{ marginTop: '8pt', fontSize: '9pt', color: '#666', display: 'flex', gap: '15pt' }}>
                {profile.contactEmail && <span>{profile.contactEmail}</span>}
                {profile.contactPhone && <span>{profile.contactPhone}</span>}
              </div>
            </header>

            {/* Resumen */}
            {generatedData.resumen_ejecutivo && (
              <section style={{ marginBottom: '16pt', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <p style={{ margin: 0, textAlign: 'justify' }}>{generatedData.resumen_ejecutivo}</p>
              </section>
            )}

            {/* Skills */}
            {generatedData.skills && generatedData.skills.length > 0 && (
              <section style={{ marginBottom: '16pt', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <h3 style={{ fontSize: '12pt', margin: '0 0 8pt 0', borderBottom: '1px solid #ccc', paddingBottom: '4pt', textTransform: 'uppercase', pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>{t.skills}</h3>
                <p style={{ margin: 0, lineHeight: 1.6 }}>{generatedData.skills.join(', ')}</p>
              </section>
            )}

            {/* Experiencia */}
            {generatedData.experiencias && generatedData.experiencias.length > 0 && (
              <section style={{ marginBottom: '16pt' }}>
                <h3 style={{ fontSize: '12pt', margin: '0 0 8pt 0', borderBottom: '1px solid #ccc', paddingBottom: '4pt', textTransform: 'uppercase', pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>{t.experience}</h3>
                {generatedData.experiencias.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: '12pt', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4pt' }}>
                      <strong style={{ fontSize: '11pt', color: '#000' }}>{exp.rol}</strong>
                      <span style={{ fontSize: '9.5pt', color: '#666', whiteSpace: 'nowrap' }}>{exp.periodo}</span>
                    </div>
                    <div style={{ fontWeight: 500, marginBottom: '4pt', fontSize: '10pt', color: '#333' }}>{exp.empresa}</div>
                    <ul style={{ margin: 0, paddingLeft: '18pt', textAlign: 'justify' }}>
                      {(exp.descripcion || []).map((punto, pIdx) => (
                        <li key={pIdx} style={{ marginBottom: '4pt', paddingLeft: '2pt' }}>{punto}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            {/* Proyectos Clave */}
            {generatedData.proyectos_clave && generatedData.proyectos_clave.length > 0 && (
              <section style={{ marginBottom: '16pt' }}>
                <h3 style={{ fontSize: '12pt', margin: '0 0 8pt 0', borderBottom: '1px solid #ccc', paddingBottom: '4pt', textTransform: 'uppercase', pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>{t.projects}</h3>
                {generatedData.proyectos_clave.map((proj, idx) => (
                  <div key={idx} style={{ marginBottom: '10pt', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <strong style={{ fontSize: '11pt', display: 'block', marginBottom: '2pt', color: '#000' }}>{proj.titulo}</strong>
                    <p style={{ margin: '0 0 2pt 0', textAlign: 'justify' }}>{proj.descripcion}</p>
                    <div style={{ fontSize: '9pt', color: '#555' }}>
                      <strong>{t.technologies}</strong> {(proj.tecnologias || []).join(', ')}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Certificaciones */}
            {generatedData.certificaciones && generatedData.certificaciones.length > 0 && (
              <section style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <h3 style={{ fontSize: '12pt', margin: '0 0 8pt 0', borderBottom: '1px solid #ccc', paddingBottom: '4pt', textTransform: 'uppercase', pageBreakAfter: 'avoid', breakAfter: 'avoid' }}>{t.certifications}</h3>
                <ul style={{ margin: 0, paddingLeft: '18pt' }}>
                  {generatedData.certificaciones.map((cert, idx) => (
                    <li key={idx} style={{ marginBottom: '3pt', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <strong style={{ color: '#000' }}>{cert.titulo}</strong> {cert.descripcion ? `- ${cert.descripcion}` : ''}
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
