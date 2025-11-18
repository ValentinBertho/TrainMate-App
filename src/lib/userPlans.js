import api from './api';

export const userPlansAPI = {
  getMyPlans: async () => {
    const res = await api.get('/userplans');
    return res.data;
  },
  getActive: async () => {
    const res = await api.get('/userplans/active');
    return res.data;
  },
  assign: async (data) => {
    const res = await api.post('/userplans', data);
    return res.data;
  }
};
