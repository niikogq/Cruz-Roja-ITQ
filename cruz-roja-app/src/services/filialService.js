import { API_ENDPOINTS } from '../config/api';
import { authFetch } from '../utils/authFetch';

export const filialesService = {
  getAll: async () => {
    const response = await authFetch(API_ENDPOINTS.filiales);
    if (!response.ok) throw new Error('Error al cargar filiales');
    return response.json();
  },

  getTotals: async () => {
    const response = await authFetch(API_ENDPOINTS.filialesTotals);
    if (!response.ok) throw new Error('Error al cargar totales');
    return response.json();
  },

  updateComentario: async (id, comentario) => {
    const response = await authFetch(`${API_ENDPOINTS.filiales}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ Comentarios: comentario })
    });
    if (!response.ok) throw new Error('Error al actualizar comentario');
    return response.json();
  }
};
