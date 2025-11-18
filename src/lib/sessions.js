import api from './api';

export const sessionsAPI = {
  getCalendar: async (start, end) => {
    const res = await api.get('/sessions/calendar', {
      params: { start, end }
    });
    return res.data;
  },
  getWeekSummary: async (weekStart) => {
    const res = await api.get('/sessions/week-summary', {
      params: { weekStart }
    });
    return res.data;
  },
  complete: async (sessionId, data) => {
    const res = await api.post(`/sessions/${sessionId}/complete`, data);
    return res.data;
  },
  skip: async (sessionId) => {
    const res = await api.post(`/sessions/${sessionId}/skip`);
    return res.data;
  }
};