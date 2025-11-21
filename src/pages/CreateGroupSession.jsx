import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupsAPI } from '../lib/groups';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Alert } from '../components/Alert';
import { ArrowLeft } from 'lucide-react';

export default function CreateGroupSession() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    groupId: groupId,
    title: '',
    description: '',
    type: 'Endurance',
    scheduledDate: '',
    meetingPoint: '',
    meetingTime: '',
    durationMinutes: 60,
    distanceKm: null,
    pace: '',
    instructions: '',
    isMandatory: false
  });

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    try {
      const data = await groupsAPI.getGroupDetail(groupId);
      setGroup(data);
      // Pré-remplir le point de RDV si défini
      if (data.meetingPoint) {
        setFormData(prev => ({ ...prev, meetingPoint: data.meetingPoint }));
      }
    } catch (err) {
      console.error('Error loading group:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const session = await groupsAPI.createSession(formData);
      navigate(`/groups/sessions/${session.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (!group) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 sm:pb-6">
      <button
        onClick={() => navigate(`/groups/${groupId}`)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        <span>Retour au groupe</span>
      </button>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Créer une séance</h1>
        <p className="text-gray-600 mt-2">Pour le groupe: {group.name}</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <Input
              label="Titre de la séance *"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Sortie longue dimanche"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Décris la séance..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de séance *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Endurance">Endurance</option>
                <option value="Interval">Fractionné</option>
                <option value="Tempo">Tempo</option>
                <option value="LongRun">Sortie longue</option>
                <option value="Recovery">Récupération</option>
                <option value="Strength">Renforcement</option>
              </select>
            </div>
          </div>

          {/* Date et heure */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Date et heure</h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date *"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                required
              />

              <Input
                label="Heure de RDV"
                type="time"
                value={formData.meetingTime}
                onChange={(e) => setFormData(prev => ({ ...prev, meetingTime: e.target.value }))}
                placeholder="09:00"
              />
            </div>
          </div>

          {/* Lieu */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Lieu</h3>

            <Input
              label="Point de rendez-vous"
              value={formData.meetingPoint}
              onChange={(e) => setFormData(prev => ({ ...prev, meetingPoint: e.target.value }))}
              placeholder="Parc de la Villette"
            />
          </div>

          {/* Détails de la séance */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Détails de la séance</h3>

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Durée (min)"
                type="number"
                min="0"
                value={formData.durationMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) }))}
              />

              <Input
                label="Distance (km)"
                type="number"
                step="0.1"
                min="0"
                value={formData.distanceKm || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  distanceKm: e.target.value ? parseFloat(e.target.value) : null 
                }))}
                placeholder="10"
              />

              <Input
                label="Allure"
                value={formData.pace}
                onChange={(e) => setFormData(prev => ({ ...prev, pace: e.target.value }))}
                placeholder="5:30 min/km"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consignes
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Consignes spécifiques, échauffement, etc..."
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.isMandatory}
                onChange={(e) => setFormData(prev => ({ ...prev, isMandatory: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div>
                <span className="text-gray-900 font-medium block">Séance obligatoire</span>
                <span className="text-sm text-gray-500">
                  Tous les membres devront confirmer leur présence
                </span>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-6">
            <Button type="submit" disabled={loading} className="flex-1" size="lg">
              {loading ? 'Création...' : 'Créer la séance'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/groups/${groupId}`)}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}