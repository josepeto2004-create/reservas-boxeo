const express = require('express');
const pool    = require('../db/pool');
const { verificarToken, soloMaestro } = require('../middleware/auth');
 
const router = express.Router();
 
// Todas las rutas de alumnos son solo para el maestro
router.use(verificarToken, soloMaestro);
 
// ─────────────────────────────────────────────
// GET /api/alumnos
// Lista todos los alumnos activos
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, nombre, telefono, creado_en
       FROM alumnos
       WHERE activo = TRUE
       ORDER BY nombre ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
});
 
// ─────────────────────────────────────────────
// POST /api/alumnos
// Añade un nuevo alumno
// ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { nombre, telefono } = req.body;
 
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (!telefono || !telefono.trim()) {
    return res.status(400).json({ error: 'El teléfono es obligatorio' });
  }
 
  const telLimpio = telefono.trim().replace(/\s/g, '');
  if (telLimpio.length < 9) {
    return res.status(400).json({ error: 'El teléfono no parece válido' });
  }
 
  try {
    const { rows } = await pool.query(
      `INSERT INTO alumnos (nombre, telefono)
       VALUES ($1, $2)
       RETURNING id, nombre, telefono, creado_en`,
      [nombre.trim(), telLimpio]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Este número de teléfono ya está registrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al añadir alumno' });
  }
});
 
// ─────────────────────────────────────────────
// PUT /api/alumnos/:id
// Edita nombre o teléfono de un alumno
// ─────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, telefono } = req.body;
 
  if (!nombre && !telefono) {
    return res.status(400).json({ error: 'Nada que actualizar' });
  }
 
  try {
    const { rows } = await pool.query(
      `UPDATE alumnos
       SET nombre   = COALESCE($1, nombre),
           telefono = COALESCE($2, telefono)
       WHERE id = $3 AND activo = TRUE
       RETURNING id, nombre, telefono`,
      [nombre?.trim() || null, telefono?.trim().replace(/\s/g,'') || null, id]
    );
 
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ese teléfono ya pertenece a otro alumno' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar alumno' });
  }
});
 
// ─────────────────────────────────────────────
// DELETE /api/alumnos/:id
// Baja lógica del alumno (activo = false)
// ─────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      'UPDATE alumnos SET activo = FALSE WHERE id = $1',
      [id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    res.json({ mensaje: 'Alumno eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar alumno' });
  }
});
 
module.exports = router;
 