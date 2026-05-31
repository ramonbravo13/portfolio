import { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Plus, Trash2, Edit, Save, ArrowUp, ArrowDown } from 'lucide-react';

export default function ExperienceEditor() {
  const { profile, updateProfile } = usePortfolio();
  const [experiences, setExperiences] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    role: '',
    company: '',
    period: '',
    tag: '',
    desc: ''
  });

  // Sync with profile experiences when loaded
  useEffect(() => {
    if (profile && profile.experiences) {
      setExperiences(profile.experiences);
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    
    if (editingIndex !== null) {
      // Update
      const updated = [...experiences];
      updated[editingIndex] = formData;
      setExperiences(updated);
      setEditingIndex(null);
    } else {
      // Add
      setExperiences([...experiences, formData]);
    }

    setFormData({ role: '', company: '', period: '', tag: '', desc: '' });
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setFormData(experiences[index]);
  };

  const handleDeleteClick = (index) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta experiencia?')) {
      const updated = experiences.filter((_, idx) => idx !== index);
      setExperiences(updated);
      if (editingIndex === index) {
        setEditingIndex(null);
        setFormData({ role: '', company: '', period: '', tag: '', desc: '' });
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
        <span>Manage Professional Experience</span>
        {successMsg && <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 'normal' }}>{successMsg}</span>}
      </h2>

      {/* Current Experience List */}
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        {experiences.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No experiences registered. Add one below.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {experiences.map((exp, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: 'var(--spacing-sm) var(--spacing-md)', 
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>{exp.role}</strong>
                  <span style={{ color: 'var(--text-secondary)', marginLeft: '8px', fontSize: '0.9rem' }}>at {exp.company} ({exp.period})</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => handleMove(idx, -1)} disabled={idx === 0} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1 }}><ArrowUp size={16} /></button>
                  <button type="button" onClick={() => handleMove(idx, 1)} disabled={idx === experiences.length - 1} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: idx === experiences.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === experiences.length - 1 ? 0.3 : 1 }}><ArrowDown size={16} /></button>
                  <button type="button" onClick={() => handleEditClick(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}><Edit size={16} /></button>
                  <button type="button" onClick={() => handleDeleteClick(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Form */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.1rem' }}>
          {editingIndex !== null ? 'Edit Experience Item' : 'Add New Experience Item'}
        </h3>
        
        <form onSubmit={handleAddOrUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">Role / Cargo</label>
              <input name="role" type="text" className="form-input" value={formData.role} onChange={handleChange} placeholder="e.g. Senior AI Engineer" required />
            </div>
            <div className="form-group">
              <label className="form-label">Company / Empresa</label>
              <input name="company" type="text" className="form-input" value={formData.company} onChange={handleChange} placeholder="e.g. Vercel Inc" required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">Period / Período</label>
              <input name="period" type="text" className="form-input" value={formData.period} onChange={handleChange} placeholder="e.g. 2023 - Presente" required />
            </div>
            <div className="form-group">
              <label className="form-label">Tag / Área de Especialidad</label>
              <input name="tag" type="text" className="form-input" value={formData.tag} onChange={handleChange} placeholder="e.g. Inteligencia Artificial y Datos" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Descripción de logros</label>
            <textarea name="desc" className="form-input" rows="3" value={formData.desc} onChange={handleChange} placeholder="Describe tus responsabilidades y aportes clave..." required />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: 'var(--spacing-md)' }}>
            <button type="submit" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              <Plus size={16} /> {editingIndex !== null ? 'Actualizar en Lista' : 'Agregar a Lista'}
            </button>
            {editingIndex !== null && (
              <button type="button" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }} onClick={() => { setEditingIndex(null); setFormData({ role: '', company: '', period: '', tag: '', desc: '' }); }}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Save Button for Firestore */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-lg)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--spacing-md)' }}>
        <button type="button" className="btn-primary" onClick={handleSaveToFirestore} disabled={saving || experiences.length === 0}>
          <Save size={18} /> {saving ? 'Guardando trayectoria...' : 'Save Experience Trayectory'}
        </button>
      </div>
    </div>
  );
}
