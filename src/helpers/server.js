import { Strophe, $msg, $pres, $iq } from 'strophe.js';
import consts from './consts';
import decodeHtmlEntities from './decodeHtmlEntities'

const connection = new Strophe.Connection(consts.XMPP_SERVER);

const login = ({ user, password }) => {
    return new Promise((resolve, reject) => {
        connection.connect(`${user}@${consts.DOMAIN_NAME}/${consts.RESOURCE}`, password, (status) => {
            switch (status) {
                case Strophe.Status.CONNECTED:
                    console.log(`Conectado exitosamente como ${user}@${consts.DOMAIN_NAME}/${consts.RESOURCE}`);
                    connection.addHandler(onMessage, null, 'message', 'chat', null);
                    sessionStorage.setItem('session', `${user}@${consts.DOMAIN_NAME}/${consts.RESOURCE}`);
                    sendPresence('available');
                    resolve(); // Resolución exitosa
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
        body = decodeHtmlEntities(body)
        console.log(`Mensaje recibido de ${from}: ${body}`);
    }

    return true;
}

const sendPresence = (type) => {
    const presence = $pres({
        type
    });
    connection.send(presence);
}

const sendMessage = (from, to, body) => {
    from = `${from}@${consts.DOMAIN_NAME}`;
    from = `${from}${consts.RESOURCE.trim() != '' ? `/${consts.RESOURCE}` : ''}`;
    to = `${to}${consts.RESOURCE.trim() != '' ? `/${consts.RESOURCE}` : ''}`;
    const message = $msg({
        to,
        from,
        type: 'chat'
    }).c('body').t(body);

    connection.send(message);
};

const deleteAccount = () => {
    return new Promise((resolve, reject) => {
        if (!connection || connection.state !== Strophe.Status.CONNECTED) {
            return reject(new Error('La conexión no está activa.'));
        }

        const jid = connection.jid;
        const user = jid.split('@')[0];
        const iq = $iq({
            type: 'set',
            from: `${user}@${consts.DOMAIN_NAME}`,
            id: 'delete1'
        })
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

const logout = () => {
    return new Promise((resolve, reject) => {
        try {
            if (!connection || connection.state !== Strophe.Status.CONNECTED) {
                return reject(new Error('La conexión no está activa.'));
            }
            connection.disconnect();
            sessionStorage.removeItem('session');
            console.log('Sesión cerrada y desconectado del servidor XMPP.');
            resolve();
        } catch (e) {
            console.log('Error al cerrar sesión.')
            reject(new Error('Falló la autenticación.'))
        }
    });
};


export { login, sendMessage, sendPresence, logout, deleteAccount }