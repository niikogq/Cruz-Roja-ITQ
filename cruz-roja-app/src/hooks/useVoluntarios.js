import { useState, useEffect, useCallback } from 'react';
import { voluntariosService } from '../services/voluntariosService';

export function useVoluntarios(filialFilter = null) {
  const [voluntarios, setVoluntarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingCalidadId, setUpdatingCalidadId] = useState(null);
  const [updatingGeneroId, setUpdatingGeneroId] = useState(null);

  const loadVoluntarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await voluntariosService.getAll();
      const filtered = filialFilter 
        ? data.filter(v => v.Filial === filialFilter)
        : data;
      
      setVoluntarios(filtered.map((v, idx) => ({ id: idx + 1, ...v })));
    } catch (err) {
      setError(err.message);
      console.error('Error cargando voluntarios:', err);
      setVoluntarios([]);
    } finally {
      setLoading(false);
    }
  }, [filialFilter]);

  useEffect(() => {
    loadVoluntarios();
  }, [loadVoluntarios]);

  const updateCalidad = useCallback(async (id, newValue) => {
    setUpdatingCalidadId(id);
    const row = voluntarios.find(r => r.id === id);
    
    try {
      await voluntariosService.updateCalidad(row._id, newValue);
      setVoluntarios(old =>
        old.map(r => r.id === id ? { ...r, "Calidad de voluntario": newValue } : r)
      );
      window.dispatchEvent(new Event('refreshFiliales'));
    } catch (error) {
      console.error("Error al actualizar calidad:", error);
      throw error;
    } finally {
      setUpdatingCalidadId(null);
    }
  }, [voluntarios]);

  const updateGenero = useCallback(async (id, newValue) => {
    setUpdatingGeneroId(id);
    const row = voluntarios.find(r => r.id === id);
    
    try {
      await voluntariosService.updateGenero(row._id, newValue);
      setVoluntarios(old =>
        old.map(r => r.id === id ? { ...r, "Género": newValue } : r)
      );
      window.dispatchEvent(new Event('refreshFiliales'));
    } catch (error) {
      console.error("Error al actualizar género:", error);
      throw error;
    } finally {
      setUpdatingGeneroId(null);
    }
  }, [voluntarios]);

  return {
    voluntarios,
    loading,
    error,
    updatingCalidadId,
    updatingGeneroId,
    updateCalidad,
    updateGenero,
    refetch: loadVoluntarios
  };
}
