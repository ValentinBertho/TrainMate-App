import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupsAPI } from '../lib/groups';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Users, Calendar, Plus, Settings } from 'lucide-react';

export default function CoachGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await groupsAPI.getCoachGroups();
      setGroups(data);
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes groupes</h1>
          <p className="text-gray-600 mt-2">Gère tes groupes d'entraînement</p>
        </div>
        <Link to="/coach/groups/create">
          <Button size="lg">
            <Plus size={20} className="mr-2" />
            Créer un groupe
          </Button>
        </Link>
      </div>

      {groups.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aucun groupe créé
            </h3>
            <p className="text-gray-600 mb-6">
              Crée ton premier groupe pour commencer à entraîner des athlètes ensemble
            </p>
            <Link to="/coach/groups/create">
              <Button>Créer mon premier groupe</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <CoachGroupCard key={group.id} group={group} onUpdate={loadGroups} />
          ))}
        </div>
      )}
    </div>
  );
}

function CoachGroupCard({ group, onUpdate }) {
  const sportEmojis = {
    Running: '🏃‍♂️',
    Cycling: '🚴‍♂️',
    Both: '🏃‍♂️🚴‍♂️'
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <span className="text-4xl">{sportEmojis[group.sport]}</span>
          <Link to={`/coach/groups/${group.id}/edit`}>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings size={20} className="text-gray-600" />
            </button>
          </Link>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Membres</span>
            <span className="font-medium text-gray-900">
              {group.currentMembers}/{group.maxMembers}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(group.currentMembers / group.maxMembers) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Link to={`/groups/${group.id}`} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              <Users size={16} className="mr-2" />
              Voir
            </Button>
          </Link>
          <Link to={`/coach/groups/${group.id}/session/create`} className="flex-1">
            <Button className="w-full" size="sm">
              <Calendar size={16} className="mr-2" />
              Séance
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}