import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupsAPI } from '../lib/groups';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Target,
  CheckCircle,
  XCircle,
  HelpCircle,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function SessionDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    setLoading(true);
    try {
      const data = await groupsAPI.getSessionDetail(sessionId);
      setSession(data);
    } catch (err) {
      console.error('Error loading session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async (status) => {
    setUpdating(true);
    try {
      await groupsAPI.updateAttendance(sessionId, status);
      await loadSession();
    } catch (err) {
      console.error('Error updating attendance:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteSession = async (data) => {
    try {
      await groupsAPI.completeSession(sessionId, data);
      setShowCompleteModal(false);
      await loadSession();
    } catch (err) {
      console.error('Error completing session:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert type="error">Séance non trouvée</Alert>
      </div>
    );
  }

  const typeIcons = {
    Endurance: '🏃',
    Interval: '⚡',
    Tempo: '🔥',
    LongRun: '📏',
    Recovery: '💆',
    Rest: '😴',
    Strength: '💪'
  };

  const isPast = new Date(session.scheduledDate) < new Date();
  const canComplete = session.userAttendanceStatus === 'Confirmed' && isPast;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 sm:pb-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        <span>Retour</span>
      </button>

      {/* Header */}
      <Card className="p-8">
        <div className="flex items-start space-x-4 mb-6">
          <span className="text-6xl">{typeIcons[session.type]}</span>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{session.title}</h1>
            <p className="text-gray-600">{session.description}</p>
          </div>
        </div>

        {session.isCancelled && (
          <Alert type="error" className="mb-6">
            Cette séance a été annulée
          </Alert>
        )}

        {/* Date et lieu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <Clock className="text-blue-600" size={20} />
            <div>
              <div className="text-sm text-gray-600">Date</div>
              <div className="font-medium text-gray-900">
                {format(new Date(session.scheduledDate), 'EEEE d MMMM', { locale: fr })}
              </div>
              {session.meetingTime && (
                <div className="text-sm text-gray-600">RDV à {session.meetingTime}</div>
              )}
            </div>
          </div>

          {session.meetingPoint && (
            <div className="flex items-center space-x-3">
              <MapPin className="text-blue-600" size={20} />
              <div>
                <div className="text-sm text-gray-600">Lieu</div>
                <div className="font-medium text-gray-900">{session.meetingPoint}</div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <Target className="text-blue-600" size={20} />
            <div>
              <div className="text-sm text-gray-600">Durée</div>
              <div className="font-medium text-gray-900">
                {session.durationMinutes} min
                {session.distanceKm && ` • ${session.distanceKm} km`}
              </div>
              {session.pace && (
                <div className="text-sm text-gray-600">{session.pace}</div>
              )}
            </div>
          </div>
        </div>

        {/* Consignes */}
        {session.instructions && (
          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <h3 className="font-bold text-gray-900 mb-2">📝 Consignes</h3>
            <p className="text-gray-700 whitespace-pre-line">{session.instructions}</p>
          </div>
        )}

        {/* Actions de présence */}
        {!session.isCancelled && !isPast && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900">Tu seras là ?</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => handleUpdateAttendance('Confirmed')}
                disabled={updating}
                variant={session.userAttendanceStatus === 'Confirmed' ? 'primary' : 'outline'}
                className="flex items-center justify-center space-x-2"
              >
                <CheckCircle size={20} />
                <span>Oui</span>
              </Button>
              <Button
                onClick={() => handleUpdateAttendance('Maybe')}
                disabled={updating}
                variant={session.userAttendanceStatus === 'Maybe' ? 'primary' : 'outline'}
                className="flex items-center justify-center space-x-2"
              >
                <HelpCircle size={20} />
                <span>Peut-être</span>
              </Button>
              <Button
                onClick={() => handleUpdateAttendance('Absent')}
                disabled={updating}
                variant={session.userAttendanceStatus === 'Absent' ? 'primary' : 'outline'}
                className="flex items-center justify-center space-x-2"
              >
                <XCircle size={20} />
                <span>Non</span>
              </Button>
            </div>
          </div>
        )}

        {/* Marquer comme effectuée */}
        {canComplete && session.userAttendanceStatus !== 'Completed' && (
          <div className="mt-4">
            <Button
              onClick={() => setShowCompleteModal(true)}
              className="w-full"
              size="lg"
            >
              Marquer comme effectuée
            </Button>
          </div>
        )}
      </Card>

      {/* Présences */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Présences ({session.confirmedCount + session.maybeCount})
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{session.confirmedCount}</div>
            <div className="text-sm text-green-700">Confirmés</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">{session.maybeCount}</div>
            <div className="text-sm text-yellow-700">Peut-être</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{session.absentCount}</div>
            <div className="text-sm text-red-700">Absents</div>
          </div>
        </div>
      </Card>

      {/* Complete Modal */}
      {showCompleteModal && (
        <CompleteSessionModal
          session={session}
          onClose={() => setShowCompleteModal(false)}
          onComplete={handleCompleteSession}
        />
      )}
    </div>
  );
}

function CompleteSessionModal({ session, onClose, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    actualDurationMinutes: session.durationMinutes || 60,
    actualDistanceKm: session.distanceKm || 0,
    feelRating: 3,
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onComplete(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Comment s'est passée la séance ?
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durée réelle (minutes)
            </label>
            <input
              type="number"
              value={formData.actualDurationMinutes}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                actualDurationMinutes: parseInt(e.target.value) 
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distance réelle (km)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.actualDistanceKm}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                actualDistanceKm: parseFloat(e.target.value) 
              }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment tu t'es senti ? (1-5)
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, feelRating: rating }))}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                    formData.feelRating === rating
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {'⭐'.repeat(rating)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Ressenti, commentaires..."
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Enregistrement...' : 'Valider'}
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