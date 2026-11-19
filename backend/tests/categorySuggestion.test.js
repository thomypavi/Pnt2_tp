/**
 * Tests de la sugerencia de categoría por palabras clave
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { suggestCategory } = require('../services/categorySuggestionService');

const categorias = [
  { id: 1, name: 'Comida' },
  { id: 2, name: 'Transporte' },
  { id: 3, name: 'Servicios' },
  { id: 4, name: 'Entretenimiento' },
  { id: 5, name: 'Salud' },
  { id: 6, name: 'Educación' }
];

const sugerir = (vendor, description = '', categories = categorias) =>
  suggestCategory({ vendor, description, categories });

test('reconoce comercios conocidos', () => {
  assert.equal(sugerir('Coto').name, 'Comida');
  assert.equal(sugerir('Edenor').name, 'Servicios');
  assert.equal(sugerir('Netflix').name, 'Entretenimiento');
  assert.equal(sugerir('Farmacity').name, 'Salud');
});

test('usa también la descripción e ignora mayúsculas y acentos', () => {
  assert.equal(sugerir('', 'Carga de SUBE').name, 'Transporte');
  assert.equal(sugerir('', 'Cuota FACULTAD').name, 'Educación');
});

test('devuelve null si nada coincide', () => {
  assert.equal(sugerir('Ferretería López', 'tornillos'), null);
});

test('solo sugiere categorías que el usuario tiene', () => {
  // Es un super, pero el usuario no tiene ninguna categoría de comida
  assert.equal(sugerir('Coto', '', [{ id: 9, name: 'Auto' }]), null);
});

test('sin categorías no sugiere nada', () => {
  assert.equal(sugerir('Coto', '', []), null);
});
