const jwt = require('jsonwebtoken');
 
/**
 * Verifica que el token JWT sea válido.
 * Añade req.usuario con { id, telefono, rol }
 */
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
 
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
 
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
 
/**
 * Verifica que el usuario autenticado sea maestro.
 * Debe usarse después de verificarToken.
 */
function soloMaestro(req, res, next) {
  if (req.usuario?.rol !== 'maestro') {
    return res.status(403).json({ error: 'Acceso restringido al maestro' });
  }
  next();
}
 
module.exports = { verificarToken, soloMaestro };
 