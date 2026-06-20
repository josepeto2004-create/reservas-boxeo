const express = require('express');
const pool    = require('../db/pool');
const { verificarToken, soloMaestro } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/turnos
// ─────────────────────────────────────────────
router.get('/turnos', verificarToken, async (req, res) => {
  const fecha = req.query.fecha || new Date().toISOString().slice(0, 10);

  try {
    const { rows } = await pool.query(
      `SELECT
         t.id,
         t.etiqueta,
         t.hora,
         t.capacidad,
         COUNT(r.id)::INT AS reservados
       FROM turnos t
       LEFT JOIN reservas r ON r.turno_id = t.id AND r.fecha = $1
       GROUP BY t.id
       ORDER BY t.hora`,
      [fecha]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener turnos' });
  }
});

// ─────────────────────────────────────────────
// GET /api/turnos/:turnoId/alumnos
// ─────────────────────────────────────────────
router.get('/turnos/:turnoId/alumnos', verificarToken, soloMaestro, async (req, res) => {
  const { turnoId } = req.params;
  const fecha = req.query.fecha || new Date().toISOString().slice(0, 10);

  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.nombre, a.telefono, r.creado_en AS reservado_en
       FROM reservas r
       JOIN alumnos a ON a.id = r.alumno_id
       WHERE r.turno_id = $1 AND r.fecha = $2
       ORDER BY a.nombre`,
      [turnoId, fecha]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener alumnos del turno' });
  }
});

// ─────────────────────────────────────────────
// GET /api/mis-reservas
// ─────────────────────────────────────────────
router.get('/mis-reservas', verificarToken, async (req, res) => {
  if (req.usuario.rol !== 'alumno') {
    return res.status(403).json({ error: 'Solo para alumnos' });
  }
  const fecha = req.query.fecha || new Date().toISOString().slice(0, 10);

  try {
    const { rows } = await pool.query(
      `SELECT r.turno_id
       FROM reservas r
       WHERE r.alumno_id = $1 AND r.fecha = $2`,
      [req.usuario.id, fecha]
    );
    res.json(rows.map(r => r.turno_id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

// ─────────────────────────────────────────────
// POST /api/reservas
// El alumno hace una reserva.
// REGLA: solo puede tener UNA reserva activa por día.
// Si quiere otro turno, primero debe cancelar la que tiene.
// ─────────────────────────────────────────────
router.post('/reservas', verificarToken, async (req, res) => {
  if (req.usuario.rol !== 'alumno') {
    return res.status(403).json({ error: 'Solo los alumnos pueden reservar' });
  }

  const { turno_id } = req.body;
  const fecha = req.body.fecha || new Date().toISOString().slice(0, 10);

  if (!turno_id) {
    return res.status(400).json({ error: 'turno_id es obligatorio' });
  }

  try {
    // ── Comprobar si el alumno YA tiene una reserva ese día (en cualquier turno) ──
    const { rows: reservaExistente } = await pool.query(
      `SELECT t.etiqueta
       FROM reservas r
       JOIN turnos t ON t.id = r.turno_id
       WHERE r.alumno_id = $1 AND r.fecha = $2`,
      [req.usuario.id, fecha]
    );

    if (reservaExistente.length > 0) {
      return res.status(409).json({
        error: `Ya tienes una reserva hoy en el turno de ${reservaExistente[0].etiqueta}. Cancélala primero si quieres cambiar de horario.`
      });
    }

    // Comprobar si hay plazas en el turno solicitado
    const { rows: turnoRows } = await pool.query(
      `SELECT t.capacidad, COUNT(r.id)::INT AS reservados
       FROM turnos t
       LEFT JOIN reservas r ON r.turno_id = t.id AND r.fecha = $2
       WHERE t.id = $1
       GROUP BY t.id`,
      [turno_id, fecha]
    );

    if (turnoRows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    const { capacidad, reservados } = turnoRows[0];
    if (reservados >= capacidad) {
      return res.status(409).json({ error: 'El turno está completo' });
    }

    // Crear la reserva
    const { rows } = await pool.query(
      `INSERT INTO reservas (alumno_id, turno_id, fecha)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [req.usuario.id, turno_id, fecha]
    );

    res.status(201).json({ mensaje: 'Reserva realizada', reserva_id: rows[0].id });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya tienes reserva en este turno' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/reservas
// El alumno cancela su reserva
// ─────────────────────────────────────────────
router.delete('/reservas', verificarToken, async (req, res) => {
  if (req.usuario.rol !== 'alumno') {
    return res.status(403).json({ error: 'Solo los alumnos pueden cancelar' });
  }

  const { turno_id } = req.body;
  const fecha = req.body.fecha || new Date().toISOString().slice(0, 10);

  if (!turno_id) {
    return res.status(400).json({ error: 'turno_id es obligatorio' });
  }

  try {
    const { rowCount } = await pool.query(
      `DELETE FROM reservas
       WHERE alumno_id = $1 AND turno_id = $2 AND fecha = $3`,
      [req.usuario.id, turno_id, fecha]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.json({ mensaje: 'Reserva cancelada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cancelar la reserva' });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/reservas/maestro  (solo maestro)
// ─────────────────────────────────────────────
router.delete('/reservas/maestro', verificarToken, soloMaestro, async (req, res) => {
  const { alumno_id, turno_id } = req.body;
  const fecha = req.body.fecha || new Date().toISOString().slice(0, 10);

  if (!alumno_id || !turno_id) {
    return res.status(400).json({ error: 'alumno_id y turno_id son obligatorios' });
  }

  try {
    await pool.query(
      `DELETE FROM reservas
       WHERE alumno_id = $1 AND turno_id = $2 AND fecha = $3`,
      [alumno_id, turno_id, fecha]
    );
    res.json({ mensaje: 'Reserva eliminada por el maestro' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la reserva' });
  }
});

module.exports = router;