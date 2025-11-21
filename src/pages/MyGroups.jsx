import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groupsAPI } from '../lib/groups';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { Users, Calendar, ArrowRight } from 'lucide-react';

export default function MyGroups() {
  const [groups, setGroups] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [groupsData, sessionsData] = await Promise.all([
        groupsAPI.getMyGroups(),
        groupsAPI.getUpcomingSessions()
      ]);
      setGroups(groupsData);
      setUpcomingSessions(sessionsData);
    } catch (err) {
      console.error('Error loading data:', err);
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
        <h1 className="text-3xl font-bold text-gray-900">Mes groupes</h1>
        <Link to="/groups">
          <Button size="sm" variant="outline">Explorer</Button>
        </Link>
      </div>

      {groups.length === 0 ? (
        <Alert type="info">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold mb-1">Rejoins un groupe</h3>
              <p>Entraîne-toi avec d'autres passionnés près de chez toi</p>
            </div>
            <Link to="/groups">
              <Button>Parcourir</Button>
            </Link>
          </div>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <MyGroupCard key={group.id} group={group} />
          ))}
        </div>
      )}

      {/* Prochaines séances */}
      {upcomingSessions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Prochaines séances</h2>
          <div className="space-y-3">
            {upcomingSessions.slice(0, 5).map(session => (
              <UpcomingSessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MyGroupCard({ group }) {
  const sportEmojis = {
    Running: '🏃‍♂️',
    Cycling: '🚴‍♂️',
    Both: '🏃‍♂️🚴‍♂️'
  };

  return (
    <Link to={`/groups/${group.id}`}>
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <span className="text-4xl">{sportEmojis[group.sport]}</span>
          <Users size={20} className="text-gray-400" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{group.currentMembers} membres</span>
          <ArrowRight size={16} />
        </div>
      </Card>
    </Link>
  );
}