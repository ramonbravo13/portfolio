import { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Plus, Trash2, Edit, Save, ArrowUp, ArrowDown, UploadCloud, Languages } from 'lucide-react';
import { autoTranslate } from '../../utils/translate';

export default function CertificationsEditor() {
  const { profile, updateProfile, uploadFile } = usePortfolio();
  const [certs, setCerts] = useState([]);
  
  useEffect(() => {
    setCerts(profile.certs || []);
  }, [profile.certs]);

  const [formData, setFormData] = useState({
    title: '', title_en: '',
    tags: '', tags_en: '',
    desc: '', desc_en: '',
    url: ''
  });
  
  const [pdfFile, setPdfFile] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);

  const handleEdit = (index) => {
    setEditingIndex(index);
    const cert = certs[index];
    setFormData({
      title: cert.title || '', title_en: cert.title_en || '',
      tags: cert.tags || '', tags_en: cert.tags_en || '',
      desc: cert.desc || '', desc_en: cert.desc_en || '',
      url: cert.url || ''
    });
  };

  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const translatedTitle = await autoTranslate(formData.title);
      const translatedTags = await autoTranslate(formData.tags);
      const translatedDesc = await autoTranslate(formData.desc);
      
      setFormData(prev => ({
        ...prev,
        title_en: translatedTitle || prev.title_en,
        tags_en: translatedTags || prev.tags_en,
        desc_en: translatedDesc || prev.desc_en
      }));
    } catch (err) {
      console.error(err);
      alert('Error translating text.');
    } finally {
      setTranslating(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let finalUrl = formData.url;
      if (pdfFile) {
        finalUrl = await uploadFile(pdfFile, 'certifications');
      }

      const updatedData = {
        title: formData.title, title_en: formData.title_en,
        tags: formData.tags, tags_en: formData.tags_en,
        desc: formData.desc, desc_en: formData.desc_en,
        url: finalUrl
      };

      let newCerts = [...certs];
      if (editingIndex !== null) {
        newCerts[editingIndex] = { ...newCerts[editingIndex], ...updatedData };
      } else {
        newCerts.push({ id: Date.now(), ...updatedData });
      }

      await updateProfile({ ...profile, certs: newCerts });
      
      setFormData({ title: '', title_en: '', tags: '', tags_en: '', desc: '', desc_en: '', url: '' });
      setPdfFile(null);
      setEditingIndex(null);
    } catch (err) {
      console.error("Error saving certification:", err);
      alert("Failed to save certification.");
    } finally {
      setUploading(false);
    }
  };

  const deleteCert = async (index) => {
    if (window.confirm('Delete this certification?')) {
      const newCerts = certs.filter((_, i) => i !== index);
      await updateProfile({ ...profile, certs: newCerts });
    }
  };

  const moveCert = async (index, dir) => {
    if ((dir === -1 && index === 0) || (dir === 1 && index === certs.length - 1)) return;
    const newCerts = [...certs];
    const temp = newCerts[index];
    newCerts[index] = newCerts[index + dir];
    newCerts[index + dir] = temp;
    await updateProfile({ ...profile, certs: newCerts });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setFormData({ title: '', title_en: '', tags: '', tags_en: '', desc: '', desc_en: '', url: '' });
    setPdfFile(null);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ marginBottom: 'var(--spacing-2xl)' }}>
      <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Manage Certifications & Awards</h2>
      
      {/* Existing List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
        {certs.map((cert, idx) => (
          <div key={cert.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--spacing-sm)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div>
              <span style={{ fontWeight: 600 }}>{cert.title}</span>
              <span className="mono" style={{ marginLeft: '12px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{cert.tags}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => moveCert(idx, -1)} disabled={idx === 0} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}><ArrowUp size={16}/></button>
              <button onClick={() => moveCert(idx, 1)} disabled={idx === certs.length - 1} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: idx === certs.length - 1 ? 'not-allowed' : 'pointer' }}><ArrowDown size={16}/></button>
              <button onClick={() => handleEdit(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><Edit size={16}/></button>
              <button onClick={() => deleteCert(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
        {certs.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No certifications added yet.</p>}
      </div>

      {/* Form */}
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
          <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{editingIndex !== null ? 'Edit Certification' : 'Add New Certification'}</h3>
          <button type="button" className="btn-secondary" onClick={handleTranslate} disabled={translating} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <Languages size={14} /> {translating ? 'Translating...' : 'Auto-Translate to EN'}
          </button>
        </div>
        
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">Title (ES)</label>
              <input type="text" className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Title (EN)</label>
              <input type="text" className="form-input" value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">Tags (ES) (comma separated)</label>
              <input type="text" className="form-input" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Tags (EN)</label>
              <input type="text" className="form-input" value={formData.tags_en} onChange={e => setFormData({...formData, tags_en: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">Description (ES)</label>
              <textarea className="form-input" rows="3" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description (EN)</label>
              <textarea className="form-input" rows="3" value={formData.desc_en} onChange={e => setFormData({...formData, desc_en: e.target.value})} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 'var(--spacing-md)' }}>
            <label className="form-label">PDF File URL (or Upload)</label>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
              <input type="url" className="form-input" placeholder="https://..." value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} disabled={!!pdfFile} required={!pdfFile && editingIndex === null} />
              <span style={{ color: 'var(--text-secondary)' }}>OR</span>
              <label className="btn-primary" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem' }}>
                <UploadCloud size={18} /> {pdfFile ? pdfFile.name : 'Upload PDF'}
                <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={(e) => setPdfFile(e.target.files[0])} />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
            <button type="submit" className="btn-primary" disabled={uploading} style={{ flex: 1, justifyContent: 'center' }}>
              <Save size={18} /> {uploading ? 'Saving...' : (editingIndex !== null ? 'Update Certification' : 'Add Certification')}
            </button>
            {editingIndex !== null && (
              <button type="button" className="btn-secondary" onClick={cancelEdit} style={{ flex: 1, justifyContent: 'center' }}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
