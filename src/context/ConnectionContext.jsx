/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useState, useEffect } from 'react'; // Importa los hooks y funciones necesarios de React
import { Strophe } from 'strophe.js'; // Importa la librería Strophe.js para XMPP
import consts from '../helpers/consts'; // Importa constantes de configuración
import PropTypes from 'prop-types'; // Importa PropTypes para la validación de las props
import { sendPresence } from '../hooks/hooks'; // Importa la función para enviar presencia
import { decrypt, encrypt } from '../helpers/encryptCredentials'; // Importa funciones para encriptar y desencriptar credenciales
import XMPPError from './../helpers/XMPPError'; // Importa la clase de error personalizada para XMPP
import 'strophe-plugin-register'; // Importa el plugin de registro de Strophe
import LoadingPage from '../pages/LoadingPage/LoadingPage'; // Importa la página de carga

// Crea un contexto para la conexión XMPP
const ConnectionContext = createContext();

// Proveedor del contexto de conexión XMPP
const ConnectionProvider = ({ children }) => {
    const [connection] = useState(() => new Strophe.Connection(consts.XMPP_SERVER)); // Inicializa la conexión con el servidor XMPP
    const [isConnectionReady, setIsConnectionReady] = useState(false); // Estado para indicar si la conexión está lista
    const [clientPresence, setClientPresence] = useState(undefined); // Estado para la presencia del cliente

    useEffect(() => {
        // Intenta recuperar una sesión almacenada en localStorage
        const session = localStorage.getItem('session');

        if (session) {
            // Si hay una sesión, desencripta las credenciales y realiza el login
            const { user, password } = decrypt(session);
            login({ user, password }).then(() => {
                setIsConnectionReady(true);
            }).catch((err) => {
                console.error('Error al iniciar sesión:', err);
                setIsConnectionReady(true);
            });
        } else {
            // Si no hay sesión, marca la conexión como lista
            setIsConnectionReady(true);
        }
    }, []); // El array vacío asegura que el efecto se ejecute solo una vez al montar el componente

    // Función para iniciar sesión en el servidor XMPP
    const login = ({ user, password }) => {
        return new Promise((resolve, reject) => {
            connection.connect(`${user}@${consts.DOMAIN_NAME}/${consts.RESOURCE}`, password, (status) => {
                switch (status) {
                    case Strophe.Status.CONNECTED:
                        // Si se conecta exitosamente, almacena las credenciales y establece la presencia del cliente
                        localStorage.setItem('session', encrypt(user, password));
                        sendPresence(connection, 'available');
                        setClientPresence('available');
                        resolve();
                        break;
                    case Strophe.Status.AUTHFAIL:
                        reject(new XMPPError('Credenciales incorrectas.', Strophe.Status.AUTHFAIL));
                        break;
                    case Strophe.Status.CONNFAIL:
                        reject(new XMPPError('Falló la conexión al servidor XMPP.', Strophe.Status.CONNFAIL));
                        break;
                    case Strophe.Status.DISCONNECTED:
                        reject(new XMPPError('Desconectado del servidor XMPP.', Strophe.Status.DISCONNECTED));
                        break;
                    default:
                        console.log(`Estado de conexión: ${status}`);
                        break;
                }
            });
        });
    };

    // El objeto que se proporciona a los consumidores del contexto
    const server = {
        clientPresence,
        setClientPresence,
        connection,
        login,
        isConnectionReady,
    };

    // Muestra la página de carga si la conexión no está lista
    if (!isConnectionReady) {
        return (
            <LoadingPage />
        );
    }

    // Proporciona el contexto a los componentes hijos
    return (
        <ConnectionContext.Provider value={server}>
            {children}
        </ConnectionContext.Provider>
    );
};

// Definición de las propiedades esperadas del componente
ConnectionProvider.propTypes = {
    children: PropTypes.node.isRequired, // Los hijos del proveedor deben ser nodos React
};

// Exporta el proveedor y el contexto
export { ConnectionProvider };
export default ConnectionContext;
