import { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { 
  Plus, Trash2, Edit, Save, ArrowUp, ArrowDown, Languages, 
  TrendingUp, Briefcase, Calendar, Building2, Check, X
} from 'lucide-react';
import { autoTranslate } from '../../utils/translate';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function ExperienceEditor() {
  const { profile, updateProfile } = usePortfolio();
  const [experiences, setExperiences] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [translating, setTranslating] = useState(false);

  // Main Experience Item Form Data
  const [formData, setFormData] = useState({
    company: '',
    period: '', period_en: '',
    location: '',
    hasMultipleRoles: false,
    // Single role fallback
    role: '', role_en: '',
    tag: '', tag_en: '',
    desc: '', desc_en: '',
    // Multi-role trajectory
    roles: []
  });

  // State for adding/editing a sub-role within multi-role mode
  const [subRoleForm, setSubRoleForm] = useState({
    role: '', role_en: '',
    period: '', period_en: '',
    tag: '', tag_en: '',
    desc: '', desc_en: ''
  });
  const [editingSubRoleIdx, setEditingSubRoleIdx] = useState(null);

  // Sync with profile experiences when loaded
  useEffect(() => {
    if (profile && profile.experiences) {
      setExperiences(profile.experiences);
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleQuillChange = (value, name) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubRoleChange = (e) => {
    setSubRoleForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubRoleQuillChange = (value, name) => {
    setSubRoleForm(prev => ({ ...prev, [name]: value }));
  };

  // Add or update sub-role inside formData.roles
  const handleAddOrUpdateSubRole = (e) => {
    e.preventDefault();
    if (!subRoleForm.role.trim()) {
      alert('Por favor especifica el nombre del puesto.');
      return;
    }

    const currentRoles = [...(formData.roles || [])];
    if (editingSubRoleIdx !== null) {
      currentRoles[editingSubRoleIdx] = { ...subRoleForm };
      setEditingSubRoleIdx(null);
    } else {
      currentRoles.push({ id: Date.now(), ...subRoleForm });
    }

    setFormData(prev => ({ ...prev, roles: currentRoles }));
    setSubRoleForm({ role: '', role_en: '', period: '', period_en: '', tag: '', tag_en: '', desc: '', desc_en: '' });
  };

  const handleEditSubRole = (subIdx) => {
    setEditingSubRoleIdx(subIdx);
    setSubRoleForm(formData.roles[subIdx]);
  };

  const handleDeleteSubRole = (subIdx) => {
    const updated = formData.roles.filter((_, idx) => idx !== subIdx);
    setFormData(prev => ({ ...prev, roles: updated }));
    if (editingSubRoleIdx === subIdx) {
      setEditingSubRoleIdx(null);
      setSubRoleForm({ role: '', role_en: '', period: '', period_en: '', tag: '', tag_en: '', desc: '', desc_en: '' });
    }
  };

  const handleMoveSubRole = (subIdx, dir) => {
    if (subIdx + dir < 0 || subIdx + dir >= formData.roles.length) return;
    const updated = [...formData.roles];
    const temp = updated[subIdx];
    updated[subIdx] = updated[subIdx + dir];
    updated[subIdx + dir] = temp;
    setFormData(prev => ({ ...prev, roles: updated }));
  };

  // Auto-translate whole experience
  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const translatedPeriod = await autoTranslate(formData.period);
      let translatedRole = '';
      let translatedTag = '';
      let translatedDesc = '';

      if (!formData.hasMultipleRoles) {
        translatedRole = await autoTranslate(formData.role);
        translatedTag = await autoTranslate(formData.tag);
        translatedDesc = await autoTranslate(formData.desc);
      }

      // Translate sub-roles if any
      let translatedRoles = [...(formData.roles || [])];
      if (formData.hasMultipleRoles && translatedRoles.length > 0) {
        translatedRoles = await Promise.all(translatedRoles.map(async (r) => ({
          ...r,
          role_en: r.role_en || await autoTranslate(r.role),
          period_en: r.period_en || await autoTranslate(r.period),
          tag_en: r.tag_en || await autoTranslate(r.tag),
          desc_en: r.desc_en || await autoTranslate(r.desc)
        })));
      }

      setFormData(prev => ({
        ...prev,
        period_en: translatedPeriod || prev.period_en,
        role_en: translatedRole || prev.role_en,
        tag_en: translatedTag || prev.tag_en,
        desc_en: translatedDesc || prev.desc_en,
        roles: translatedRoles
      }));
    } catch (err) {
      console.error(err);
      alert('Error al traducir.');
    } finally {
      setTranslating(false);
    }
  };

  const handleAddOrUpdate = (e) => {
    e.preventDefault();

    // Prepare item to store
    const itemToSave = {
      company: formData.company,
      period: formData.period,
      period_en: formData.period_en,
      location: formData.location,
      hasMultipleRoles: formData.hasMultipleRoles
    };

    if (formData.hasMultipleRoles) {
      itemToSave.roles = formData.roles || [];
      // Set top role as fallback
      if (itemToSave.roles.length > 0) {
        itemToSave.role = itemToSave.roles[0].role;
        itemToSave.role_en = itemToSave.roles[0].role_en;
        itemToSave.desc = itemToSave.roles[0].desc;
        itemToSave.desc_en = itemToSave.roles[0].desc_en;
        itemToSave.tag = itemToSave.roles[0].tag;
        itemToSave.tag_en = itemToSave.roles[0].tag_en;
      }
    } else {
      itemToSave.role = formData.role;
      itemToSave.role_en = formData.role_en;
      itemToSave.desc = formData.desc;
      itemToSave.desc_en = formData.desc_en;
      itemToSave.tag = formData.tag;
      itemToSave.tag_en = formData.tag_en;
      itemToSave.roles = [];
    }
    
    if (editingIndex !== null) {
      const updated = [...experiences];
      updated[editingIndex] = itemToSave;
      setExperiences(updated);
      setEditingIndex(null);
    } else {
      setExperiences([...experiences, itemToSave]);
    }

    setFormData({
      company: '',
      period: '', period_en: '',
      location: '',
      hasMultipleRoles: false,
      role: '', role_en: '',
      tag: '', tag_en: '',
      desc: '', desc_en: '',
      roles: []
    });
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    const exp = experiences[index];
    const hasMulti = (exp.roles && exp.roles.length > 0) || exp.hasMultipleRoles;

    setFormData({
      company: exp.company || '',
      period: exp.period || '',
      period_en: exp.period_en || '',
      location: exp.location || '',
      hasMultipleRoles: !!hasMulti,
      role: exp.role || '',
      role_en: exp.role_en || '',
      tag: exp.tag || '',
      tag_en: exp.tag_en || '',
      desc: exp.desc || '',
      desc_en: exp.desc_en || '',
      roles: exp.roles || []
    });
  };

  const handleDeleteClick = (index) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta experiencia?')) {
      const updated = experiences.filter((_, idx) => idx !== index);
      setExperiences(updated);
      if (editingIndex === index) {
        setEditingIndex(null);
        setFormData({
          company: '',
          period: '', period_en: '',
          location: '',
          hasMultipleRoles: false,
          role: '', role_en: '',
          tag: '', tag_en: '',
          desc: '', desc_en: '',
          roles: []
        });
      } else if (editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
    }
  };

  const handleMove = (index, direction) => {
    if (index + direction < 0 || index + direction >= experiences.length) return;
    const updated = [...experiences];
    const temp = updated[index];
    updated[index] = updated[index + direction];
    updated[index + direction] = temp;
    setExperiences(updated);
    
    if (editingIndex === index) {
      setEditingIndex(index + direction);
    } else if (editingIndex === index + direction) {
      setEditingIndex(index);
    }
  };

  const handleSaveToFirestore = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      await updateProfile({
        ...profile,
        experiences: experiences
      });
      setSuccessMsg('Trayectoria profesional guardada con éxito.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error("Error saving experiences:", error);
      alert("Error al guardar la trayectoria. Revisa la consola.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ marginBottom: 'var(--spacing-2xl)' }}>
      <h2 style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Manage Professional Experience & Progression</span>
        {successMsg && <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 'normal' }}>{successMsg}</span>}
      </h2>

      {/* Current Experience List */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        {experiences.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No experiences registered. Add one below.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {experiences.map((exp, idx) => {
              const hasMulti = exp.roles && exp.roles.length > 0;
              return (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: 'var(--spacing-sm) var(--spacing-md)', 
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {hasMulti ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                        <TrendingUp size={12} /> {exp.roles.length} PUESTOS (TRAYECTORIA)
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--color-sage)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem' }}>
                        <Briefcase size={12} /> PUESTO ÚNICO
                      </span>
                    )}

                    <strong style={{ color: 'var(--text-primary)' }}>{exp.company}</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      ({exp.period}) {hasMulti ? `— Puesto más reciente: ${exp.roles[0]?.role}` : `— ${exp.role}`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => handleMove(idx, -1)} disabled={idx === 0} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}><ArrowUp size={16} /></button>
                    <button type="button" onClick={() => handleMove(idx, 1)} disabled={idx === experiences.length - 1} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: idx === experiences.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === experiences.length - 1 ? 0.3 : 1 }}><ArrowDown size={16} /></button>
                    <button type="button" onClick={() => handleEditClick(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}><Edit size={16} /></button>
                    <button type="button" onClick={() => handleDeleteClick(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Form */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
            {editingIndex !== null ? 'Editar Experiencia' : 'Agregar Nueva Organización / Empresa'}
          </h3>
          <button type="button" className="btn-secondary" onClick={handleTranslate} disabled={translating} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <Languages size={14} /> {translating ? 'Traduciendo...' : 'Auto-Traducir a EN'}
          </button>
        </div>
        
        <form onSubmit={handleAddOrUpdate}>
          
          {/* Company and Global Tenure */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Empresa u Organización</label>
              <input name="company" type="text" className="form-input" value={formData.company} onChange={handleChange} placeholder="e.g. Centro de Enseñanza Técnica Industrial (CETI)" required />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Ubicación / Alcance (Opcional)</label>
              <input name="location" type="text" className="form-input" value={formData.location} onChange={handleChange} placeholder="e.g. Jalisco, México • Educación Superior" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Período Total Acumulado en la Empresa (ES)</label>
              <input name="period" type="text" className="form-input" value={formData.period} onChange={handleChange} placeholder="e.g. 10 años (2014 - Presente)" required />
            </div>
            <div className="form-group">
              <label className="form-label">Total Tenure in Company (EN)</label>
              <input name="period_en" type="text" className="form-input" value={formData.period_en} onChange={handleChange} placeholder="e.g. 10 years (2014 - Present)" />
            </div>
          </div>

          {/* Mode Selector Toggle: Single Role vs Career Progression */}
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid var(--border-light)', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: 'var(--spacing-md) 0' 
          }}>
            <label className="form-label" style={{ fontWeight: 700, marginBottom: '8px' }}>
              Modalidad de Experiencia
            </label>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input 
                  type="radio" 
                  name="hasMultipleRoles" 
                  checked={!formData.hasMultipleRoles} 
                  onChange={() => setFormData(prev => ({ ...prev, hasMultipleRoles: false }))} 
                />
                <span>Puesto Único</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: formData.hasMultipleRoles ? 'var(--color-voltage)' : 'inherit', fontWeight: formData.hasMultipleRoles ? 600 : 400 }}>
                <input 
                  type="radio" 
                  name="hasMultipleRoles" 
                  checked={formData.hasMultipleRoles} 
                  onChange={() => setFormData(prev => ({ ...prev, hasMultipleRoles: true }))} 
                />
                <span>🚀 Trayectoria Progresiva / Múltiples Puestos (Misma Empresa)</span>
              </label>
            </div>
          </div>

          {/* ================= MULTI-ROLE TRAYECTORY SECTION ================= */}
          {formData.hasMultipleRoles ? (
            <div style={{
              background: 'rgba(139, 92, 246, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '8px',
              padding: 'var(--spacing-md)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                <h4 style={{ fontSize: '1rem', margin: 0, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={16} /> Puestos Desempeñados en esta Organización ({formData.roles?.length || 0})
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Ordena de más reciente (arriba) a más antiguo (abajo)
                </span>
              </div>

              {/* Roles List */}
              {formData.roles && formData.roles.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: 'var(--spacing-md)' }}>
                  {formData.roles.map((sub, sIdx) => (
                    <div key={sIdx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-light)'
                    }}>
                      <div>
                        <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{sub.role}</strong>
                        <span style={{ color: 'var(--color-sage)', fontSize: '0.82rem', marginLeft: '10px' }}>• {sub.period}</span>
                        {sub.tag && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '8px' }}>({sub.tag.replace(/<[^>]+>/g, '').slice(0, 30)}...)</span>}
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="button" onClick={() => handleMoveSubRole(sIdx, -1)} disabled={sIdx === 0} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: sIdx === 0 ? 'not-allowed' : 'pointer' }}><ArrowUp size={15} /></button>
                        <button type="button" onClick={() => handleMoveSubRole(sIdx, 1)} disabled={sIdx === formData.roles.length - 1} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: sIdx === formData.roles.length - 1 ? 'not-allowed' : 'pointer' }}><ArrowDown size={15} /></button>
                        <button type="button" onClick={() => handleEditSubRole(sIdx)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}><Edit size={15} /></button>
                        <button type="button" onClick={() => handleDeleteSubRole(sIdx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-form to Add / Edit a Role */}
              <div style={{
                background: 'rgba(0,0,0,0.25)',
                border: '1px dashed rgba(139, 92, 246, 0.4)',
                padding: 'var(--spacing-md)',
                borderRadius: '6px'
              }}>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  {editingSubRoleIdx !== null ? `Editar Puesto #${editingSubRoleIdx + 1}` : '+ Agregar Puesto a la Trayectoria'}
                </h5>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Cargo / Puesto (ES)</label>
                    <input name="role" type="text" className="form-input" style={{ fontSize: '0.85rem' }} value={subRoleForm.role} onChange={handleSubRoleChange} placeholder="e.g. Director de Plantel" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Position / Role (EN)</label>
                    <input name="role_en" type="text" className="form-input" style={{ fontSize: '0.85rem' }} value={subRoleForm.role_en} onChange={handleSubRoleChange} placeholder="e.g. Campus Director" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: '8px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Período en este puesto (ES)</label>
                    <input name="period" type="text" className="form-input" style={{ fontSize: '0.85rem' }} value={subRoleForm.period} onChange={handleSubRoleChange} placeholder="e.g. 2021 - Presente" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Period in this role (EN)</label>
                    <input name="period_en" type="text" className="form-input" style={{ fontSize: '0.85rem' }} value={subRoleForm.period_en} onChange={handleSubRoleChange} placeholder="e.g. 2021 - Present" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: '8px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Área de Especialidad / Tag (ES)</label>
                    <input name="tag" type="text" className="form-input" style={{ fontSize: '0.85rem' }} value={subRoleForm.tag} onChange={handleSubRoleChange} placeholder="e.g. Liderazgo y Gobernanza de Datos" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Specialty Tag (EN)</label>
                    <input name="tag_en" type="text" className="form-input" style={{ fontSize: '0.85rem' }} value={subRoleForm.tag_en} onChange={handleSubRoleChange} placeholder="e.g. Strategic Leadership & Data" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: '8px' }}>
                  <div className="form-group" style={{ marginBottom: '35px' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Responsabilidades y Logros (ES)</label>
                    <ReactQuill theme="snow" value={subRoleForm.desc || ''} onChange={(val) => handleSubRoleQuillChange(val, 'desc')} placeholder="Bullets o descripción con métricas..." />
                  </div>
                  <div className="form-group" style={{ marginBottom: '35px' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Responsibilities & Impact (EN)</label>
                    <ReactQuill theme="snow" value={subRoleForm.desc_en || ''} onChange={(val) => handleSubRoleQuillChange(val, 'desc_en')} placeholder="Bullets in English..." />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <button type="button" onClick={handleAddOrUpdateSubRole} className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}>
                    <Plus size={15} /> {editingSubRoleIdx !== null ? 'Guardar Cambios de este Puesto' : 'Agregar Puesto a la Lista'}
                  </button>
                  {editingSubRoleIdx !== null && (
                    <button type="button" onClick={() => { setEditingSubRoleIdx(null); setSubRoleForm({ role: '', role_en: '', period: '', period_en: '', tag: '', tag_en: '', desc: '', desc_en: '' }); }} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.45rem 1rem' }}>
                      Cancelar Edición de Puesto
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ================= SINGLE ROLE FORM ================= */
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div className="form-group">
                  <label className="form-label">Role / Cargo (ES)</label>
                  <input name="role" type="text" className="form-input" value={formData.role} onChange={handleChange} placeholder="e.g. Ingeniero Senior" required={!formData.hasMultipleRoles} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role (EN)</label>
                  <input name="role_en" type="text" className="form-input" value={formData.role_en} onChange={handleChange} placeholder="e.g. Senior AI Engineer" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div className="form-group" style={{ marginBottom: '40px' }}>
                  <label className="form-label">Tag / Área de Especialidad (ES)</label>
                  <ReactQuill theme="snow" value={formData.tag || ''} onChange={(val) => handleQuillChange(val, 'tag')} placeholder="e.g. Inteligencia Artificial" />
                </div>
                <div className="form-group" style={{ marginBottom: '40px' }}>
                  <label className="form-label">Tag (EN)</label>
                  <ReactQuill theme="snow" value={formData.tag_en || ''} onChange={(val) => handleQuillChange(val, 'tag_en')} placeholder="e.g. Artificial Intelligence" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                <div className="form-group" style={{ marginBottom: '40px' }}>
                  <label className="form-label">Description / Descripción (ES)</label>
                  <ReactQuill theme="snow" value={formData.desc || ''} onChange={(val) => handleQuillChange(val, 'desc')} placeholder="Describe tus responsabilidades..." />
                </div>
                <div className="form-group" style={{ marginBottom: '40px' }}>
                  <label className="form-label">Description (EN)</label>
                  <ReactQuill theme="snow" value={formData.desc_en || ''} onChange={(val) => handleQuillChange(val, 'desc_en')} placeholder="Describe your responsibilities..." />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: 'var(--spacing-md)' }}>
            <button type="submit" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}>
              <Plus size={16} /> {editingIndex !== null ? 'Actualizar Tarjeta en Lista' : 'Agregar Tarjeta de Experiencia'}
            </button>
            {editingIndex !== null && (
              <button type="button" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1.25rem' }} onClick={() => { setEditingIndex(null); setFormData({ company: '', period: '', period_en: '', location: '', hasMultipleRoles: false, role: '', role_en: '', tag: '', tag_en: '', desc: '', desc_en: '', roles: [] }); }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Save Button for Firestore */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--spacing-md)' }}>
        <button type="button" className="btn-primary" onClick={handleSaveToFirestore} disabled={saving || experiences.length === 0}>
          <Save size={18} /> {saving ? 'Guardando trayectoria...' : 'Guardar Trayectoria en Base de Datos'}
        </button>
      </div>
    </div>
  );
}
