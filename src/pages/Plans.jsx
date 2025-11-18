import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { plansAPI } from '../lib/plans';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Search, Filter, Clock, Calendar, Target } from 'lucide-react';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sport: '',
    level: '',
    freeOnly: false
  });

  useEffect(() => {
    loadPlans();
  }, [filters]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await plansAPI.getAll(filters);
      setPlans(data);
    } catch (err) {
      console.error('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Plans d'entraînement</h1>
        <p className="text-gray-600 mt-2">Choisis ton prochain défi</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            value={filters.sport}
            onChange={(e) => handleFilterChange('sport', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les sports</option>
            <option value="Running">Course à pied</option>
            <option value="Cycling">Cyclisme</option>
            <option value="Both">Les deux</option>
          </select>

          <select
            value={filters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous niveaux</option>
            <option value="Beginner">Débutant</option>
            <option value="Intermediate">Intermédiaire</option>
            <option value="Advanced">Avancé</option>
            <option value="Expert">Expert</option>
          </select>

          <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={filters.freeOnly}
              onChange={(e) => handleFilterChange('freeOnly', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-gray-700">Gratuits uniquement</span>
          </label>
        </div>
      </Card>

      {/* Plans Grid */}
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : plans.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Aucun plan ne correspond à tes critères</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan }) {
  const navigate = useNavigate();

  const sportEmojis = {
    Running: '🏃‍♂️',
    Cycling: '🚴‍♂️',
    Both: '🏃‍♂️🚴‍♂️'
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
          <span className="text-4xl">{sportEmojis[plan.sport]}</span>
          {plan.isFree ? (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
              Gratuit
            </span>
          ) : (
            <span className="text-lg font-bold text-gray-900">{plan.price}€</span>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{plan.description}</p>

        <div className="flex items-center space-x-2 mb-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${levelColors[plan.targetLevel]}`}>
            {plan.targetLevel === 'Beginner' && 'Débutant'}
            {plan.targetLevel === 'Intermediate' && 'Intermédiaire'}
            {plan.targetLevel === 'Advanced' && 'Avancé'}
            {plan.targetLevel === 'Expert' && 'Expert'}
          </span>
        </div>

        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Calendar size={16} />
            <span>{plan.durationWeeks} semaines</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={16} />
            <span>{plan.sessionsPerWeek} séances/semaine</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target size={16} />
            <span className="truncate">{plan.goal}</span>
          </div>
        </div>

        <Button
          onClick={() => navigate(`/plans/${plan.id}`)}
          className="w-full"
        >
          Voir les détails
        </Button>
      </div>
    </Card>
  );
}