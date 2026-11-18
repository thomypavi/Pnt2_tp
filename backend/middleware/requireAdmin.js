/**
 * MIDDLEWARE: SOLO ADMINISTRADORES
 *
 * Se usa SIEMPRE después de `authenticate`, que ya cargó el usuario en req.user
 * leyéndolo de la base de datos. Como el rol sale de la base (y no del token),
 * si cambiás el rol de alguien el cambio aplica en la siguiente request,
 * sin que tenga que volver a loguearse.
 *
 * Ejemplo de uso:
 *   router.get('/users', authenticate, requireAdmin, adminController.getUsers)
 *
 * Respuestas:
 * - 403 Forbidden si el usuario está logueado pero no es admin
 *   (401 sería "no sé quién sos"; 403 es "sé quién sos, pero no tenés permiso")
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado: se requiere rol de administrador'
    });
  }
  next();
};

module.exports = { requireAdmin };
