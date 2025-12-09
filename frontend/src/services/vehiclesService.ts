import api from './api';

export const vehiclesService = {
  getAll: async () => {
    const response = await api.get('/vehicles');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },
  
  create: async (vehicle: any) => {
    const response = await api.post('/vehicles', vehicle);
    return response.data;
  },
  
  update: async (id: number, vehicle: any) => {
    const response = await api.put(`/vehicles/${id}`, vehicle);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/vehicles/${id}`);
    return response.data;
  },
  
  getByStatus: async (status: string) => {
    const response = await api.get(`/vehicles/status/${status}`);
    return response.data;
  },
};

