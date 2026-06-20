import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api';
 
const AuthContext = createContext(null);
 
export function AuthProvider({ children }) {
  const [rol, setRol]       = useState(() => localStorage.getItem('rol'));
  const [alumno, setAlumno] = useState(() => {
    const a = localStorage.getItem('alumno');
    return a ? JSON.parse(a) : null;
  });
 
  const loginAlumno = useCallback(async (telefono) => {
    const { data } = await api.post('/auth/alumno', { telefono });
    localStorage.setItem('token', data.token);
    localStorage.setItem('rol', 'alumno');
    localStorage.setItem('alumno', JSON.stringify(data.alumno));
    setRol('alumno');
    setAlumno(data.alumno);
  }, []);
 
  const loginMaestro = useCallback(async (pin) => {
    const { data } = await api.post('/auth/maestro', { pin });
    localStorage.setItem('token', data.token);
    localStorage.setItem('rol', 'maestro');
    setRol('maestro');
    setAlumno(null);
  }, []);
 
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('alumno');
    setRol(null);
    setAlumno(null);
  }, []);
 
  return (
    <AuthContext.Provider value={{ rol, alumno, loginAlumno, loginMaestro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
 
export function useAuth() {
  return useContext(AuthContext);
}