import { Strophe, $msg, $pres, $iq } from 'strophe.js';
import consts from '../helpers/consts';

const sendPresence = (connection, type) => {
    const presence = $pres({ type });
    connection.send(presence);
};

const sendMessage = (connection, from, to, body) => {
    from = `${from}@${consts.DOMAIN_NAME}`;
    from = `${from}${consts.RESOURCE.trim() !== '' ? `/${consts.RESOURCE}` : ''}`;
    to = `${to}${consts.RESOURCE.trim() !== '' ? `/${consts.RESOURCE}` : ''}`;
    const message = $msg({ to, from, type: 'chat' }).c('body').t(body);
    connection.send(message);
};

const deleteAccount = (connection) => {
    return new Promise((resolve, reject) => {
        if (!connection || connection.state !== Strophe.Status.CONNECTED) {
            return reject(new Error('La conexión no está activa.'));
        }

        const jid = connection.jid;
        const user = jid.split('@')[0];
        const iq = $iq({ type: 'set', from: `${user}@${consts.DOMAIN_NAME}`, id: 'delete1' })
            .c('query', { xmlns: 'jabber:iq:register' })
            .c('remove');

        connection.sendIQ(iq, (response) => {
            console.log('Respuesta de eliminación de cuenta:', response);
            connection.disconnect();
            sessionStorage.removeItem('session');
            console.log('Cuenta eliminada y desconectado del servidor XMPP.');
            resolve('Cuenta eliminada y desconectado del servidor XMPP.');
        }, (error) => {
            console.error('Error al eliminar la cuenta:', error);
            reject(new Error('Error al eliminar la cuenta.'));
        });
    });
};

const logout = (connection) => {
    return new Promise((resolve, reject) => {
        try {
            console.log("estado: ", connection.state)
            if (!connection || connection.state !== Strophe.Status.CONNECTED) {
                return reject(new Error('La conexión no está activa.'));
            }
            connection.disconnect();
            sessionStorage.removeItem('session');
            console.log('Sesión cerrada y desconectado del servidor XMPP.');
            resolve();
        } catch (e) {
            console.log('Error al cerrar sesión.');
            reject(new Error('Falló la autenticación.'));
        }
    });
};

export {
    logout,
    sendMessage,
    sendPresence,
    deleteAccount
}