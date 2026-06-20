const express = require('express');
const jwt     = require('jsonwebtoken');
const pool    = require('../db/pool');
 
const router = express.Router();
 
// ─────────────────────────────────────────────
// POST /api/auth/alumno
// Alumno se identifica con su número de teléfono
// ─────────────────────────────────────────────
router.post('/alumno', async (req, res) => {
  const { telefono } = req.body;
 
  if (!telefono) {
    return res.status(400).json({ error: 'El teléfono es obligatorio' });
  }
 
  try {
    const telLimpio = telefono.trim().replace(/\s/g, '');
    const { rows } = await pool.query(
      'SELECT id, nombre, telefono FROM alumnos WHERE telefono = $1 AND activo = TRUE',
      [telLimpio]
    );
 
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Número no registrado. Habla con el maestro.' });
    }
 
    const alumno = rows[0];
    const token = jwt.sign(
      { id: alumno.id, telefono: alumno.telefono, rol: 'alumno' },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
 
    res.json({ token, alumno: { id: alumno.id, nombre: alumno.nombre, telefono: alumno.telefono } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});
 
// ─────────────────────────────────────────────
// POST /api/auth/maestro
// Maestro se identifica con su PIN
// ─────────────────────────────────────────────
router.post('/maestro', async (req, res) => {
  const { pin } = req.body;
 
  if (!pin) {
    return res.status(400).json({ error: 'El PIN es obligatorio' });
  }
 
  if (pin !== process.env.MAESTRO_PIN) {
    return res.status(401).json({ error: 'PIN incorrecto' });
  }
 
  const token = jwt.sign(
    { rol: 'maestro' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
 
  res.json({ token });
});
 
module.exports = router;
 