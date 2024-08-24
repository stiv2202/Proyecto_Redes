import { Strophe, $msg, $pres, $iq } from 'strophe.js';
import consts from '../helpers/consts';

const sendPresence = (connection, type) => {
    if (!connection || !connection.connected) {
        console.error('No se puede enviar presencia. La conexión no está activa.');
        return;
    }
    const presence = $pres({ type }).c('priority').t('50');
    connection.send(presence);
};

const sendMessage = (connection, to, body) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        try {
            const message = $msg({
                to: Strophe.getBareJidFromJid(to),
                type: 'chat'
            }).c('body').t(body);

            connection.send(message);
            console.log('Mensaje enviado a:', to, 'con el cuerpo:', body);
            resolve(`Mensaje enviado a ${to}`);
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
            reject(new Error(`Error al enviar el mensaje: ${error.message}`));
        }
    });
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

const getContacts = (connection) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        const iq = $iq({ type: 'get', xmlns: 'jabber:iq:roster', id: 'roster1' })
            .c('query', { xmlns: 'jabber:iq:roster' });

        connection.sendIQ(iq, (response) => {
            const query = response.querySelector('query');

            if (!query) {
                console.error('Elemento <query> no encontrado en la respuesta');
                return reject(new Error('Elemento <query> no encontrado en la respuesta'));
            }

            const items = query.querySelectorAll('item');
            const contacts = [];

            items.forEach(item => {
                const jid = item.getAttribute('jid');
                const name = item.getAttribute('name') || jid.split('@')[0];
                contacts.push({ jid, name });
            });

            resolve(contacts);
        }, (error) => {
            console.error('Error al obtener los contactos:', error);
            reject(new Error(`Error al obtener los contactos: ${error.condition}`));
        });
    });
};

const addContact = (connection, jid, name) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        const iq = $iq({ type: 'set', id: 'roster_add' })
            .c('query', { xmlns: 'jabber:iq:roster' })
            .c('item', { jid, name, subscription: 'both' });

        connection.sendIQ(iq, (response) => {
            console.log('Respuesta de agregar contacto:', response);
            const subscribePresence = $pres({ to: jid, type: 'subscribe' });
            connection.send(subscribePresence);

            resolve('Contacto agregado y suscripción a la presencia solicitada.');
        }, (error) => {
            console.error('Error al agregar el contacto:', error);
            reject(new Error(`Error al agregar el contacto: ${error.condition}`));
        });
    });
};

const handlePresence = (connection, updatePresence) => {
    if (!connection || !connection.connected) {
        console.error('La conexión no está activa.');
        return;
    }

    const presenceHandler = (presence) => {
        const from = presence.getAttribute('from');
        const type = presence.getAttribute('type') || 'available';
        const bareJid = Strophe.getBareJidFromJid(from);


        // console.log(`Presencia recibida de ${from}:\nEstado:${type}`)
        updatePresence(bareJid, type);

        return true;
    };
    connection.addHandler(presenceHandler, null, 'presence');
};

const getContactDetails = (connection, jid) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        const iq = $iq({ type: 'get', xmlns: 'jabber:iq:roster', id: 'roster_get' })
            .c('query', { xmlns: 'jabber:iq:roster' });

        connection.sendIQ(iq, (response) => {
            try {

                let items = response.getElementsByTagName('item');
                let contact = null;

                const item = Array.from(items).find(i => i.getAttribute('jid') === jid);

                contact = {
                    jid: item.getAttribute('jid'),
                    name: item.getAttribute('name'),
                    subscription: item.getAttribute('subscription')
                };

                if (contact) {
                    resolve(contact);
                } else {
                    reject(new Error('No se encontraron detalles para el contacto especificado.'));
                }
            } catch (error) {
                console.error('Error al procesar la respuesta:', error);
                reject(new Error('Error al procesar la respuesta'));
            }
        }, (error) => {
            console.error('Error al obtener los detalles del contacto:', error);
            reject(new Error(`Error al obtener los detalles del contacto: ${error.condition}`));
        });
    });
};

const handleIncomingMessages = (connection, onMessageReceived) => {
    if (!connection || !connection.connected) {
        console.error('La conexión no está activa.');
        return;
    }

    const messageHandler = (msg) => {
        const from = msg.getAttribute('from');
        const body = msg.getElementsByTagName('body')[0];
        const oob = msg.getElementsByTagName('x')[0];

        if (body && oob) {
            const messageText = Strophe.getText(body);
            const fileUrl = oob.getElementsByTagName('url')[0];
            if (fileUrl) {
                const url = Strophe.getText(fileUrl);
                onMessageReceived(from, messageText, url);
            }
        } else if (body) {
            const messageText = Strophe.getText(body);
            onMessageReceived(from, messageText);
        }

        return true;
    };

    // Añadir el manejador para todos los mensajes de tipo 'message'
    connection.addHandler(messageHandler, null, 'message', null, null, null);
};

const sendFile = async (connection, to, file) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        // URL de subida del servidor
        const uploadUrl = 'https://alumchat.lol:7443/httpfileupload/';

        try {
            const uniqueFileName = `${Date.now()}_${encodeURIComponent(file.name)}`;
            const fullUrl = `${uploadUrl}${uniqueFileName}`;

            // Subimos el archivo usando la URL proporcionada por el servidor
            fetch(fullUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type, // Asegura que se envíe el tipo MIME del archivo
                }
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Error al subir el archivo: ${response.statusText}`);
                    }

                    // Enviamos el mensaje con el enlace del archivo
                    const message = $msg({ to: to, type: 'chat' })
                        .c('body').t(`Nuevo mensaje: ${fullUrl}`).up()
                        .c('x', { xmlns: 'jabber:x:oob' })
                        .c('url').t(fullUrl);

                    connection.send(message);
                    resolve('Archivo enviado con éxito');
                })
                .catch((error) => {
                    reject(new Error(`Error al subir el archivo: ${error.message}`));
                });
        } catch (error) {
            reject(new Error(`Error al preparar la subida del archivo: ${error.message}`));
        }
    });
};

export {
    logout,
    sendMessage,
    sendPresence,
    deleteAccount,
    getContacts,
    addContact,
    getContactDetails,
    handlePresence,
    handleIncomingMessages,
    sendFile,
};
