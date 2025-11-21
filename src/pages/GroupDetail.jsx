import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { groupsAPI } from '../lib/groups';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Alert } from '../components/Alert';
import { 
  ArrowLeft, 
  Users, 
  MapPin, 
  Calendar,
  DollarSign,
  Lock,
  Globe,
  UserPlus
} from 'lucide-react';

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeTab, setActiveTab] = useState('about'); // about, members, sessions

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    setLoading(true);
    try {
      const [groupData, membersData, sessionsData] = await Promise.all([
        groupsAPI.getGroupDetail(groupId),
        groupsAPI.getGroupMembers(groupId),
        groupsAPI.getGroupSessions(groupId)
      ]);
      setGroup(groupData);
      setMembers(membersData);
      setSessions(sessionsData);
    } catch (err) {
      console.error('Error loading group:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (message) => {
    setJoining(true);
    try {
      await groupsAPI.joinGroup({
        groupId: group.id,
        message
      });
      setShowJoinModal(false);
      loadGroupData();
    } catch (err) {
      console.error('Error joining group:', err);
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Quitter ce groupe ?')) return;

    try {
      await groupsAPI.leaveGroup(groupId);
      navigate('/my-groups');
    } catch (err) {
      console.error('Error leaving group:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  if (!group) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert type="error">Groupe non trouvé</Alert>
      </div>
    );
  }

  const sportEmojis = {
    Running: '🏃‍♂️',
    Cycling: '🚴‍♂️',
    Both: '🏃‍♂️🚴‍♂️'
  };

  const isFull = group.currentMembers >= group.maxMembers;
  const isMember = members.some(m => m.status === 'Active'); // Simplifié - à améliorer

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 sm:pb-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/groups')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        <span>Retour aux groupes</span>
      </button>

      {/* Header */}
      <Card className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-6xl">{sportEmojis[group.sport]}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
              <div className="flex items-center space-x-2 mt-2">
                {group.isPrivate ? (
                  <span className="flex items-center space-x-1 text-gray-600">
                    <Lock size={16} />
                    <span className="text-sm">Groupe privé</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-green-600">
                    <Globe size={16} />
                    <span className="text-sm">Groupe public</span>
                  </span>
                )}
                {group.isFree ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    Gratuit
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    {group.monthlyFee}€/mois
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isMember && (
            <Button
              onClick={() => setShowJoinModal(true)}
              disabled={isFull}
              size="lg"
            >
              <UserPlus size={20} className="mr-2" />
              {isFull ? 'Complet' : 'Rejoindre'}
            </Button>
          )}

          {isMember && (
            <Button
              variant="secondary"
              onClick={handleLeaveGroup}
            >
              Quitter le groupe
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Users className="text-blue-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {group.currentMembers}/{group.maxMembers}
            </div>
            <div className="text-sm text-gray-600">membres</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{sessions.length}</div>
            <div className="text-sm text-gray-600">séances</div>
          </div>
          {group.city && (
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <MapPin className="text-blue-600" size={24} />
              </div>
              <div className="text-lg font-bold text-gray-900">{group.city}</div>
              <div className="text-sm text-gray-600">ville</div>
            </div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {['about', 'sessions', 'members'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'about' && 'À propos'}
              {tab === 'sessions' && `Séances (${sessions.length})`}
              {tab === 'members' && `Membres (${group.currentMembers})`}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{group.description}</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span className="font-medium">Sport</span>
                <span>{group.sport}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Niveau</span>
                <span>{group.targetLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Type</span>
                <span>{group.type}</span>
              </div>
              {group.meetingPoint && (
                <div className="flex justify-between">
                  <span className="font-medium">Point de RDV</span>
                  <span>{group.meetingPoint}</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Coach</h2>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {group.coach.name.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-gray-900">{group.coach.name}</div>
                <Link to={`/coaches/${group.coach.id}`} className="text-sm text-blue-600 hover:underline">
                  Voir le profil
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Aucune séance prévue pour le moment</p>
            </Card>
          ) : (
            sessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-3">
          {members.map(member => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <JoinGroupModal
          group={group}
          onClose={() => setShowJoinModal(false)}
          onJoin={handleJoinGroup}
          joining={joining}
        />
      )}
    </div>
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
    <Link to={`/groups/sessions/${session.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{typeIcons[session.type]}</span>
            <div>
              <div className="font-medium text-gray-900">{session.title}</div>
              <div className="text-sm text-gray-600">
                {new Date(session.scheduledDate).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              {session.meetingPoint && (
                <div className="text-xs text-gray-500 mt-1">
                  <MapPin size={12} className="inline mr-1" />
                  {session.meetingPoint}
                </div>
              )}
            </div>
          </div>

          <div className="text-right text-sm">
            <div className="text-green-600 font-medium">
              ✓ {session.confirmedCount} confirmés
            </div>
            {session.maybeCount > 0 && (
              <div className="text-yellow-600">? {session.maybeCount} peut-être</div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

function MemberCard({ member }) {
  const roleLabels = {
    Member: 'Membre',
    Assistant: 'Assistant'
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
            {member.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{member.name}</div>
            <div className="text-sm text-gray-600">
              {roleLabels[member.role]} • Depuis {new Date(member.joinedAt).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function JoinGroupModal({ group, onClose, onJoin, joining }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onJoin(message);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Rejoindre {group.name}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {group.isPrivate && (
            <Alert type="info">
              Ce groupe est privé. Le coach devra approuver ta demande.
            </Alert>
          )}

          {!group.isFree && (
            <Alert type="warning">
              Ce groupe est payant : {group.monthlyFee}€/mois
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message au coach (optionnel)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Présente-toi et explique ta motivation..."
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={joining} className="flex-1">
              {joining ? 'Envoi...' : 'Confirmer'}
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