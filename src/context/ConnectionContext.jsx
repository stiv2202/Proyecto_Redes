/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useState, useEffect } from 'react';
import { Strophe } from 'strophe.js';
import consts from '../helpers/consts';
import PropTypes from 'prop-types';
import { sendPresence } from '../hooks/hooks';
import { decrypt, encrypt } from '../helpers/encryptCredentials';
import XMPPError from './../helpers/XMPPError'
import 'strophe-plugin-register';

// Strophe.addConnectionPlugin('register', Strophe.RegisterPlugin);
// console.log('plugin: ',Strophe.RegisterPlugin);

const ConnectionContext = createContext();

const ConnectionProvider = ({ children }) => {
    const [connection] = useState(() => new Strophe.Connection(consts.XMPP_SERVER));
    const [isConnectionReady, setIsConnectionReady] = useState(false);
    const [clientPresence, setClientPresence] = useState(undefined);

    useEffect(() => {
        const session = localStorage.getItem('session');

        if (session) {
            const { user, password } = decrypt(session);
            login({ user, password }).then(() => {
                setIsConnectionReady(true);
            }).catch((err) => {
                console.error('Error al iniciar sesión:', err);
                setIsConnectionReady(true);
            });
        } else {
            setIsConnectionReady(true);
        }
    }, []);

    const login = ({ user, password }) => {
        return new Promise((resolve, reject) => {
            connection.connect(`${user}@${consts.DOMAIN_NAME}/${consts.RESOURCE}`, password, (status) => {
                switch (status) {
                    case Strophe.Status.CONNECTED:
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

    const server = {
        clientPresence,
        setClientPresence,
        connection,
        login,
        isConnectionReady,
    };

    if (!isConnectionReady) {
        return (
            <>Cargando...</>
        );
    }

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
