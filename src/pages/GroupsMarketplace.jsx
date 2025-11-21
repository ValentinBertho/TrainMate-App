import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupsAPI } from '../lib/groups';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Users, MapPin, DollarSign, Lock, Globe } from 'lucide-react';

export default function GroupsMarketplace() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    sport: ''
  });

  const sports = ['Running', 'Cycling', 'Both'];
  const cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux'];

  useEffect(() => {
    loadGroups();
  }, [filters]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await groupsAPI.getPublicGroups(
        filters.city || null,
        filters.sport || null
      );
      setGroups(data);
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groupes d'entraînement</h1>
          <p className="text-gray-600 mt-2">Trouve un groupe près de chez toi</p>
        </div>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={filters.sport}
            onChange={(e) => setFilters(prev => ({ ...prev, sport: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les sports</option>
            {sports.map(sport => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>

          <select
            value={filters.city}
            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Toutes les villes</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Liste des groupes */}
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : groups.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Aucun groupe disponible avec ces critères</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupCard({ group }) {
  const navigate = useNavigate();

  const sportEmojis = {
    Running: '🏃‍♂️',
    Cycling: '🚴‍♂️',
    Both: '🏃‍♂️🚴‍♂️'
  };

  const typeLabels = {
    Training: 'Entraînement',
    Event: 'Événement',
    Social: 'Loisir'
  };

  const levelColors = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-blue-100 text-blue-700',
    Advanced: 'bg-purple-100 text-purple-700',
    Expert: 'bg-red-100 text-red-700'
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <span className="text-4xl">{sportEmojis[group.sport]}</span>
          <div className="flex items-center space-x-2">
            {group.isPrivate ? (
              <Lock size={16} className="text-gray-400" />
            ) : (
              <Globe size={16} className="text-green-500" />
            )}
            {group.isFree ? (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Gratuit
              </span>
            ) : (
              <span className="text-sm font-bold text-gray-900">{group.monthlyFee}€/mois</span>
            )}
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>

        <div className="flex items-center space-x-2 mb-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${levelColors[group.targetLevel]}`}>
            {group.targetLevel === 'Beginner' && 'Débutant'}
            {group.targetLevel === 'Intermediate' && 'Intermédiaire'}
            {group.targetLevel === 'Advanced' && 'Avancé'}
            {group.targetLevel === 'Expert' && 'Expert'}
          </span>
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
            {typeLabels[group.type]}
          </span>
        </div>

        <div className="space-y-2 mb-4 text-sm text-gray-600">
          {group.city && (
            <div className="flex items-center space-x-2">
              <MapPin size={16} />
              <span>{group.city}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Users size={16} />
            <span>{group.currentMembers}/{group.maxMembers} membres</span>
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-4">
          Coach: {group.coach.name}
        </div>

        <Button
          onClick={() => navigate(`/groups/${group.id}`)}
          className="w-full"
          disabled={group.currentMembers >= group.maxMembers}
        >
          {group.currentMembers >= group.maxMembers ? 'Complet' : 'Voir le groupe'}
        </Button>
      </div>
    </Card>
  );
}