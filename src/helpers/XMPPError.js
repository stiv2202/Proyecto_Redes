/**
 * Clase personalizada para representar errores específicos de XMPP.
 * Extiende la clase nativa `Error` para incluir información adicional.
 */
class XMPPError extends Error {
  /**
   * Crea una instancia de XMPPError.
   * 
   * @param {string} message - El mensaje de error descriptivo.
   * @param {number} code - El código de error específico asociado con el error.
   */
  constructor(message, code) {
    super(message); // Llama al constructor de la clase base `Error` con el mensaje de error.
    this.name = "XMPPError"; // Asigna un nombre a la instancia de error, que será "XMPPError".
    this.code = code; // Asigna un código de error a la instancia, que proporciona información adicional sobre el error.
  }
}

export default XMPPError; // Exporta la clase para que pueda ser utilizada en otros módulos.
