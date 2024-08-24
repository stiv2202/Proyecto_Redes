import { Strophe, $msg, $pres, $iq } from 'strophe.js';
import consts from '../helpers/consts';

const sendPresence = (connection, type) => {
    if (!connection || !connection.connected) {
        console.error('No se puede enviar presencia. La conexión no está activa.');
        return;
    }

    const presence = $pres({
        type,
    }).c('priority').t('50');
    connection.send(presence);
};

const sendMessage = (connection, to, body) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        const isGroupChat = to.split('@')[1].split('.')[0] === 'conference'

        try {
            const message = $msg({
                to: isGroupChat ? to : Strophe.getBareJidFromJid(to),
                type: isGroupChat ? 'groupchat' : 'chat'
            }).c('body').t(body);

            connection.send(message);
            console.log(`Mensaje enviado a ${to} (${isGroupChat ? 'grupo' : 'chat individual'})`);
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
            const subscribePresence = $pres({ to: jid, type: 'subscribe' }).c('priority').t('50');
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
        const type = msg.getAttribute('type');
        const body = msg.getElementsByTagName('body')[0];
        const oob = msg.getElementsByTagName('x')[0];

        if (body) {
            const messageText = Strophe.getText(body);
            let url = null;

            if (oob) {
                const fileUrl = oob.getElementsByTagName('url')[0];
                if (fileUrl) {
                    url = Strophe.getText(fileUrl);
                }
            }

            const sender = type === 'groupchat' ? Strophe.getResourceFromJid(from) : Strophe.getBareJidFromJid(from);
            const roomJid = type === 'groupchat' ? Strophe.getBareJidFromJid(from) : null;

            onMessageReceived(sender, messageText, url, type === 'groupchat', roomJid);
        }

        return true;
    };
    connection.addHandler(messageHandler, null, 'message', null, null, null);
};

const sendFile = (connection, to, file) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        const isGroupChat = to.split('@')[1].split('.')[0] === 'conference'
        const uploadService = 'httpfileupload.alumchat.lol';

        const iq = $iq({ type: 'get', to: uploadService })
            .c('request', { xmlns: 'urn:xmpp:http:upload:0' })
            .c('filename').t(file.name).up()
            .c('size').t(file.size.toString()).up()
            .c('content-type').t(file.type);

        connection.sendIQ(iq,
            async function (result) {
                const putUrl = result.querySelector('slot put').getAttribute('url');
                const getUrl = result.querySelector('slot get').getAttribute('url');

                try {
                    const response = await fetch(putUrl, {
                        method: 'PUT',
                        body: file,
                        headers: {
                            'Content-Type': file.type
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const message = $msg({
                        to: isGroupChat ? to : Strophe.getBareJidFromJid(to),
                        type: isGroupChat ? 'groupchat' : 'chat'
                    })
                        .c('x', { xmlns: 'jabber:x:oob' })
                        .c('url').t(getUrl).up()

                    connection.send(message);
                    resolve('Archivo enviado con éxito.')
                } catch (error) {
                    console.error('Error al subir el archivo:', error);
                    reject(new Error(`Error al subir el archivo: ${error.message}`));
                }
            },
            function (error) {
                console.error('Error IQ completo:', error);
                const errorText = error.getElementsByTagName('text')[0];
                const errorMessage = errorText ? errorText.textContent : 'Error desconocido';
                reject(new Error(`Error al solicitar slot de carga: ${errorMessage}`));
            }
        );
    });
};

const discoverServices = (connection, serviceJid) => {
    return new Promise((resolve, reject) => {
        connection.sendIQ(
            $iq({ to: serviceJid, type: 'get' }).c('query', { xmlns: 'http://jabber.org/protocol/disco#items' }),
            function (result) {
                const items = result.getElementsByTagName('item');
                const services = Array.from(items).map(item => ({
                    jid: item.getAttribute('jid'),
                    node: item.getAttribute('node'),
                }));
                resolve(services);
            },
            function (error) {
                if (error.getElementsByTagName('feature-not-implemented').length > 0) {
                    console.error('El servicio no soporta disco#items:', error);
                    // Considera intentar otra consulta aquí, como disco#info.
                } else {
                    console.error('Error al descubrir servicios:', error);
                }
                reject(error);
            }
        );
    });
};

const createGroupChatRoom = (connection, roomName, nickname) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        const roomJid = `${roomName}@conference.${consts.DOMAIN_NAME}`;

        // Unirse a la sala antes de configurarla
        const presence = $pres({ to: `${roomJid}/${nickname}` })
            .c('x', { xmlns: 'http://jabber.org/protocol/muc' });

        connection.send(presence.tree());

        // Esperar un poco para asegurarse de que se ha unido a la sala
        setTimeout(() => {
            const iq = $iq({ type: 'set', to: roomJid, id: 'create_room' })
                .c('query', { xmlns: 'http://jabber.org/protocol/muc#owner' })
                .c('x', { xmlns: 'jabber:x:data', type: 'submit' })
                .c('field', { var: 'FORM_TYPE' })
                .c('value').t('http://jabber.org/protocol/muc#roomconfig').up()
                .up()
                .c('field', { var: 'muc#roomconfig_roomname' })
                .c('value').t(roomName).up()
                .c('field', { var: 'muc#roomconfig_nickname' })
                .c('value').t(nickname);

            connection.sendIQ(iq,
                (response) => {
                    console.log('Sala grupal creada:', response);
                    resolve('Sala grupal creada con éxito.');
                },
                (error) => {
                    console.error('Error al crear la sala grupal:', error);
                    reject(new Error(`Error al crear la sala grupal: ${error.condition}`));
                }
            );
        }, 1000); // Esperar 1 segundo (puede ajustarse según sea necesario)
    });
};


const joinGroupChatRoom = (connection, roomName, nickname) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        const roomJid = `${roomName}@conference.${consts.DOMAIN_NAME}`;
        const presence = $pres({ to: `${roomJid}/${nickname}` })
            .c('x', { xmlns: 'http://jabber.org/protocol/muc' })
            .up()
            .c('priority').t('50');

        connection.send(presence);
        resolve(`Unido a la sala ${roomName} como ${nickname}`);
    });
};

const listAvailableRooms = (connection) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        const discoServiceJid = 'conference.' + consts.DOMAIN_NAME;
        const iq = $iq({ type: 'get', to: discoServiceJid })
            .c('query', { xmlns: 'http://jabber.org/protocol/disco#items' });

        connection.sendIQ(iq,
            (result) => {
                const items = result.getElementsByTagName('item');
                const rooms = Array.from(items).map(item => {
                    return ({
                        jid: item.getAttribute('jid'),
                        name: item.getAttribute('name'),
                    })
                });
                resolve(rooms);
            },
            (error) => {
                console.error('Error al listar las salas disponibles:', error);
                reject(new Error(`Error al listar las salas disponibles: ${error.condition}`));
            }
        );
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
    discoverServices,
    createGroupChatRoom,
    joinGroupChatRoom,
    listAvailableRooms
};
