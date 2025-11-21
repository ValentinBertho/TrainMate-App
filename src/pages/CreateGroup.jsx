import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsAPI } from '../lib/groups';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Alert } from '../components/Alert';
import { ArrowLeft } from 'lucide-react';

export default function CreateGroup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Training',
    sport: 'Running',
    targetLevel: 'Intermediate',
    maxMembers: 20,
    isPrivate: false,
    isFree: true,
    monthlyFee: null,
    city: '',
    meetingPoint: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const group = await groupsAPI.createGroup(formData);
      navigate(`/groups/${group.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 sm:pb-6">
      <button
        onClick={() => navigate('/coach/groups')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        <span>Retour</span>
      </button>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Créer un groupe</h1>
        <p className="text-gray-600 mt-2">Organise des entraînements collectifs</p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Informations de base</h3>
            
            <Input
              label="Nom du groupe *"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Trail du dimanche"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Décris ton groupe, le type d'entraînement, l'ambiance..."
                required
              />
            </div>
          </div>

          {/* Paramètres */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Paramètres</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de groupe *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Training">Entraînement</option>
                  <option value="Event">Événement</option>
                  <option value="Social">Loisir</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport *
                </label>
                <select
                  value={formData.sport}
                  onChange={(e) => setFormData(prev => ({ ...prev, sport: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Running">Course à pied</option>
                  <option value="Cycling">Cyclisme</option>
                  <option value="Both">Les deux</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau cible *
                </label>
                <select
                  value={formData.targetLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetLevel: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Beginner">Débutant</option>
                  <option value="Intermediate">Intermédiaire</option>
                  <option value="Advanced">Avancé</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <Input
                label="Nombre max de membres *"
                type="number"
                min="2"
                max="100"
                value={formData.maxMembers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                required
              />
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Localisation</h3>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ville"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Paris"
              />

              <Input
                label="Point de RDV habituel"
                value={formData.meetingPoint}
                onChange={(e) => setFormData(prev => ({ ...prev, meetingPoint: e.target.value }))}
                placeholder="Parc de la Villette"
              />
            </div>
          </div>

          {/* Tarification */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Tarification</h3>

            <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.isFree}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  isFree: e.target.checked,
                  monthlyFee: e.target.checked ? null : prev.monthlyFee
                }))}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-gray-900">Groupe gratuit</span>
            </label>

            {!formData.isFree && (
              <Input
                label="Tarif mensuel (€)"
                type="number"
                min="0"
                step="0.01"
                value={formData.monthlyFee || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  monthlyFee: parseFloat(e.target.value) 
                }))}
                placeholder="20"
                required
              />
            )}
          </div>

          {/* Visibilité */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Visibilité</h3>

            <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <div>
                <span className="text-gray-900 font-medium block">Groupe privé</span>
                <span className="text-sm text-gray-500">
                  Les demandes devront être approuvées
                </span>
              </div>
            </label>
          </div>

          <div className="flex gap-3 pt-6">
            <Button type="submit" disabled={loading} className="flex-1" size="lg">
              {loading ? 'Création...' : 'Créer le groupe'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/coach/groups')}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}