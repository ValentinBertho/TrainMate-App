import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { profileAPI } from '../lib/profile';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { User, Mail, Calendar as CalendarIcon, Award } from 'lucide-react';

export default function Profile() {
  const user = useAuthStore(state => state.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    primarySport: '',
    level: '',
    goal: '',
    weeklyAvailableHours: 5,
    preferredSessionsPerWeek: 3,
    hasGps: false,
    hasHeartRateMonitor: false,
    hasPowerMeter: false,
    hasIndoorTrainer: false
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await profileAPI.get();
      setProfile(data);
      setFormData({
        primarySport: data.primarySport,
        level: data.level,
        goal: data.goal || '',
        weeklyAvailableHours: data.weeklyAvailableHours,
        preferredSessionsPerWeek: data.preferredSessionsPerWeek,
        hasGps: data.hasGps,
        hasHeartRateMonitor: data.hasHeartRateMonitor,
        hasPowerMeter: data.hasPowerMeter,
        hasIndoorTrainer: data.hasIndoorTrainer
      });
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await profileAPI.update(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 sm:pb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-gray-600 mt-2">Personnalise tes préférences</p>
      </div>

      {success && (
        <Alert type="success">
          Profil mis à jour avec succès !
        </Alert>
      )}

      {/* User Info Card */}
      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-600">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Profile Form */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Préférences d'entraînement</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sport */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sport principal
            </label>
            <select
              value={formData.primarySport}
              onChange={(e) => handleChange('primarySport', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choisis ton sport</option>
              <option value="Running">Course à pied</option>
              <option value="Cycling">Cyclisme</option>
              <option value="Both">Les deux</option>
            </select>
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveau
            </label>
            <select
              value={formData.level}
              onChange={(e) => handleChange('level', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choisis ton niveau</option>
              <option value="Beginner">Débutant</option>
              <option value="Intermediate">Intermédiaire</option>
              <option value="Advanced">Avancé</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          {/* Goal */}
          <Input
            label="Objectif"
            type="text"
            value={formData.goal}
            onChange={(e) => handleChange('goal', e.target.value)}
            placeholder="Ex: Courir un 10K, améliorer mon endurance..."
          />

          {/* Availability */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Heures disponibles/semaine"
              type="number"
              min="1"
              max="20"
              value={formData.weeklyAvailableHours}
              onChange={(e) => handleChange('weeklyAvailableHours', parseInt(e.target.value))}
            />
            <Input
              label="Séances par semaine"
              type="number"
              min="1"
              max="7"
              value={formData.preferredSessionsPerWeek}
              onChange={(e) => handleChange('preferredSessionsPerWeek', parseInt(e.target.value))}
            />
          </div>

          {/* Equipment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Matériel disponible
            </label>
            <div className="space-y-2">
              {[
                { key: 'hasGps', label: 'Montre GPS / Application de suivi' },
                { key: 'hasHeartRateMonitor', label: 'Capteur de fréquence cardiaque' },
                { key: 'hasPowerMeter', label: 'Capteur de puissance (vélo)' },
                { key: 'hasIndoorTrainer', label: 'Home trainer / Vélo d\'intérieur' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData[key]}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full" size="lg">
            {saving ? 'Enregistrement...' : 'Sauvegarder'}
          </Button>
        </form>
      </Card>
    </div>
  );
}