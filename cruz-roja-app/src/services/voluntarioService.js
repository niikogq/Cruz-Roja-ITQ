import { API_ENDPOINTS } from '../config/api';

export const voluntariosService = {
  getAll: async () => {
    const response = await fetch(API_ENDPOINTS.voluntarios);
    if (!response.ok) throw new Error('Error al cargar voluntarios');
    return response.json();
  },

  updateCalidad: async (id, calidad) => {
    const response = await fetch(`${API_ENDPOINTS.voluntarios}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "Calidad de voluntario": calidad })
    });
    if (!response.ok) throw new Error('Error al actualizar calidad');
    return response.json();
  },

  updateGenero: async (id, genero) => {
    const response = await fetch(`${API_ENDPOINTS.voluntarios}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "Género": genero })
    });
    if (!response.ok) throw new Error('Error al actualizar género');
    return response.json();
  }
};
