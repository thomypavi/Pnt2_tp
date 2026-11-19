/**
 * SUGERENCIA DE CATEGORÍA POR PALABRAS CLAVE
 *
 * Dado el comercio ("Coto", "Edenor", "Netflix"...) y la descripción de un gasto,
 * busca palabras clave conocidas y sugiere una de las categorías DEL USUARIO.
 *
 * Ejemplo: "Coto" contiene la clave "coto" → regla de comida → si el usuario
 * tiene una categoría llamada "Comida" (o "Supermercado", "Alimentos"...), se sugiere esa.
 */

/**
 * Cada regla tiene:
 * - claves: palabras que se buscan en el comercio/descripción
 * - categorias: nombres de categoría que corresponden a esas palabras
 * Todo se compara en minúsculas y sin acentos.
 */
const REGLAS = [
  { claves: ['coto', 'carrefour', 'dia', 'jumbo', 'disco', 'super', 'pedidosya', 'rappi', 'mcdonald', 'burger', 'resto', 'cafe', 'panaderia', 'verduleria', 'comida', 'almuerzo', 'cena', 'pizza'], categorias: ['comida', 'alimentos', 'supermercado', 'alimentacion'] },
  { claves: ['sube', 'uber', 'cabify', 'didi', 'taxi', 'ypf', 'shell', 'axion', 'nafta', 'peaje', 'colectivo', 'subte', 'tren', 'estacionamiento'], categorias: ['transporte', 'auto', 'movilidad'] },
  { claves: ['edenor', 'edesur', 'metrogas', 'aysa', 'personal', 'claro', 'movistar', 'telecentro', 'fibertel', 'internet', 'luz', 'gas', 'agua', 'celular', 'expensas'], categorias: ['servicios', 'hogar', 'facturas'] },
  { claves: ['netflix', 'spotify', 'disney', 'hbo', 'max', 'prime', 'steam', 'playstation', 'cine', 'cinemark', 'hoyts', 'teatro', 'recital', 'bar', 'boliche', 'juego'], categorias: ['entretenimiento', 'ocio', 'suscripciones', 'salidas'] },
  { claves: ['farmacity', 'farmacia', 'osde', 'swiss', 'galeno', 'medico', 'dentista', 'remedio', 'prepaga', 'hospital', 'clinica'], categorias: ['salud', 'medicina'] },
  { claves: ['udemy', 'coursera', 'platzi', 'curso', 'libreria', 'libro', 'facultad', 'universidad', 'ort', 'cuota', 'apuntes', 'fotocopia'], categorias: ['educacion', 'estudios', 'facultad'] },
  { claves: ['alquiler', 'inmobiliaria'], categorias: ['alquiler', 'vivienda', 'hogar'] },
  { claves: ['zara', 'nike', 'adidas', 'ropa', 'zapatillas', 'remera', 'jean'], categorias: ['ropa', 'indumentaria', 'compras'] }
];

// "Educación" → "educacion"
const normalizar = (texto) =>
  (texto || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * @param {{ vendor: string, description: string, categories: Array<{id:number,name:string}> }} datos
 * @returns {{ id: number, name: string } | null} la categoría sugerida, o null si no hay coincidencia
 */
exports.suggestCategory = ({ vendor, description, categories }) => {
  const texto = normalizar(`${vendor} ${description}`);

  for (const regla of REGLAS) {
    // ¿Aparece alguna palabra clave de esta regla en el texto?
    if (!regla.claves.some(clave => texto.includes(clave))) continue;

    // ¿El usuario tiene una categoría con un nombre que corresponda?
    const categoria = categories.find(cat =>
      regla.categorias.some(nombre => normalizar(cat.name).includes(nombre))
    );
    if (categoria) return categoria;
  }

  return null;
};
