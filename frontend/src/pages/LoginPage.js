import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { loginAlumno } = useAuth();
  const [telefono, setTelefono] = useState('');
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!telefono.trim()) {
      setError('Introduce tu número de teléfono');
      return;
    }
    setCargando(true);
    try {
      await loginAlumno(telefono.trim());
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src="/logo-bachi.png" alt="Bachi Club de Boxeo" className={styles.logoImg} />
          <h1 className={styles.titulo}>Bachi Club de Boxeo</h1>
          <p className={styles.subtitulo}>Sistema de reservas</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <p className={styles.instruccion}>
            Introduce el número de teléfono que le diste al maestro
          </p>

          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/[^0-9+\- ]/g, ''))}
            placeholder="Ej: 612345678"
            className={styles.input}
            maxLength={15}
            autoFocus
          />

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.boton} disabled={cargando}>
            {cargando ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}