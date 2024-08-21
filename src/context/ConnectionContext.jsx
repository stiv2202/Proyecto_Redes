import { createContext, useState, useEffect } from 'react';
import { Strophe } from 'strophe.js';
import consts from '../helpers/consts';
import decodeHtmlEntities from '../helpers/decodeHtmlEntities';
import PropTypes from 'prop-types';
import { sendPresence } from '../hooks/hooks';

const ConnectionContext = createContext();
const ConnectionProvider = ({ children }) => {
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        let conn = JSON.parse(sessionStorage.getItem('session'))
        if (!conn)
            conn = new Strophe.Connection(consts.XMPP_SERVER);
        setConnection(conn);

        return () => {
            if (conn) conn.disconnect();
        };
    }, []);

    useEffect(() => {
        if (connection) {
            connection.addHandler(onMessage, null, 'message', 'chat', null);
        }
    }, [connection]);

    const login = ({ user, password }) => {
        return new Promise((resolve, reject) => {
            if (!connection) {
                return reject(new Error('La conexión no está disponible.'));
            }

            connection.connect(`${user}@${consts.DOMAIN_NAME}/${consts.RESOURCE}`, password, (status) => {
                switch (status) {
                    case Strophe.Status.CONNECTED:
                        console.log(`Conectado exitosamente como ${user}@${consts.DOMAIN_NAME}/${consts.RESOURCE}`);
                        sessionStorage.setItem('session', JSON.stringify(connection));
                        sendPresence(connection, 'available');
                        resolve();
                        break;
                    case Strophe.Status.AUTHFAIL:
                        console.error('Falló la autenticación.');
                        reject(new Error('Falló la autenticación.'));
                        break;
                    case Strophe.Status.CONNFAIL:
                        console.error('Falló la conexión al servidor XMPP.');
                        reject(new Error('Falló la conexión al servidor XMPP.'));
                        break;
                    case Strophe.Status.DISCONNECTED:
                        console.log('Desconectado del servidor XMPP.');
                        reject(new Error('Desconectado del servidor XMPP.'));
                        break;
                    default:
                        console.log(`Estado de conexión: ${status}`);
                        break;
                }
            });
        });
    };

    const onMessage = (message) => {
        const from = message.getAttribute('from');
        const bodyElement = message.getElementsByTagName('body')[0];
        if (bodyElement) {
            let body = Strophe.getText(bodyElement);
            body = decodeHtmlEntities(body);
            console.log(`Mensaje recibido de ${from}: ${body}`);
        }
        return true;
    };

    const server = {
        connection,
        login,
    }

    return (
        <ConnectionContext.Provider value={server}>
            {children}
        </ConnectionContext.Provider>
    );
};

export { ConnectionProvider };
export default ConnectionContext;

ConnectionProvider.propTypes = {
    children: PropTypes.node.isRequired,
};