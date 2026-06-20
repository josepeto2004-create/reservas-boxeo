import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTurnos } from '../hooks/useTurnos';
import api from '../api';
import styles from './MaestroPage.module.css';
 
export default function MaestroPage() {
  const { logout } = useAuth();
  const { turnos, loading: cargandoTurnos, recargar } = useTurnos();
 
  const [alumnos, setAlumnos]           = useState([]);
  const [detalleTurnos, setDetalleTurnos] = useState({}); // { turnoId: [alumnos] }
  const [form, setForm]                 = useState({ nombre: '', telefono: '' });
  const [formMsg, setFormMsg]           = useState({ texto: '', tipo: '' });
  const [guardando, setGuardando]       = useState(false);
  const [tabActiva, setTabActiva]       = useState('turnos'); // 'turnos' | 'alumnos'
 
  const cargarAlumnos = useCallback(async () => {
    try {
      const { data } = await api.get('/alumnos');
      setAlumnos(data);
    } catch { /* silencioso */ }
  }, []);
 
  const cargarDetalleTurnos = useCallback(async (listaTurnos) => {
    const detalles = {};
    await Promise.all(
      listaTurnos.map(async (t) => {
        try {
          const { data } = await api.get(`/turnos/${t.id}/alumnos`);
          detalles[t.id] = data;
        } catch { detalles[t.id] = []; }
      })
    );
    setDetalleTurnos(detalles);
  }, []);
 
  useEffect(() => { cargarAlumnos(); }, [cargarAlumnos]);
  useEffect(() => {
    if (turnos.length > 0) cargarDetalleTurnos(turnos);
  }, [turnos, cargarDetalleTurnos]);
 
  const mostrarFormMsg = (texto, tipo) => {
    setFormMsg({ texto, tipo });
    setTimeout(() => setFormMsg({ texto: '', tipo: '' }), 3500);
  };
 
  const añadirAlumno = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) { mostrarFormMsg('Introduce el nombre', 'error'); return; }
    if (!form.telefono.trim() || form.telefono.trim().length < 9) {
      mostrarFormMsg('Introduce un teléfono válido', 'error'); return;
    }
    setGuardando(true);
    try {
      await api.post('/alumnos', { nombre: form.nombre, telefono: form.telefono });
      setForm({ nombre: '', telefono: '' });
      mostrarFormMsg('✅ Alumno añadido correctamente', 'ok');
      cargarAlumnos();
    } catch (err) {
      mostrarFormMsg('❌ ' + (err.response?.data?.error || 'Error al añadir'), 'error');
    } finally {
      setGuardando(false);
    }
  };
 
  const eliminarAlumno = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar a ${nombre}?`)) return;
    try {
      await api.delete(`/alumnos/${id}`);
      cargarAlumnos();
      recargar();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };
 
  const quitarDeReserva = async (alumno_id, turno_id) => {
    try {
      await api.delete('/reservas/maestro', { data: { alumno_id, turno_id } });
      await Promise.all([recargar(), cargarDetalleTurnos(turnos)]);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar reserva');
    }
  };
 
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span>🥊</span>
          <div>
            <p className={styles.titulo}>Panel del Maestro</p>
            <p className={styles.subtitulo}>Club de Boxeo</p>
          </div>
        </div>
        <button className={styles.btnSalir} onClick={logout}>Salir</button>
      </header>
 
      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tabActiva === 'turnos' ? styles.tabActivo : ''}`}
          onClick={() => setTabActiva('turnos')}
        >
          🗓️ Turnos de hoy
        </button>
        <button
          className={`${styles.tab} ${tabActiva === 'alumnos' ? styles.tabActivo : ''}`}
          onClick={() => setTabActiva('alumnos')}
        >
          👥 Alumnos ({alumnos.length})
        </button>
      </div>
 
      <main className={styles.main}>
 
        {/* ── TAB TURNOS ── */}
        {tabActiva === 'turnos' && (
          <div>
            {/* Formulario añadir alumno */}
            <div className={styles.formCard}>
              <h3 className={styles.formTitulo}>➕ Añadir alumno</h3>
              <form onSubmit={añadirAlumno} className={styles.form}>
                <input
                  type="text"
                  placeholder="Nombre del alumno"
                  value={form.nombre}
                  onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className={styles.input}
                />
                <input
                  type="tel"
                  placeholder="Número de teléfono"
                  value={form.telefono}
                  onChange={(e) => setForm(f => ({ ...f, telefono: e.target.value.replace(/[^0-9+\- ]/g, '') }))}
                  className={styles.input}
                  maxLength={15}
                />
                <button type="submit" className={styles.btnAnadir} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Añadir alumno'}
                </button>
              </form>
              {formMsg.texto && (
                <p className={`${styles.msg} ${styles['msg_' + formMsg.tipo]}`}>
                  {formMsg.texto}
                </p>
              )}
            </div>
 
            {/* Turnos */}
            <h2 className={styles.seccion}>Reservas por turno</h2>
            {cargandoTurnos && <p className={styles.cargando}>Cargando...</p>}
            <div className={styles.turnos}>
              {turnos.map((t) => {
                const lista = detalleTurnos[t.id] || [];
                return (
                  <div key={t.id} className={styles.turnoCard}>
                    <div className={styles.turnoHeader}>
                      <div>
                        <p className={styles.turnoHora}>{t.etiqueta}</p>
                        <p className={styles.turnoConteo}>
                          {t.reservados} / {t.capacidad} alumnos
                          {t.reservados >= t.capacidad && <span className={styles.lleno}> · Completo</span>}
                        </p>
                      </div>
                    </div>
 
                    {lista.length === 0 ? (
                      <p className={styles.sinAlumnos}>Sin reservas</p>
                    ) : (
                      <ul className={styles.listaAlumnos}>
                        {lista.map((a) => (
                          <li key={a.id} className={styles.alumnoRow}>
                            <div className={styles.avatar}>{a.nombre[0].toUpperCase()}</div>
                            <div className={styles.alumnoInfo}>
                              <span className={styles.alumnoNombre}>{a.nombre}</span>
                              <span className={styles.alumnoTel}>{a.telefono}</span>
                            </div>
                            <button
                              className={styles.btnQuitar}
                              onClick={() => quitarDeReserva(a.id, t.id)}
                              title="Quitar de este turno"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
 
        {/* ── TAB ALUMNOS ── */}
        {tabActiva === 'alumnos' && (
          <div>
            <h2 className={styles.seccion}>Alumnos registrados</h2>
            {alumnos.length === 0 ? (
              <p className={styles.cargando}>No hay alumnos registrados aún.</p>
            ) : (
              <div className={styles.listaAlumnosCard}>
                {alumnos.map((a, i) => (
                  <div key={a.id} className={`${styles.alumnoItem} ${i < alumnos.length - 1 ? styles.separador : ''}`}>
                    <div className={styles.avatar}>{a.nombre[0].toUpperCase()}</div>
                    <div className={styles.alumnoInfo}>
                      <span className={styles.alumnoNombre}>{a.nombre}</span>
                      <span className={styles.alumnoTel}>{a.telefono}</span>
                    </div>
                    <button
                      className={styles.btnEliminar}
                      onClick={() => eliminarAlumno(a.id, a.nombre)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
 