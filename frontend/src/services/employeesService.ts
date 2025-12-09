import api from './api';

export const employeesService = {
  getAll: async () => {
    const response = await api.get('/employees');
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  
  create: async (employee: any) => {
    const response = await api.post('/employees', employee);
    return response.data;
  },
  
  update: async (id: number, employee: any) => {
    const response = await api.put(`/employees/${id}`, employee);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
  
  search: async (name: string) => {
    const response = await api.get(`/employees/search?name=${name}`);
    return response.data;
  },
};

