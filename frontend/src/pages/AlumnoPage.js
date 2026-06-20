import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTurnos } from '../hooks/useTurnos';
import api from '../api';
import styles from './AlumnoPage.module.css';
 
export default function AlumnoPage() {
  const { alumno, logout }           = useAuth();
  const { turnos, loading, recargar } = useTurnos();
  const [misReservas, setMisReservas] = useState([]);
  const [mensaje, setMensaje]         = useState({ texto: '', tipo: '' });
  const [procesando, setProcesando]   = useState(null); // id del turno en proceso
 
  // Cargar reservas actuales del alumno
  const cargarMisReservas = async () => {
    try {
      const { data } = await api.get('/mis-reservas');
      setMisReservas(data);
    } catch { /* silencioso */ }
  };
 
  useEffect(() => { cargarMisReservas(); }, []);
 
  const mostrarMsg = (texto, tipo) => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
  };
 
  const reservar = async (turnoId) => {
    setProcesando(turnoId);
    try {
      await api.post('/reservas', { turno_id: turnoId });
      mostrarMsg('✅ Reserva confirmada', 'ok');
      await Promise.all([cargarMisReservas(), recargar()]);
    } catch (err) {
      mostrarMsg('❌ ' + (err.response?.data?.error || 'Error al reservar'), 'error');
    } finally {
      setProcesando(null);
    }
  };
 
  const cancelar = async (turnoId) => {
    setProcesando(turnoId);
    try {
      await api.delete('/reservas', { data: { turno_id: turnoId } });
      mostrarMsg('↩ Reserva cancelada', 'warn');
      await Promise.all([cargarMisReservas(), recargar()]);
    } catch (err) {
      mostrarMsg('❌ ' + (err.response?.data?.error || 'Error al cancelar'), 'error');
    } finally {
      setProcesando(null);
    }
  };
 
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.emoji}>🥊</span>
          <div>
            <p className={styles.nombre}>¡Hola, {alumno?.nombre}!</p>
            <p className={styles.tel}>{alumno?.telefono}</p>
          </div>
        </div>
        <button className={styles.btnSalir} onClick={logout}>Salir</button>
      </header>
 
      <main className={styles.main}>
        <h2 className={styles.seccion}>Turnos de hoy</h2>
 
        {loading && <p className={styles.cargando}>Cargando turnos...</p>}
 
        <div className={styles.turnos}>
          {turnos.map((t) => {
            const yaReservado = misReservas.includes(t.id);
            const lleno       = t.reservados >= t.capacidad && !yaReservado;
            const enProceso   = procesando === t.id;
 
            return (
              <div key={t.id} className={`${styles.turnoCard} ${yaReservado ? styles.reservado : ''}`}>
                <div className={styles.turnoInfo}>
                  <p className={styles.turnoHora}>{t.etiqueta}</p>
                  <p className={styles.turnoPlazas}>
                    <span className={yaReservado ? styles.plazasOk : ''}>
                      {t.reservados} / {t.capacidad}
                    </span> plazas
                  </p>
                </div>
 
                <div className={styles.turnoAccion}>
                  {yaReservado ? (
                    <>
                      <span className={styles.badgeReservado}>✓ Reservado</span>
                      <button
                        className={styles.btnCancelar}
                        onClick={() => cancelar(t.id)}
                        disabled={enProceso}
                      >
                        {enProceso ? '...' : 'Cancelar'}
                      </button>
                    </>
                  ) : lleno ? (
                    <span className={styles.badgeLleno}>Completo</span>
                  ) : (
                    <button
                      className={styles.btnReservar}
                      onClick={() => reservar(t.id)}
                      disabled={enProceso}
                    >
                      {enProceso ? 'Reservando...' : 'Reservar'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
 
        {mensaje.texto && (
          <p className={`${styles.msg} ${styles['msg_' + mensaje.tipo]}`}>
            {mensaje.texto}
          </p>
        )}
      </main>
    </div>
  );
}