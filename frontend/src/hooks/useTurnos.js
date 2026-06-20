import { useState, useEffect, useCallback } from 'react';
import api from '../api';
 
export function useTurnos(fecha) {
  const [turnos, setTurnos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
 
  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = fecha ? { fecha } : {};
      const { data } = await api.get('/turnos', { params });
      setTurnos(data);
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cargar turnos');
    } finally {
      setLoading(false);
    }
  }, [fecha]);
 
  useEffect(() => { cargar(); }, [cargar]);
 
  return { turnos, loading, error, recargar: cargar };
}