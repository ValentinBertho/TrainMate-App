import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { coachesAPI } from '../lib/coaches';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Alert } from '../components/Alert';

export default function CreateCoachProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    bio: '',
    specialties: [],
    yearsOfExperience: 1,
    monthlyRate: null,
    sessionRate: null,
    certifications: ''
  });

  const specialtyOptions = [
    'Running',
    'Trail',
    'Marathon',
    'Ultra',
    'Cyclisme',
    'VTT',
    'Triathlon',
    'Débutant',
    'Compétition'
  ];

  const toggleSpecialty = (spec) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(spec)
        ? prev.specialties.filter(s => s !== spec)
        : [...prev.specialties, spec]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.specialties.length === 0) {
      setError('Choisis au moins une spécialité');
      return;
    }

    setLoading(true);

    try {
      await coachesAPI.createProfile(formData);
      navigate('/coach/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 sm:pb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Créer mon profil coach</h1>
        <p className="text-gray-600 mt-2">
          Partage ton expérience et commence à coacher des athlètes
        </p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Présentation
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Parle de ton parcours, ta philosophie d'entraînement, ce qui te passionne..."
              required
            />
          </div>

          {/* Spécialités */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spécialités *
            </label>
            <div className="flex flex-wrap gap-2">
              {specialtyOptions.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => toggleSpecialty(spec)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    formData.specialties.includes(spec)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Expérience */}
          <Input
            label="Années d'expérience"
            type="number"
            min="0"
            value={formData.yearsOfExperience}
            onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: parseInt(e.target.value) }))}
            required
          />

          {/* Tarifs */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tarif mensuel (€)"
              type="number"
              min="0"
              step="0.01"
              value={formData.monthlyRate || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                monthlyRate: e.target.value ? parseFloat(e.target.value) : null 
              }))}
              placeholder="Optionnel"
            />
            <Input
              label="Tarif par séance (€)"
              type="number"
              min="0"
              step="0.01"
              value={formData.sessionRate || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                sessionRate: e.target.value ? parseFloat(e.target.value) : null 
              }))}
              placeholder="Optionnel"
            />
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certifications / Diplômes (optionnel)
            </label>
            <textarea
              value={formData.certifications}
              onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: BEES, DU Préparation Physique, etc."
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1" size="lg">
              {loading ? 'Création...' : 'Créer mon profil'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/dashboard')}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}