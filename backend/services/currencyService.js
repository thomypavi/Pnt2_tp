/**
 * SERVICIO DE CONVERSIÓN DE MONEDAS
 * 
 * Este servicio se comunica con una API externa para obtener tasas de cambio
 * en tiempo real. Utiliza la API gratuita de exchangerate-api.com.
 */

const axios = require('axios'); // Librería para hacer peticiones HTTP

// URL de la API externa que proporciona tasas de cambio
const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/USD';

/**
 * OBTENER TASA DE CONVERSIÓN
 * 
 * Obtiene la tasa de conversión de una moneda específica a USD.
 * 
 * @param {string} currency - Código de moneda (EUR, ARS, BRL, etc.)
 * @returns {number} - Tasa de conversión (cuántas unidades de la moneda = 1 USD)
 * 
 * Ejemplo:
 * - getExchangeRate('ARS') podría retornar 64.51
 *   Esto significa: 1 USD = 64.51 ARS
 * - getExchangeRate('EUR') podría retornar 0.92
 *   Esto significa: 1 USD = 0.92 EUR
 * 
 * @throws {Error} Si la moneda no es válida o la API falla
 */
exports.getExchangeRate = async (currency) => {
  /**
   * Caso especial: Si la moneda es USD, la tasa siempre es 1
   * (1 USD = 1 USD)
   */
  if (currency === 'USD') {
    return 1;
  }

  /**
   * Hacer petición HTTP GET a la API externa
   * 
   * axios.get() retorna una Promise que se resuelve con la respuesta.
   * La API retorna un objeto con todas las tasas de cambio.
   * 
   * Ejemplo de respuesta:
   * {
   *   rates: {
   *     EUR: 0.92,
   *     ARS: 64.51,
   *     BRL: 5.23,
   *     ...
   *   }
   * }
   */
  const response = await axios.get(EXCHANGE_RATE_API);
  
  /**
   * Validar que la respuesta tenga la estructura esperada
   * 
   * Verificamos que:
   * 1. response.data existe
   * 2. response.data.rates existe
   * 3. response.data.rates[currency] existe (la moneda solicitada está en la respuesta)
   */
  if (!response.data || !response.data.rates || !response.data.rates[currency]) {
    throw new Error(`No se pudo obtener la tasa de conversión para ${currency}`);
  }

  /**
   * Extraer y convertir la tasa a número
   * 
   * parseFloat() convierte el string a número decimal.
   * Ejemplo: "64.51" -> 64.51
   */
  const rate = parseFloat(response.data.rates[currency]);
  
  /**
   * Validar que la tasa sea válida
   * 
   * Verificamos que:
   * - rate no sea null/undefined
   * - rate no sea 0 (una tasa de 0 no tiene sentido)
   */
  if (!rate || rate === 0) {
    throw new Error(`Tasa de conversión inválida para ${currency}`);
  }

  // Retornar la tasa de conversión
  return rate;
};

