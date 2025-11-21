import api from './api';

export const coachesAPI = {
  // Marketplace
  getMarketplace: async (specialty = null) => {
    const params = specialty ? { specialty } : {};
    const res = await api.get('/coaches/marketplace', { params });
    return res.data;
  },
  
  // Profil coach public
  getCoachProfile: async (coachId) => {
    const res = await api.get(`/coaches/${coachId}`);
    return res.data;
  },
  
  // Mon profil coach
  getMyProfile: async () => {
    const res = await api.get('/coaches/me');
    return res.data;
  },
  
  createProfile: async (data) => {
    const res = await api.post('/coaches/me', data);
    return res.data;
  },
  
  updateProfile: async (data) => {
    const res = await api.put('/coaches/me', data);
    return res.data;
  },
  
  // Mes athlètes (coach)
  getMyAthletes: async () => {
    const res = await api.get('/coaches/me/athletes');
    return res.data;
  },
  
  // Mes coachs (athlète)
  getMyCoaches: async () => {
    const res = await api.get('/coaches/me/my-coaches');
    return res.data;
  },
  
  // Demande de coaching
  requestCoaching: async (data) => {
    const res = await api.post('/coaches/request', data);
    return res.data;
  },
  
  // Approuver demande
  approveRequest: async (requestId, data) => {
    const res = await api.post(`/coaches/requests/${requestId}/approve`, data);
    return res.data;
  },
  
  // Terminer relation
  endCoaching: async (relationshipId) => {
    const res = await api.post(`/coaches/relationships/${relationshipId}/end`);
    return res.data;
  }
};