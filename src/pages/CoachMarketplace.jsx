import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coachesAPI } from '../lib/coaches';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Award, MapPin, DollarSign, Users, Star } from 'lucide-react';

export default function CoachMarketplace() {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  const specialties = [
    'Running',
    'Trail',
    'Marathon',
    'Cyclisme',
    'Triathlon',
    'Ultra',
    'Débutant'
  ];

  useEffect(() => {
    loadCoaches();
  }, [selectedSpecialty]);

  const loadCoaches = async () => {
    setLoading(true);
    try {
      const data = await coachesAPI.getMarketplace(selectedSpecialty || null);
      setCoaches(data);
    } catch (err) {
      console.error('Error loading coaches:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trouve ton coach</h1>
        <p className="text-gray-600 mt-2">
          Connecte-toi avec des coachs expérimentés pour atteindre tes objectifs
        </p>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSpecialty('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedSpecialty === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedSpecialty === spec
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </Card>

      {/* Liste des coachs */}
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : coaches.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">Aucun coach disponible pour cette spécialité</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coaches.map((coach) => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>
      )}
    </div>
  );
}

function CoachCard({ coach }) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Avatar */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {coach.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{coach.name}</h3>
            {coach.averageRating && (
              <div className="flex items-center space-x-1 mt-1">
                <Star size={16} className="text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{coach.averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{coach.bio}</p>

        {/* Spécialités */}
        <div className="flex flex-wrap gap-2 mb-4">
          {coach.specialties.slice(0, 3).map((spec, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
            >
              {spec}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Award size={16} />
            <span>{coach.yearsOfExperience} ans d'expérience</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users size={16} />
            <span>{coach.totalAthletes} athlètes</span>
          </div>
          {coach.monthlyRate && (
            <div className="flex items-center space-x-2">
              <DollarSign size={16} />
              <span>À partir de {coach.monthlyRate}€/mois</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/coaches/${coach.id}`)}
            className="flex-1"
            size="sm"
          >
            Voir le profil
          </Button>
        </div>

        {!coach.acceptsNewAthletes && (
          <div className="mt-3 text-center text-xs text-red-600">
            N'accepte plus de nouveaux athlètes
          </div>
        )}
      </div>
    </Card>
  );
}