import api from './api';

export const plansAPI = {
  getAll: async (filters = {}) => {
    const res = await api.get('/plans', { params: filters });
    return res.data;
  },
  getDetail: async (id) => {
    const res = await api.get(`/plans/${id}`);
    return res.data;
  }
};