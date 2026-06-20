import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

export default function MaestroLoginPage() {
  const { loginMaestro } = useAuth();
  const [pin, setPin]           = useState('');
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!pin.trim()) {
      setError('Introduce el PIN');
      return;
    }
    setCargando(true);
    try {
      await loginMaestro(pin.trim());
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
          <div className={styles.logo}>🛡️</div>
          <h1 className={styles.titulo}>Acceso Maestro</h1>
          <p className={styles.subtitulo}>Panel de gestión del club</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <p className={styles.instruccion}>Introduce tu PIN de acceso</p>

          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="PIN"
            className={`${styles.input} ${styles.inputPin}`}
            maxLength={6}
            autoFocus
          />

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={`${styles.boton} ${styles.botonMaestro}`} disabled={cargando}>
            {cargando ? 'Verificando...' : 'Entrar como Maestro'}
          </button>
        </form>
      </div>
    </div>
  );
}