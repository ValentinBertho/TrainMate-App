// src/pages/Calendar.jsx
import { useState, useEffect } from 'react';
import { sessionsAPI } from '../lib/sessions';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2,
  XCircle,
  Clock,
  Target
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth
} from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [currentMonth]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
      const data = await sessionsAPI.getCalendar(start, end);
      setSessions(data);
    } catch (err) {
      console.error('Error loading sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handleSessionClick = (session) => {
    setSelectedSession(session);
    setShowModal(true);
  };

  const handleCompleteSession = async (data) => {
    try {
      await sessionsAPI.complete(selectedSession.id, data);
      setShowModal(false);
      loadSessions();
    } catch (err) {
      console.error('Error completing session:', err);
    }
  };

  const handleSkipSession = async () => {
    try {
      await sessionsAPI.skip(selectedSession.id);
      setShowModal(false);
      loadSessions();
    } catch (err) {
      console.error('Error skipping session:', err);
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getSessionsForDay = (day) => {
    return sessions.filter(s => isSameDay(new Date(s.scheduledDate), day));
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Calendrier</h1>
        <Button size="sm" onClick={handleToday}>
          Aujourd'hui
        </Button>
      </div>

      {/* Month Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h2>
          
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </Card>

      {/* Calendar Grid */}
      <Card className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const daySessions = getSessionsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={idx}
                className={`min-h-24 p-2 border rounded-lg ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-1">
                  {daySessions.map(session => (
                    <SessionBadge
                      key={session.id}
                      session={session}
                      onClick={() => handleSessionClick(session)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Session Detail Modal */}
      {showModal && selectedSession && (
        <SessionModal
          session={selectedSession}
          onClose={() => setShowModal(false)}
          onComplete={handleCompleteSession}
          onSkip={handleSkipSession}
        />
      )}
    </div>
  );
}

function SessionBadge({ session, onClick }) {
  const statusColors = {
    Planned: 'bg-blue-100 text-blue-700',
    Completed: 'bg-green-100 text-green-700',
    Skipped: 'bg-gray-100 text-gray-600'
  };

  const statusIcons = {
    Planned: Clock,
    Completed: CheckCircle2,
    Skipped: XCircle
  };

  const Icon = statusIcons[session.status];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-2 py-1 rounded text-xs font-medium ${statusColors[session.status]} hover:opacity-80 transition-opacity`}
    >
      <div className="flex items-center space-x-1">
        <Icon size={12} />
        <span className="truncate">{session.sessionName}</span>
      </div>
    </button>
  );
}

function SessionModal({ session, onClose, onComplete, onSkip }) {
  const [completing, setCompleting] = useState(false);
  const [formData, setFormData] = useState({
    actualDurationMinutes: session.durationMinutes || 30,
    actualDistanceKm: session.distanceKm || 0,
    notes: '',
    feelRating: 3
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCompleting(true);
    await onComplete(formData);
    setCompleting(false);
  };

  const isCompleted = session.status === 'Completed';
  const isSkipped = session.status === 'Skipped';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{session.sessionName}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {format(new Date(session.scheduledDate), 'EEEE d MMMM', { locale: fr })}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* Session details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-2 text-gray-700">
            <Target size={16} />
            <span className="text-sm">Type: {session.sessionType}</span>
          </div>
          {session.durationMinutes && (
            <div className="flex items-center space-x-2 text-gray-700">
              <Clock size={16} />
              <span className="text-sm">{session.durationMinutes} minutes</span>
            </div>
          )}
          {session.distanceKm && (
            <div className="flex items-center space-x-2 text-gray-700">
              <Target size={16} />
              <span className="text-sm">{session.distanceKm} km</span>
            </div>
          )}
          {session.intensity && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900"><strong>Intensité:</strong> {session.intensity}</p>
            </div>
          )}
        </div>

        {/* Completed info */}
        {isCompleted && (
          <Alert type="success">
            Séance complétée le {format(new Date(session.completedAt), 'dd/MM/yyyy à HH:mm')}
            {session.feelRating && ` • Ressenti: ${'⭐'.repeat(session.feelRating)}`}
          </Alert>
        )}

        {/* Skipped info */}
        {isSkipped && (
          <Alert type="warning">
            Séance sautée
          </Alert>
        )}

        {/* Complete form */}
        {session.status === 'Planned' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée réelle (minutes)
              </label>
              <input
                type="number"
                value={formData.actualDurationMinutes}
                onChange={e => setFormData(prev => ({ ...prev, actualDurationMinutes: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                onChange={e => setFormData(prev => ({ ...prev, actualDistanceKm: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                Notes (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Comment s'est passée la séance ?"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={completing} className="flex-1">
                {completing ? 'Enregistrement...' : 'Marquer comme complétée'}
              </Button>
              <Button type="button" variant="secondary" onClick={onSkip}>
                Sauter
              </Button>
            </div>
          </form>
        )}

        {(isCompleted || isSkipped) && (
          <Button onClick={onClose} className="w-full">
            Fermer
          </Button>
        )}
      </Card>
    </div>
  );
}