// src/lib/groups.js
import api from './api';

export const groupsAPI = {
  // Groupes publics
  getPublicGroups: async (city = null, sport = null) => {
    const params = {};
    if (city) params.city = city;
    if (sport) params.sport = sport;
    const res = await api.get('/groups/public', { params });
    return res.data;
  },

  // Détail groupe
  getGroupDetail: async (groupId) => {
    const res = await api.get(`/groups/${groupId}`);
    return res.data;
  },

  // Mes groupes (membre)
  getMyGroups: async () => {
    const res = await api.get('/groups/my-groups');
    return res.data;
  },

  // Mes groupes (coach)
  getCoachGroups: async () => {
    const res = await api.get('/groups/coach/my-groups');
    return res.data;
  },

  // Créer groupe
  createGroup: async (data) => {
    const res = await api.post('/groups', data);
    return res.data;
  },

  // Modifier groupe
  updateGroup: async (groupId, data) => {
    const res = await api.put(`/groups/${groupId}`, data);
    return res.data;
  },

  // Membres d'un groupe
  getGroupMembers: async (groupId) => {
    const res = await api.get(`/groups/${groupId}/members`);
    return res.data;
  },

  // Rejoindre groupe
  joinGroup: async (data) => {
    const res = await api.post('/groups/join', data);
    return res.data;
  },

  // Approuver demande
  approveJoinRequest: async (requestId) => {
    const res = await api.post(`/groups/members/${requestId}/approve`);
    return res.data;
  },

  // Quitter groupe
  leaveGroup: async (groupId) => {
    const res = await api.post(`/groups/${groupId}/leave`);
    return res.data;
  },

  // Retirer membre
  removeMember: async (memberId) => {
    const res = await api.delete(`/groups/members/${memberId}`);
    return res.data;
  },

  // SÉANCES

  // Séances d'un groupe
  getGroupSessions: async (groupId) => {
    const res = await api.get(`/groups/${groupId}/sessions`);
    return res.data;
  },

  // Mes prochaines séances
  getUpcomingSessions: async () => {
    const res = await api.get('/groups/sessions/upcoming');
    return res.data;
  },

  // Détail séance
  getSessionDetail: async (sessionId) => {
    const res = await api.get(`/groups/sessions/${sessionId}`);
    return res.data;
  },

  // Créer séance
  createSession: async (data) => {
    const res = await api.post('/groups/sessions', data);
    return res.data;
  },

  // Annuler séance
  cancelSession: async (sessionId, reason) => {
    const res = await api.post(`/groups/sessions/${sessionId}/cancel`, { reason });
    return res.data;
  },

  // Confirmer/refuser présence
  updateAttendance: async (sessionId, status) => {
    const res = await api.post(`/groups/sessions/${sessionId}/attendance`, { status });
    return res.data;
  },

  // Marquer comme effectuée
  completeSession: async (sessionId, data) => {
    const res = await api.post(`/groups/sessions/${sessionId}/complete`, data);
    return res.data;
  }
};