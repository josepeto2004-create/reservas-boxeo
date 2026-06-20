import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage        from './pages/LoginPage';
import MaestroLoginPage from './pages/MaestroLoginPage';
import AlumnoPage       from './pages/AlumnoPage';
import MaestroPage      from './pages/MaestroPage';

// Banner de instalación PWA
function InstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const instalar = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#1a1a1a', color: '#fff',
      padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: '12px',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.3)'
    }}>
      <span style={{ fontSize: '1.5rem' }}>🥊</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600 }}>Instalar la app</p>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: '#aaa' }}>Añade el club a tu pantalla de inicio</p>
      </div>
      <button
        onClick={() => setVisible(false)}
        style={{ background: 'transparent', border: 'none', color: '#888', fontSize: '1.25rem', cursor: 'pointer', padding: '4px 8px' }}
      >✕</button>
      <button
        onClick={instalar}
        style={{ background: '#E24B4A', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
      >Instalar</button>
    </div>
  );
}

function Router() {
  const { rol, alumno } = useAuth();
  const esRutaMaestro = window.location.pathname === '/maestro-acceso';

  if (rol === 'alumno' && alumno) return <AlumnoPage />;
  if (rol === 'maestro') return <MaestroPage />;

  if (esRutaMaestro) return <MaestroLoginPage />;
  return <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
      <InstallBanner />
    </AuthProvider>
  );
}