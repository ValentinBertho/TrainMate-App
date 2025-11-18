// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userPlansAPI } from '../lib/userPlans';
import { sessionsAPI } from '../lib/sessions';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight 
} from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Dashboard() {
  const user = useAuthStore(state => state.user);
  const [loading, setLoading] = useState(true);
  const [activePlan, setActivePlan] = useState(null);
  const [weekSummary, setWeekSummary] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Plan actif
      try {
        const plan = await userPlansAPI.getActive();
        setActivePlan(plan);
      } catch (err) {
        // Pas de plan actif
        setActivePlan(null);
      }

      // Résumé de la semaine
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const summary = await sessionsAPI.getWeekSummary(weekStart);
      setWeekSummary(summary);

      // Prochaines séances (7 jours)
      const today = new Date();
      const nextWeek = addDays(today, 7);
      const sessions = await sessionsAPI.getCalendar(today, nextWeek);
      setUpcomingSessions(sessions.filter(s => s.status === 'Planned').slice(0, 3));

    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bonjour {user?.firstName} 👋
        </h1>
        <p className="text-gray-600 mt-1">
          {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
        </p>
      </div>

      {/* No active plan */}
      {!activePlan && (
        <Alert type="info">
          <div className="flex items-center justify-between">
            <span>Tu n'as pas encore de plan d'entraînement</span>
            <Link to="/plans">
              <Button size="sm">Choisir un plan</Button>
            </Link>
          </div>
        </Alert>
      )}

      {/* Active Plan Summary */}
      {activePlan && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{activePlan.planName}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Semaine {activePlan.currentWeek} • {activePlan.completionRate}% complété
              </p>
            </div>
            <Link to="/calendar">
              <Button size="sm" variant="outline">
                <Calendar size={16} className="mr-2" />
                Voir
              </Button>
            </Link>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${activePlan.completionRate}%` }}
            />
          </div>
        </Card>
      )}

      {/* Week Summary Stats */}
      {weekSummary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={CheckCircle2}
            label="Séances complétées"
            value={weekSummary.completedSessions}
            total={weekSummary.totalSessions}
            color="green"
          />
          <StatCard
            icon={Clock}
            label="Minutes d'entraînement"
            value={weekSummary.totalMinutes}
            suffix="min"
            color="blue"
          />
          <StatCard
            icon={Target}
            label="Distance parcourue"
            value={weekSummary.totalDistanceKm.toFixed(1)}
            suffix="km"
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            label="Taux de complétion"
            value={Math.round(weekSummary.completionRate)}
            suffix="%"
            color="orange"
          />
        </div>
      )}

      {/* Upcoming Sessions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Prochaines séances</h2>
          <Link to="/calendar">
            <Button size="sm" variant="outline">Voir tout</Button>
          </Link>
        </div>

        {upcomingSessions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucune séance planifiée pour les 7 prochains jours
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/plans">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Explorer les plans</h3>
                <p className="text-sm text-gray-600 mt-1">Trouve ton prochain défi</p>
              </div>
              <ArrowRight className="text-gray-400" />
            </div>
          </Card>
        </Link>

        <Link to="/profile">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Mon profil</h3>
                <p className="text-sm text-gray-600 mt-1">Personnalise tes préférences</p>
              </div>
              <ArrowRight className="text-gray-400" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, total, suffix = '', color }) {
  const colors = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <Card className="p-4">
      <div className={`inline-flex p-2 rounded-lg ${colors[color]} mb-3`}>
        <Icon size={20} />
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {value}{suffix}
        {total && <span className="text-lg text-gray-400">/{total}</span>}
      </div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </Card>
  );
}

function SessionCard({ session }) {
  const typeIcons = {
    Endurance: '🏃',
    Interval: '⚡',
    Tempo: '🔥',
    LongRun: '📏',
    Recovery: '💆',
    Rest: '😴',
    Strength: '💪'
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{typeIcons[session.sessionType]}</span>
        <div>
          <div className="font-medium text-gray-900">{session.sessionName}</div>
          <div className="text-sm text-gray-600">
            {format(new Date(session.scheduledDate), 'EEEE d MMM', { locale: fr })}
            {session.durationMinutes && ` • ${session.durationMinutes}min`}
            {session.distanceKm && ` • ${session.distanceKm}km`}
          </div>
        </div>
      </div>
      <Link to="/calendar">
        <Button size="sm" variant="outline">Détails</Button>
      </Link>
    </div>
  );
}