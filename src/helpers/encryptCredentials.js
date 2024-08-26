import CryptoJS from "crypto-js"; // Importa la librería CryptoJS para operaciones de cifrado y descifrado
import { secretKey } from "./key"; // Importa la clave secreta utilizada para cifrar y descifrar datos

/**
 * Cifra el nombre de usuario y la contraseña utilizando AES y devuelve una cadena JSON con los datos cifrados.
 *
 * @param {string} user - El nombre de usuario a cifrar.
 * @param {string} password - La contraseña a cifrar.
 * @returns {string} - Una cadena JSON que contiene el nombre de usuario y la contraseña cifrados.
 */
export const encrypt = (user, password) => {
    // Cifra el nombre de usuario utilizando la clave secreta
    const encryptedUser = CryptoJS.AES.encrypt(user, secretKey).toString();
    // Cifra la contraseña utilizando la misma clave secreta
    const encryptedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();

    // Devuelve los datos cifrados como una cadena JSON
    return JSON.stringify({
        user: encryptedUser,
        password: encryptedPassword
    });
}

/**
 * Descifra una cadena JSON que contiene el nombre de usuario y la contraseña cifrados.
 *
 * @param {string} session - La cadena JSON que contiene los datos cifrados.
 * @returns {Object} - Un objeto que contiene el nombre de usuario y la contraseña descifrados.
 */
export const decrypt = (session) => {
    // Parsea la cadena JSON para obtener los datos cifrados
    session = JSON.parse(session);
    const encryptedUser = session.user;
    const encryptedPassword = session.password;

    // Descifra el nombre de usuario utilizando la clave secreta
    const user = CryptoJS.AES.decrypt(encryptedUser, secretKey).toString(CryptoJS.enc.Utf8);
    // Descifra la contraseña utilizando la misma clave secreta
    const password = CryptoJS.AES.decrypt(encryptedPassword, secretKey).toString(CryptoJS.enc.Utf8);

    // Devuelve el nombre de usuario y la contraseña descifrados
    return { user, password };
}
