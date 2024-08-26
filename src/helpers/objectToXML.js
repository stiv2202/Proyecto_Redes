/* eslint-disable no-prototype-builtins */
/**
 * Convierte un objeto JavaScript en una cadena XML.
 * 
 * @param {Object} obj - El objeto JavaScript que se desea convertir en XML.
 * @param {string} [rootElement='root'] - El nombre del elemento raíz del XML.
 * @returns {string} - La cadena XML generada a partir del objeto.
 */
export default function objectToXML(obj, rootElement = 'root') {
    // Inicia la cadena XML con el elemento raíz
    let xml = `<${rootElement}>`;

    // Itera sobre las propiedades del objeto
    for (const key in obj) {
        // Verifica si la propiedad es propia del objeto y no heredada
        if (obj.hasOwnProperty(key)) {
            // Si el valor de la propiedad es un objeto y no un array, llama recursivamente a objectToXML
            if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                xml += objectToXML(obj[key], key);
            } else {
                // De lo contrario, agrega la propiedad como un elemento XML
                xml += `<${key}>${obj[key]}</${key}>`;
            }
        }
    }

    // Cierra el elemento raíz
    xml += `</${rootElement}>`;
    return xml;
}
