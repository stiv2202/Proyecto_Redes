/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useState, useEffect } from 'react';
import { Strophe } from 'strophe.js';
import consts from '../helpers/consts';
import PropTypes from 'prop-types';
import { sendPresence } from '../hooks/hooks';
import { decrypt, encrypt } from '../helpers/encryptCredentials';

const ConnectionContext = createContext();

const ConnectionProvider = ({ children }) => {
    const [connection, setConnection] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const conn = new Strophe.Connection(consts.XMPP_SERVER);
        setConnection(conn);

        return () => {
            if (conn) conn.disconnect();
        };
    }, []);

    useEffect(() => {
        if (connection) {
            const session = localStorage.getItem('session');
            if (session) {
                const { user, password } = decrypt(session);
                login({ user, password }).then(() => {
                    setIsAuthenticated(true);
                }).catch((err) => {
                    console.error('Error al iniciar sesión:', err);
                    setIsAuthenticated(false);
                }).finally(() => {
                    setIsLoading(false);
                });
            } else {
                setIsLoading(false);
            }
        }
    }, [connection]);

    const login = ({ user, password }) => {
        return new Promise((resolve, reject) => {
            if (!connection) {
                return reject(new Error('La conexión no está disponible.'));
            }

            connection.connect(`${user}@${consts.DOMAIN_NAME}`, password, (status) => {
                switch (status) {
                    case Strophe.Status.CONNECTED:
                        localStorage.setItem('session', encrypt(user, password));
                        sendPresence(connection, 'available');
                        resolve();
                        break;
                    case Strophe.Status.AUTHFAIL:
                        console.error('Falló la autenticación.');
                        setIsAuthenticated(false);
                        reject(new Error('Falló la autenticación.'));
                        break;
                    case Strophe.Status.CONNFAIL:
                        console.error('Falló la conexión al servidor XMPP.');
                        setIsAuthenticated(false);
                        reject(new Error('Falló la conexión al servidor XMPP.'));
                        break;
                    case Strophe.Status.DISCONNECTED:
                        console.log('Desconectado del servidor XMPP.');
                        setIsAuthenticated(false);
                        reject(new Error('Desconectado del servidor XMPP.'));
                        break;
                    default:
                        console.log(`Estado de conexión: ${status}`);
                        break;
                }
            });
        });
    };

    const server = {
        connection,
        isAuthenticated,
        isLoading,
        login,
    };

    return (
        <ConnectionContext.Provider value={server}>
            {children}
        </ConnectionContext.Provider>
    );
};

ConnectionProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export { ConnectionProvider };
export default ConnectionContext;
