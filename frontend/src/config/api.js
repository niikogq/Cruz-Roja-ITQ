export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  voluntarios: `${API_BASE_URL}/voluntarios`,
  filiales: `${API_BASE_URL}/filiales`,
  filialesTotals: `${API_BASE_URL}/filialesTotals`,
};