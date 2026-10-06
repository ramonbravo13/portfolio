import { useState, useRef } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { FileText, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import html2pdf from 'html2pdf.js';

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

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      const prompt = `
Actúa como un experto reclutador Tech y redactor de CVs para Roles de Ciencia de Datos e IA.
Tengo los siguientes datos de mi perfil extraídos de mi base de datos:
${JSON.stringify(dataToSend, null, 2)}

Instrucciones o vacante objetivo:
${instructions}

Regla de Idioma: ${langInstructions}

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
    const element = cvRef.current;
    
    // Configuración para html2pdf
    const opt = {
      margin:       [10, 0, 10, 0],
      filename:     `CV_Ramon_Bravo_${lang.toUpperCase()}_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg', quality: 1.0 },
      html2canvas:  { scale: 3, useCORS: true, letterRendering: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setLoading(false);
      setGeneratedData(null); // Clear after generating
    });
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

      {/* Hidden CV Template for html2pdf */}
      {generatedData && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <div ref={cvRef} style={{ 
            width: '794px', 
            padding: '40px 50px', 
            boxSizing: 'border-box',
            backgroundColor: '#fff', 
            color: '#111', 
            fontFamily: '"Inter", sans-serif', 
            fontSize: '14px', 
            lineHeight: 1.5,
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
            
            {/* Header */}
            <header style={{ borderBottom: '2px solid #222', paddingBottom: '15px', marginBottom: '20px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
              <h1 style={{ fontSize: '28px', margin: '0 0 5px 0', color: '#000', textTransform: 'uppercase' }}>{generatedData.nombre}</h1>
              <h2 style={{ fontSize: '18px', margin: 0, color: '#444', fontWeight: 500 }}>{generatedData.titulo}</h2>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', display: 'flex', gap: '15px' }}>
                {profile.contactEmail && <span>{profile.contactEmail}</span>}
                {profile.contactPhone && <span>{profile.contactPhone}</span>}
              </div>
            </header>

            {/* Resumen */}
            {generatedData.resumen_ejecutivo && (
              <section style={{ marginBottom: '20px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <p style={{ margin: 0 }}>{generatedData.resumen_ejecutivo}</p>
              </section>
            )}

            {/* Skills */}
            {generatedData.skills && generatedData.skills.length > 0 && (
              <section style={{ marginBottom: '20px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', borderBottom: '1px solid #ccc', paddingBottom: '5px', textTransform: 'uppercase' }}>{t.skills}</h3>
                <p style={{ margin: 0 }}>{generatedData.skills.join(', ')}</p>
              </section>
            )}

            {/* Experiencia */}
            {generatedData.experiencias && generatedData.experiencias.length > 0 && (
              <section style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', borderBottom: '1px solid #ccc', paddingBottom: '5px', textTransform: 'uppercase' }}>{t.experience}</h3>
                {generatedData.experiencias.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: '15px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
                      <strong style={{ fontSize: '15px' }}>{exp.rol}</strong>
                      <span style={{ fontSize: '13px', color: '#666' }}>{exp.periodo}</span>
                    </div>
                    <div style={{ fontWeight: 500, marginBottom: '5px' }}>{exp.empresa}</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', textAlign: 'justify' }}>
                      {(exp.descripcion || []).map((punto, pIdx) => (
                        <li key={pIdx} style={{ marginBottom: '6px', paddingLeft: '5px' }}>{punto}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            {/* Proyectos Clave */}
            {generatedData.proyectos_clave && generatedData.proyectos_clave.length > 0 && (
              <section style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', borderBottom: '1px solid #ccc', paddingBottom: '5px', textTransform: 'uppercase' }}>{t.projects}</h3>
                {generatedData.proyectos_clave.map((proj, idx) => (
                  <div key={idx} style={{ marginBottom: '12px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{proj.titulo}</strong>
                    <p style={{ margin: '0 0 4px 0' }}>{proj.descripcion}</p>
                    <div style={{ fontSize: '12px', color: '#555' }}>
                      <strong>{t.technologies}</strong> {(proj.tecnologias || []).join(', ')}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {/* Certificaciones */}
            {generatedData.certificaciones && generatedData.certificaciones.length > 0 && (
              <section style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', borderBottom: '1px solid #ccc', paddingBottom: '5px', textTransform: 'uppercase' }}>{t.certifications}</h3>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {generatedData.certificaciones.map((cert, idx) => (
                    <li key={idx} style={{ marginBottom: '4px', pageBreakInside: 'avoid', breakInside: 'avoid', display: 'block' }}>
                      <strong>{cert.titulo}</strong> {cert.descripcion ? `- ${cert.descripcion}` : ''}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            
          </div>
        </div>
      )}
    </section>
  );
}
