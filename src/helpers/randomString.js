/**
 * Genera una cadena aleatoria de caracteres alfanuméricos.
 * 
 * @param {number} [length=10] - La longitud de la cadena generada. Por defecto es 10.
 * @returns {string} - La cadena aleatoria generada.
 */
export default (length = 10) => {
  let cadena = ''; // Inicializa la cadena resultante como una cadena vacía.
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; // Conjunto de caracteres posibles.

  // Itera desde 0 hasta la longitud deseada de la cadena.
  for (let i = 0; i < length; i += 1) {
    // Selecciona un carácter aleatorio del conjunto de caracteres y lo agrega a la cadena.
    cadena += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }

  return cadena; // Devuelve la cadena aleatoria generada.
};
