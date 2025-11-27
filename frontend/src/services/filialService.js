import { API_ENDPOINTS } from '../config/api';

export const filialesService = {
  getAll: async () => {
    const response = await fetch(API_ENDPOINTS.filiales);
    if (!response.ok) throw new Error('Error al cargar filiales');
    return response.json();
  },

  getTotals: async () => {
    const response = await fetch(API_ENDPOINTS.filialesTotals);
    if (!response.ok) throw new Error('Error al cargar totales');
    return response.json();
  },

  updateComentario: async (id, comentario) => {
    const response = await fetch(`${API_ENDPOINTS.filiales}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Comentarios: comentario })
    });
    if (!response.ok) throw new Error('Error al actualizar comentario');
    return response.json();
  }
};
