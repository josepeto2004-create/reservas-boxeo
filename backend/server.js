require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const rateLimit   = require('express-rate-limit');
 
const authRoutes    = require('./routes/auth');
const alumnosRoutes = require('./routes/alumnos');
const reservasRoutes = require('./routes/reservas');
 
const app  = express();
const PORT = process.env.PORT || 3001;
 
// ─────────────────────────────────────────────
// Seguridad
// ─────────────────────────────────────────────
app.use(helmet());
 
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
 
// Limitar 100 peticiones por IP cada 15 minutos
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones, espera un momento' },
}));
 
// ─────────────────────────────────────────────
// Body parser
// ─────────────────────────────────────────────
app.use(express.json());
 
// ─────────────────────────────────────────────
// Rutas
// ─────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api',         reservasRoutes);
 
// Health check
app.get('/api/health', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));
 
// 404
app.use((_, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
 
// Error global
app.use((err, _, res) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});
 
// ─────────────────────────────────────────────
// Arrancar
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🥊 Boxing Club API corriendo en http://localhost:${PORT}`);
  console.log(`   Entorno: ${process.env.NODE_ENV || 'development'}\n`);
});