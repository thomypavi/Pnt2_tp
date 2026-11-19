/**
 * Tests del middleware requireAdmin (control de acceso por rol)
 * Se corre con: npm test  (usa el test runner que ya viene con Node, sin instalar nada)
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { requireAdmin } = require('../middleware/requireAdmin');

// Respuesta falsa de Express que guarda el status y el JSON enviados
const crearRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
};

test('deja pasar a un admin (llama a next)', () => {
  let pasó = false;
  requireAdmin({ user: { role: 'admin' } }, crearRes(), () => { pasó = true; });
  assert.equal(pasó, true);
});

test('bloquea a un usuario común con 403', () => {
  const res = crearRes();
  let pasó = false;
  requireAdmin({ user: { role: 'user' } }, res, () => { pasó = true; });
  assert.equal(pasó, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
});

test('bloquea si no hay usuario cargado (403, no rompe)', () => {
  const res = crearRes();
  requireAdmin({}, res, () => assert.fail('no debería llamar a next'));
  assert.equal(res.statusCode, 403);
});
