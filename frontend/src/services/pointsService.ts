import api from './api';

export const pointsService = {
  getAll: async () => {
    const response = await api.get('/points');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/points/${id}`);
    return response.data;
  },
  
  create: async (point: any) => {
    const response = await api.post('/points', point);
    return response.data;
  },
  
  update: async (id: number, point: any) => {
    const response = await api.put(`/points/${id}`, point);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/points/${id}`);
    return response.data;
  },
  
  getCritical: async (threshold = 80) => {
    const response = await api.get(`/points/critical?threshold=${threshold}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/points/stats');
    return response.data;
  },
};