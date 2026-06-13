import { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Save, UploadCloud, Languages } from 'lucide-react';
import { autoTranslate } from '../../utils/translate';

export default function ProfileEditor() {
  const { profile, updateProfile, uploadFile } = usePortfolio();
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    title_en: '',
    profileImage: '',
    bio: '',
    bio_en: '',
    skillsArray: '',
    skillsArray_en: ''
  });

  // Sync with profile data when it loads or changes
  useEffect(() => {
    if (profile.name !== "Loading...") {
      setFormData({
        name: profile.name || '',
        title: profile.title || '',
        title_en: profile.title_en || '',
        profileImage: profile.profileImage || '',
        bio: profile.bio || '',
        bio_en: profile.bio_en || '',
        skillsArray: (profile.skills || []).join(', '),
        skillsArray_en: (profile.skills_en || []).join(', ')
      });
    }
  }, [profile]);
  
  const [successMsg, setSuccessMsg] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [translating, setTranslating] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const translatedTitle = await autoTranslate(formData.title);
      const translatedBio = await autoTranslate(formData.bio);
      const translatedSkills = await autoTranslate(formData.skillsArray);
      
      setFormData(prev => ({
        ...prev,
        title_en: translatedTitle || prev.title_en,
        bio_en: translatedBio || prev.bio_en,
        skillsArray_en: translatedSkills || prev.skillsArray_en
      }));
      setSuccessMsg('Translation applied. Review English fields.');
      setTimeout(() => setSuccessMsg(''), 3000);
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
    setSuccessMsg('');
    
    try {
      let finalImageUrl = formData.profileImage;
      if (imageFile) {
        finalImageUrl = await uploadFile(imageFile, 'profile_images');
      }

      await updateProfile({
        ...formData,
        profileImage: finalImageUrl,
        skills: formData.skillsArray.split(',').map(s => s.trim()).filter(s => s),
        skills_en: formData.skillsArray_en.split(',').map(s => s.trim()).filter(s => s)
      });
      
      setImageFile(null);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Error saving profile. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ marginBottom: 'var(--spacing-2xl)' }}>
      <h2 style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Edit Profile Details</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          {successMsg && <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 'normal' }}>{successMsg}</span>}
          <button type="button" className="btn-secondary" onClick={handleTranslate} disabled={translating} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <Languages size={14} /> {translating ? 'Translating...' : 'Auto-Translate to English'}
          </button>
        </div>
      </h2>
      
      <form onSubmit={handleSave}>
        <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="name" type="text" className="form-input" value={formData.name} onChange={handleChange} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <div className="form-group">
            <label className="form-label">Professional Title (ES)</label>
            <input name="title" type="text" className="form-input" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Professional Title (EN)</label>
            <input name="title_en" type="text" className="form-input" value={formData.title_en} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Profile Image (URL or Upload)</label>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            <input name="profileImage" type="url" className="form-input" placeholder="https://..." value={formData.profileImage} onChange={handleChange} disabled={!!imageFile} />
            <span style={{ color: 'var(--text-secondary)' }}>OR</span>
            <label className="btn-primary" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem' }}>
              <UploadCloud size={18} /> {imageFile ? imageFile.name : 'Upload File'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setImageFile(e.target.files[0])} />
            </label>
            {imageFile && (
              <button type="button" onClick={() => setImageFile(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}>Clear</button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <div className="form-group">
            <label className="form-label">Biography (ES)</label>
            <textarea name="bio" className="form-input" rows="4" value={formData.bio} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Biography (EN)</label>
            <textarea name="bio_en" className="form-input" rows="4" value={formData.bio_en} onChange={handleChange} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <div className="form-group">
            <label className="form-label">Hero Tags (ES) (comma separated)</label>
            <input name="skillsArray" type="text" className="form-input" value={formData.skillsArray} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Hero Tags (EN)</label>
            <input name="skillsArray_en" type="text" className="form-input" value={formData.skillsArray_en} onChange={handleChange} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-lg)' }}>
          <button type="submit" className="btn-primary" disabled={uploading}>
            <Save size={18} /> {uploading ? 'Saving & Uploading...' : 'Save Profile Details'}
          </button>
        </div>
      </form>
    </div>
  );
}
