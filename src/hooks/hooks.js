import { Strophe, $msg, $pres, $iq } from 'strophe.js';
import consts from '../helpers/consts';

const sendPresence = (connection, type) => {
    if (!connection || !connection.connected) {
        console.error('No se puede enviar presencia. La conexión no está activa.');
        return;
    }
    const presence = $pres({ type });
    connection.send(presence);
};

const sendMessage = (connection, from, to, body) => {
    if (!connection || !connection.connected) {
        console.error('No se puede enviar el mensaje. La conexión no está activa.');
        return;
    }

    from = `${from}@${consts.DOMAIN_NAME}`;
    if (consts.RESOURCE.trim() !== '') {
        from = Strophe.getBareJidFromJid(from) + `/${consts.RESOURCE}`;
    }
    to = Strophe.getBareJidFromJid(to);
    if (consts.RESOURCE.trim() !== '') {
        to = to + `/${consts.RESOURCE}`;
    }

    const message = $msg({ to, from, type: 'chat' }).c('body').t(body);
    connection.send(message);
};

const deleteAccount = (connection) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        const jid = connection.jid;
        const user = Strophe.getNodeFromJid(jid);
        const iq = $iq({ type: 'set', from: `${user}@${consts.DOMAIN_NAME}`, id: 'delete1' })
            .c('query', { xmlns: 'jabber:iq:register' })
            .c('remove');

        connection.sendIQ(iq, (response) => {
            console.log('Respuesta de eliminación de cuenta:', response);
            connection.disconnect();
            localStorage.removeItem('session');
            console.log('Cuenta eliminada y desconectado del servidor XMPP.');
            resolve('Cuenta eliminada y desconectado del servidor XMPP.');
        }, (error) => {
            console.error('Error al eliminar la cuenta:', error);
            reject(new Error(`Error al eliminar la cuenta: ${error.condition}`));
        });
    });
};

const logout = (connection) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }
        try {
            connection.disconnect();
            localStorage.removeItem('session');
            console.log('Sesión cerrada y desconectado del servidor XMPP.');
            resolve();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            reject(new Error(`Error al cerrar sesión: ${error.message}`));
        }
    });
};

export {
    logout,
    sendMessage,
    sendPresence,
    deleteAccount
};
