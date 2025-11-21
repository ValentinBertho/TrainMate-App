import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coachesAPI } from '../lib/coaches';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { ArrowLeft, Award, Users, Star, DollarSign } from 'lucide-react';

export default function CoachProfile() {
  const { coachId } = useParams();
  const navigate = useNavigate();
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    loadCoach();
  }, [coachId]);

  const loadCoach = async () => {
    setLoading(true);
    try {
      const data = await coachesAPI.getCoachProfile(coachId);
      setCoach(data);
    } catch (err) {
      console.error('Error loading coach:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!coach) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert type="error">Coach non trouvé</Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 sm:pb-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/coaches')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        <span>Retour à la liste</span>
      </button>

      {/* Header */}
      <Card className="p-8">
        <div className="flex items-start space-x-6 mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {coach.coachName.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{coach.coachName}</h1>
            {coach.averageRating && (
              <div className="flex items-center space-x-2 mb-4">
                <Star size={20} className="text-yellow-500 fill-current" />
                <span className="text-lg font-medium">{coach.averageRating.toFixed(1)}</span>
                <span className="text-gray-500">• {coach.totalAthletes} athlètes</span>
              </div>
            )}
            
            {coach.acceptsNewAthletes ? (
              <Button onClick={() => setShowRequestModal(true)} size="lg">
                Demander un coaching
              </Button>
            ) : (
              <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg inline-block">
                N'accepte plus de nouveaux athlètes
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Award className="text-blue-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{coach.yearsOfExperience}</div>
            <div className="text-sm text-gray-600">ans d'expérience</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Users className="text-blue-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{coach.totalAthletes}</div>
            <div className="text-sm text-gray-600">athlètes coachés</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {coach.monthlyRate ? `${coach.monthlyRate}€` : 'Gratuit'}
            </div>
            <div className="text-sm text-gray-600">par mois</div>
          </div>
        </div>
      </Card>

      {/* Bio */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">À propos</h2>
        <p className="text-gray-700 whitespace-pre-line">{coach.bio}</p>
      </Card>

      {/* Spécialités */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Spécialités</h2>
        <div className="flex flex-wrap gap-2">
          {coach.specialties.map((spec, idx) => (
            <span
              key={idx}
              className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-full"
            >
              {spec}
            </span>
          ))}
        </div>
      </Card>

      {/* Tarifs */}
      {(coach.monthlyRate || coach.sessionRate) && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tarifs</h2>
          <div className="space-y-3">
            {coach.monthlyRate && (
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Suivi mensuel</span>
                <span className="text-xl font-bold text-blue-600">{coach.monthlyRate}€/mois</span>
              </div>
            )}
            {coach.sessionRate && (
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Séance ponctuelle</span>
                <span className="text-xl font-bold text-blue-600">{coach.sessionRate}€</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <RequestCoachingModal
          coach={coach}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setShowRequestModal(false);
            navigate('/dashboard');
          }}
        />
      )}
    </div>
  );
}

function RequestCoachingModal({ coach, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coachingType, setCoachingType] = useState('Monthly');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await coachesAPI.requestCoaching({
        coachId: coach.id,
        coachingType,
        message
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Demander un coaching avec {coach.coachName}
        </h2>

        {error && (
          <div className="mb-4">
            <Alert type="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de coaching
            </label>
            <select
              value={coachingType}
              onChange={(e) => setCoachingType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Free">Gratuit</option>
              <option value="PerSession">Par séance ({coach.sessionRate}€)</option>
              <option value="Monthly">Mensuel ({coach.monthlyRate}€/mois)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (optionnel)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Parle un peu de toi et de tes objectifs..."
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Envoi...' : 'Envoyer la demande'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}