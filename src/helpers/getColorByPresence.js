/**
 * Devuelve un color asociado a un estado de presencia dado.
 * 
 * @param {string} presence - El estado de presencia para el que se desea obtener el color.
 * @returns {string} - El color correspondiente al estado de presencia.
 */
const getColorByPresence = (presence) => {
    switch (presence) {
        case 'available':
            // Devuelve 'green' para el estado 'available'
            return 'green';
        case 'unavailable':
            // Devuelve 'red' para el estado 'unavailable'
            return 'red';
        case 'subscribe':
            // Devuelve 'yellow' para el estado 'subscribe'
            return 'yellow';
        case 'subscribed':
            // Devuelve 'orange' para el estado 'subscribed'
            return 'orange';
        case 'unknown':
            // Devuelve 'gray' para el estado 'unknown'
            return 'gray';
        default:
            // Devuelve 'black' para cualquier otro valor no esperado
            return 'black';
    }
};

export default getColorByPresence; // Exporta la función para su uso en otros módulos
