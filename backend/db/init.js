/**
 * Ejecuta este script UNA VEZ para crear las tablas:
 *   node db/init.js
 */
require('dotenv').config();
const pool = require('./pool');
 
const SQL = `
-- ─────────────────────────────────────────────
-- ALUMNOS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alumnos (
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(120) NOT NULL,
  telefono   VARCHAR(20)  NOT NULL UNIQUE,
  activo     BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
 
-- ─────────────────────────────────────────────
-- TURNOS (fijos, se insertan una vez)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS turnos (
  id         SERIAL PRIMARY KEY,
  etiqueta   VARCHAR(40)  NOT NULL,   -- "19:00 – 20:00"
  hora       VARCHAR(5)   NOT NULL,   -- "19:00"
  capacidad  INT          NOT NULL DEFAULT 20
);
 
-- Insertar turnos fijos si no existen
INSERT INTO turnos (etiqueta, hora, capacidad) VALUES
  ('19:00 – 20:00', '19:00', 20),
  ('20:00 – 21:00', '20:00', 20),
  ('21:00 – 22:00', '21:00', 20)
ON CONFLICT DO NOTHING;
 
-- ─────────────────────────────────────────────
-- RESERVAS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reservas (
  id          SERIAL PRIMARY KEY,
  alumno_id   INT         NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  turno_id    INT         NOT NULL REFERENCES turnos(id)  ON DELETE CASCADE,
  fecha       DATE        NOT NULL DEFAULT CURRENT_DATE,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (alumno_id, turno_id, fecha)   -- un alumno no puede reservar el mismo turno dos veces el mismo día
);
 
-- Índices para acelerar consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_reservas_fecha    ON reservas(fecha);
CREATE INDEX IF NOT EXISTS idx_reservas_turno    ON reservas(turno_id, fecha);
CREATE INDEX IF NOT EXISTS idx_reservas_alumno   ON reservas(alumno_id, fecha);
`;
 
(async () => {
  const client = await pool.connect();
  try {
    await client.query(SQL);
    console.log('✅ Base de datos inicializada correctamente');
    console.log('   Tablas creadas: alumnos, turnos, reservas');
  } catch (err) {
    console.error('❌ Error al inicializar la base de datos:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
})();