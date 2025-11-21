import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coachesAPI } from '../lib/coaches';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Calendar,
  Settings,
  TrendingUp
} from 'lucide-react';

export default function CoachDashboard() {
  const [profile, setProfile] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // Charger profil coach
      try {
        const profileData = await coachesAPI.getMyProfile();
        setProfile(profileData);
        setHasProfile(true);
      } catch (err) {
        if (err.response?.status === 404) {
          setHasProfile(false);
        }
      }

      // Charger athlètes
      if (hasProfile) {
        const athletesData = await coachesAPI.getMyAthletes();
        setAthletes(athletesData);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  // Pas de profil coach
  if (!hasProfile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Alert type="info">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold mb-1">Deviens coach sur TrainMate</h3>
              <p>Crée ton profil coach pour commencer à accompagner des athlètes</p>
            </div>
            <Link to="/coach/create-profile">
              <Button>Créer mon profil</Button>
            </Link>
          </div>
        </Alert>
      </div>
    );
  }

  const pendingRequests = athletes.filter(a => a.status === 'Pending');
  const activeAthletes = athletes.filter(a => a.status === 'Active');

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Coach</h1>
          <p className="text-gray-600 mt-1">Gère tes athlètes et ton activité</p>
        </div>
        <Link to="/coach/profile/edit">
          <Button variant="outline" size="sm">
            <Settings size={16} className="mr-2" />
            Paramètres
          </Button>
        </Link>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total athlètes"
          value={profile.totalAthletes}
          color="blue"
        />
        <StatCard
          icon={UserCheck}
          label="Actifs"
          value={activeAthletes.length}
          color="green"
        />
        <StatCard
          icon={UserPlus}
          label="Demandes"
          value={pendingRequests.length}
          color="orange"
        />
        <StatCard
          icon={TrendingUp}
          label="Groupes"
          value={profile.totalGroups}
          color="purple"
        />
      </div>

      {/* Demandes en attente */}
      {pendingRequests.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Demandes en attente ({pendingRequests.length})
          </h2>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <PendingRequestCard
                key={request.id}
                request={request}
                onUpdate={loadDashboard}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Liste des athlètes actifs */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Mes athlètes ({activeAthletes.length})
          </h2>
          <Link to="/coach/athletes">
            <Button size="sm" variant="outline">Voir tout</Button>
          </Link>
        </div>

        {activeAthletes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucun athlète actif pour le moment
          </p>
        ) : (
          <div className="space-y-3">
            {activeAthletes.slice(0, 5).map((athlete) => (
              <AthleteCard key={athlete.id} athlete={athlete} />
            ))}
          </div>
        )}
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/coach/groups/create">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Créer un groupe</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Entraîne plusieurs athlètes ensemble
                </p>
              </div>
              <Users className="text-gray-400" size={24} />
            </div>
          </Card>
        </Link>

        <Link to="/coach/plans/create">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Créer un plan</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Programme d'entraînement personnalisé
                </p>
              </div>
              <Calendar className="text-gray-400" size={24} />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <Card className="p-4">
      <div className={`inline-flex p-2 rounded-lg ${colors[color]} mb-3`}>
        <Icon size={20} />
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600 mt-1">{label}</div>
    </Card>
  );
}

function PendingRequestCard({ request, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const handleReject = async () => {
    if (!confirm('Refuser cette demande ?')) return;

    setLoading(true);
    try {
      await coachesAPI.approveRequest(request.id, { approved: false });
      onUpdate();
    } catch (err) {
      console.error('Error rejecting request:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold">
          {request.athleteName.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-gray-900">{request.athleteName}</div>
          <div className="text-sm text-gray-600">{request.email}</div>
          <div className="text-xs text-gray-500 mt-1">
            Type: {request.type === 'Monthly' ? 'Mensuel' : request.type === 'PerSession' ? 'Par séance' : 'Gratuit'}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => setShowApproveModal(true)}
          disabled={loading}
        >
          Accepter
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleReject}
          disabled={loading}
        >
          Refuser
        </Button>
      </div>

      {showApproveModal && (
        <ApproveRequestModal
          request={request}
          onClose={() => setShowApproveModal(false)}
          onSuccess={onUpdate}
        />
      )}
    </div>
  );
}

function ApproveRequestModal({ request, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [agreedRate, setAgreedRate] = useState(
    request.type === 'Monthly' ? 50 : request.type === 'PerSession' ? 30 : 0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await coachesAPI.approveRequest(request.id, {
        approved: true,
        agreedRate: request.type !== 'Free' ? agreedRate : null
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error approving request:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Accepter {request.athleteName}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {request.type !== 'Free' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarif convenu (€)
              </label>
              <input
                type="number"
                value={agreedRate}
                onChange={(e) => setAgreedRate(parseFloat(e.target.value))}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {request.type === 'Monthly' ? 'Tarif mensuel' : 'Tarif par séance'}
              </p>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              En acceptant, {request.athleteName} sera ajouté à ta liste d'athlètes.
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Confirmation...' : 'Confirmer'}
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

function AthleteCard({ athlete }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
          {athlete.athleteName.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-gray-900">{athlete.athleteName}</div>
          <div className="text-sm text-gray-600">{athlete.email}</div>
          {athlete.startedAt && (
            <div className="text-xs text-gray-500 mt-1">
              Depuis {new Date(athlete.startedAt).toLocaleDateString('fr-FR')}
            </div>
          )}
        </div>
      </div>

      <Link to={`/coach/athletes/${athlete.athleteId}`}>
        <Button size="sm" variant="outline">
          Voir profil
        </Button>
      </Link>
    </div>
  );
}