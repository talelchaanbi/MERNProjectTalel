import { useState } from 'react';
import { createJob } from '../api/jobs';

const initialState = {
  title: '',
  companyName: '',
  location: '',
  experienceLevel: 'MID',
  contractType: 'CDI',
  salaryMin: '',
  salaryMax: '',
  currency: 'EUR',
  remote: false,
  skills: '',
  description: '',
};

export default function JobForm({ onCreated }) {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createJob({
        ...form,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        skills: form.skills,
      });
      setForm(initialState);
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Publier une offre</h2>
      {error && <div className="error-message">{error}</div>}
      <form className="form" onSubmit={onSubmit}>
        <label className="form-label">
          Titre du poste
          <input name="title" value={form.title} onChange={onChange} required />
        </label>
        <label className="form-label">
          Entreprise
          <input name="companyName" value={form.companyName} onChange={onChange} />
        </label>
        <label className="form-label">
          Localisation
          <input name="location" value={form.location} onChange={onChange} required />
        </label>
        <div className="form-grid">
          <label className="form-label">
            Niveau
            <select name="experienceLevel" value={form.experienceLevel} onChange={onChange}>
              <option value="JUNIOR">Junior</option>
              <option value="MID">Confirmé</option>
              <option value="SENIOR">Senior</option>
              <option value="EXPERT">Expert</option>
            </select>
          </label>
          <label className="form-label">
            Contrat
            <input name="contractType" value={form.contractType} onChange={onChange} />
          </label>
        </div>
        <div className="form-grid">
          <label className="form-label">
            Salaire min
            <input type="number" name="salaryMin" value={form.salaryMin} onChange={onChange} />
          </label>
          <label className="form-label">
            Salaire max
            <input type="number" name="salaryMax" value={form.salaryMax} onChange={onChange} />
          </label>
          <label className="form-label">
            Devise
            <input name="currency" value={form.currency} onChange={onChange} />
          </label>
        </div>
        <label className="form-label">
          Compétences (séparées par virgules)
          <input name="skills" value={form.skills} onChange={onChange} placeholder="React, Node, SQL" />
        </label>
        <label className="form-label">
          Description
          <textarea name="description" value={form.description} onChange={onChange} rows={4} required />
        </label>
        <label className="checkbox-row">
          <input type="checkbox" name="remote" checked={form.remote} onChange={onChange} />
          Télétravail possible
        </label>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? 'Publication…' : 'Publier'}
        </button>
      </form>
    </div>
  );
}