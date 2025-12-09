import api from './api';

export const authService = {
  login: async (mail: string, password: string) => {
    const response = await api.post('/auth/login', { mail, password });
    return response.data;
  },
  
  signup: async (userData: {
    mail: string;
    password: string;
    nom: string;
    prenom: string;
    telephone: number;
    role: string;
  }) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  
  getAllUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },
};