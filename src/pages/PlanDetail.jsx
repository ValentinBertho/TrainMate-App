// src/pages/PlanDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { plansAPI } from '../lib/plans';
import { userPlansAPI } from '../lib/userPlans';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Target,
  ChevronDown,
  ChevronUp,
  Play
} from 'lucide-react';

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState([1]);
  const [error, setError] = useState('');
  const [showStartModal, setShowStartModal] = useState(false);
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadPlanDetail();
  }, [id]);

  const loadPlanDetail = async () => {
    setLoading(true);
    try {
      const data = await plansAPI.getDetail(id);
      setPlan(data);
    } catch (err) {
      console.error('Error loading plan:', err);
      setError('Impossible de charger le plan');
    } finally {
      setLoading(false);
    }
  };

  const toggleWeek = (weekNumber) => {
    setExpandedWeeks(prev =>
      prev.includes(weekNumber)
        ? prev.filter(w => w !== weekNumber)
        : [...prev, weekNumber]
    );
  };

  const handleStartPlan = async () => {
    setAssigning(true);
    setError('');

    try {
      await userPlansAPI.assign({
        trainingPlanId: plan.id,
        startDate: new Date(startDate).toISOString()
      });
      navigate('/dashboard');
    } catch (err) {
      setError('Une erreur est survenue. Réessaie.');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error && !plan) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert type="error">{error}</Alert>
      </div>
    );
  }

  const sportEmojis = {
    Running: '🏃‍♂️',
    Cycling: '🚴‍♂️',
    Both: '🏃‍♂️🚴‍♂️'
  };

  const levelLabels = {
    Beginner: 'Débutant',
    Intermediate: 'Intermédiaire',
    Advanced: 'Avancé',
    Expert: 'Expert'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 sm:pb-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/plans')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        <span>Retour aux plans</span>
      </button>

      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-5xl">{sportEmojis[plan.sport]}</span>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1>
                <p className="text-gray-600 mt-1">{levelLabels[plan.targetLevel]}</p>
              </div>
            </div>
            <p className="text-gray-700 mt-4">{plan.description}</p>
          </div>

          <div className="text-right">
            {plan.isFree ? (
              <span className="inline-block px-4 py-2 bg-green-100 text-green-700 font-bold rounded-full">
                Gratuit
              </span>
            ) : (
              <div>
                <span className="text-3xl font-bold text-gray-900">{plan.price}€</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{plan.durationWeeks}</div>
            <div className="text-sm text-gray-600">semaines</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Clock className="text-blue-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{plan.sessionsPerWeek}</div>
            <div className="text-sm text-gray-600">séances/semaine</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Target className="text-blue-600" size={24} />
            </div>
            <div className="text-sm font-bold text-gray-900 mt-2">{plan.goal}</div>
          </div>
        </div>

        {/* Start button */}
        <Button
          onClick={() => setShowStartModal(true)}
          className="w-full mt-6"
          size="lg"
        >
          <Play size={20} className="mr-2" />
          Commencer ce plan
        </Button>
      </Card>

      {/* Program details */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Programme détaillé</h2>
        <div className="space-y-3">
          {plan.weeks.map((week) => (
            <WeekCard
              key={week.weekNumber}
              week={week}
              isExpanded={expandedWeeks.includes(week.weekNumber)}
              onToggle={() => toggleWeek(week.weekNumber)}
            />
          ))}
        </div>
      </div>

      {/* Start Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Commencer le plan
            </h2>

            {error && (
              <div className="mb-4">
                <Alert type="error">{error}</Alert>
              </div>
            )}

            <p className="text-gray-600 mb-4">
              Choisis la date de début de ton entraînement. Les séances seront automatiquement ajoutées à ton calendrier.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleStartPlan}
                disabled={assigning}
                className="flex-1"
              >
                {assigning ? 'Démarrage...' : 'Confirmer'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowStartModal(false)}
                disabled={assigning}
              >
                Annuler
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function WeekCard({ week, isExpanded, onToggle }) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">{week.weekNumber}</span>
          </div>
          <div className="text-left">
            <div className="font-bold text-gray-900">Semaine {week.weekNumber}</div>
            {week.description && (
              <div className="text-sm text-gray-600">{week.description}</div>
            )}
          </div>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="space-y-3">
            {week.sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function SessionCard({ session }) {
  const typeEmojis = {
    Endurance: '🏃',
    Interval: '⚡',
    Tempo: '🔥',
    LongRun: '📏',
    Recovery: '💆',
    Rest: '😴',
    Strength: '💪'
  };

  const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-start space-x-3">
        <span className="text-3xl">{typeEmojis[session.type]}</span>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-600">
              {dayLabels[session.dayOfWeek % 7]}
            </span>
            <span className="text-sm text-gray-400">•</span>
            <span className="font-bold text-gray-900">{session.name}</span>
          </div>

          <p className="text-sm text-gray-600 mb-2">{session.description}</p>

          <div className="flex flex-wrap gap-2 text-xs">
            {session.durationMinutes && (
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                {session.durationMinutes} min
              </span>
            )}
            {session.distanceKm && (
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                {session.distanceKm} km
              </span>
            )}
            {session.intensity && (
              <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded">
                {session.intensity}
              </span>
            )}
          </div>

          {session.instructions && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
              💡 {session.instructions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}