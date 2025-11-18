import api from './api';

export const profileAPI = {
  get: async () => {
    const res = await api.get('/profile');
    return res.data;
  },
  update: async (data) => {
    const res = await api.put('/profile', data);
    return res.data;
  },
  getSuggestions: async () => {
    const res = await api.get('/profile/suggestions');
    return res.data;
  }
};