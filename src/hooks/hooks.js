import { Strophe, $msg, $pres, $iq } from 'strophe.js';
import consts from '../helpers/consts';

/**
 * Envía una presencia al servidor XMPP con el tipo especificado.
 * 
 * @param {Strophe.Connection} connection - La conexión activa de Strophe.
 * @param {string} type - El tipo de presencia (e.g., 'available', 'unavailable').
 */
const sendPresence = (connection, type) => {
    if (!connection || !connection.connected) {
        console.error('No se puede enviar presencia. La conexión no está activa.');
        return;
    }

    const presence = $pres({ type }).c('priority').t('50');
    connection.send(presence);
};

/**
 * Envía un mensaje a un destinatario específico.
 * 
 * @param {Strophe.Connection} connection - La conexión activa de Strophe.
 * @param {string} to - El JID del destinatario.
 * @param {string} body - El cuerpo del mensaje.
 * @returns {Promise} - Una promesa que se resuelve cuando el mensaje se envía correctamente o se rechaza si ocurre un error.
 */
const sendMessage = (connection, to, body) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        // Determina si el mensaje es para un chat grupal o individual.
        const isGroupChat = to.split('@')[1].split('.')[0] === 'conference';

        try {
            const message = $msg({
                to: isGroupChat ? to : Strophe.getBareJidFromJid(to),
                type: isGroupChat ? 'groupchat' : 'chat'
            }).c('body').t(body);

            connection.send(message);
            resolve(`Mensaje enviado a ${to}`);
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
            reject(new Error(`Error al enviar el mensaje: ${error.message}`));
        }
    });
};

/**
 * Elimina la cuenta del usuario y desconecta la sesión.
 * 
 * @param {Strophe.Connection} connection - La conexión activa de Strophe.
 * @returns {Promise} - Una promesa que se resuelve cuando la cuenta se elimina y la desconexión se realiza correctamente, o se rechaza si ocurre un error.
 */
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

        connection.sendIQ(iq, () => {
            connection.disconnect();
            localStorage.removeItem('session');
            resolve('Cuenta eliminada y desconectado del servidor XMPP.');
        }, (error) => {
            console.error('Error al eliminar la cuenta:', error);
            reject(new Error(`Error al eliminar la cuenta: ${error.condition}`));
        });
    });
};

/**
 * Cierra la sesión del usuario y elimina la sesión del almacenamiento local.
 * 
 * @param {Strophe.Connection} connection - La conexión activa de Strophe.
 * @returns {Promise} - Una promesa que se resuelve cuando la sesión se cierra correctamente o se rechaza si ocurre un error.
 */
const logout = (connection) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }
        try {
            connection.disconnect();
            localStorage.removeItem('session');
            resolve();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            reject(new Error(`Error al cerrar sesión: ${error.message}`));
        }
    });
};

/**
 * Obtiene la lista de contactos del usuario desde el servidor XMPP.
 * 
 * @param {Strophe.Connection} connection - La conexión activa de Strophe.
 * @returns {Promise} - Una promesa que se resuelve con la lista de contactos o se rechaza si ocurre un error.
 */
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

/**
 * Agrega un nuevo contacto a la lista de contactos del usuario y solicita la suscripción a su presencia.
 * 
 * @param {Strophe.Connection} connection - La conexión activa de Strophe.
 * @param {string} jid - El JID del nuevo contacto.
 * @param {string} name - El nombre del nuevo contacto.
 * @returns {Promise} - Una promesa que se resuelve cuando el contacto se agrega y la suscripción se solicita correctamente, o se rechaza si ocurre un error.
 */
const addContact = (connection, jid, name) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        const iq = $iq({ type: 'set', id: 'roster_add' })
            .c('query', { xmlns: 'jabber:iq:roster' })
            .c('item', { jid, name, subscription: 'both' });

        connection.sendIQ(iq, () => {
            const subscribePresence = $pres({ to: jid, type: 'subscribe' }).c('priority').t('50');
            connection.send(subscribePresence);

            resolve('Contacto agregado y suscripción a la presencia solicitada.');
        }, (error) => {
            console.error('Error al agregar el contacto:', error);
            reject(new Error(`Error al agregar el contacto: ${error.condition}`));
        });
    });
};

/**
 * Maneja los eventos de presencia de los usuarios.
 * 
 * @param {Strophe.Connection} connection - La conexión activa de Strophe.
 * @param {Function} updatePresence - Función que actualiza la presencia de un usuario o sala.
 */
const handlePresence = (connection, updatePresence) => {
    if (!connection || !connection.connected) {
        console.error('La conexión no está activa.');
        return;
    }

    /**
     * Manejador de presencia que procesa los eventos de presencia.
     * 
     * @param {Element} presence - El elemento de presencia recibido.
     * @returns {boolean} - Devuelve true para seguir manejando más eventos de presencia.
     */
    const presenceHandler = (presence) => {
        const from = presence.getAttribute('from');
        const type = presence.getAttribute('type') || 'available';
        const bareJid = Strophe.getBareJidFromJid(from);
        const resource = Strophe.getResourceFromJid(from);

        // Verifica si la presencia es para una sala de chat múltiple (MUC)
        const x = presence.getElementsByTagName('x');
        const isMucPresence = x.length > 0 && x[0].getAttribute('xmlns') === 'http://jabber.org/protocol/muc#user';

        if (isMucPresence) {
            const item = presence.getElementsByTagName('item')[0];
            const roomPresence = {
                roomJid: bareJid,
                nick: resource,
                type: type,
                role: item ? item.getAttribute('role') : null,
                affiliation: item ? item.getAttribute('affiliation') : null
            };

            // Actualiza la presencia de la sala
            updatePresence(roomPresence.roomJid, roomPresence.type);
        } else {
            // Actualiza la presencia del usuario
            updatePresence(bareJid, type);
        }

        return true;
    };

    // Añade el manejador de presencia a la conexión
    connection.addHandler(presenceHandler, null, 'presence');
};

/**
 * Obtiene los detalles de un contacto específico.
 * 
 * @param {Strophe.Connection} connection - La conexión activa de Strophe.
 * @param {string} jid - El JID del contacto.
 * @returns {Promise} - Una promesa que se resuelve con los detalles del contacto o se rechaza si ocurre un error.
 */
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

                // Encuentra el contacto con el JID especificado
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

/**
 * Maneja los mensajes entrantes y los pasa a la función de devolución de llamada especificada.
 * 
 * @param {Strophe.Connection} connection - La conexión activa de Strophe.
 * @param {Function} onMessageReceived - Función de devolución de llamada que se llama cuando se recibe un mensaje.
 */
const handleIncomingMessages = (connection, onMessageReceived) => {
    if (!connection || !connection.connected) {
        console.error('La conexión no está activa.');
        return;
    }

    // Elimina cualquier manejador de mensajes existente
    const existingHandlers = connection.handlers;
    for (let i = 0; i < existingHandlers.length; i++) {
        if (existingHandlers[i].ns === null && existingHandlers[i].name === 'message') {
            connection.deleteHandler(existingHandlers[i]);
            break;
        }
    }

    /**
     * Manejador de mensajes que procesa los mensajes entrantes.
     * 
     * @param {Element} msg - El elemento de mensaje recibido.
     * @returns {boolean} - Devuelve true para seguir manejando más mensajes.
     */
    const messageHandler = (msg) => {
        const from = msg.getAttribute('from');
        const type = msg.getAttribute('type');
        const body = msg.getElementsByTagName('body')[0];
        const oob = msg.getElementsByTagName('x')[0];

        if (body) {
            const messageText = Strophe.getText(body);
            let url = null;

            // Obtiene la URL del archivo si está presente
            if (oob) {
                const fileUrl = oob.getElementsByTagName('url')[0];
                if (fileUrl) {
                    url = Strophe.getText(fileUrl);
                }
            }

            const sender = type === 'groupchat' ? Strophe.getResourceFromJid(from) : Strophe.getBareJidFromJid(from);
            const roomJid = type === 'groupchat' ? Strophe.getBareJidFromJid(from) : null;

            // Llama a la función de devolución de llamada con los detalles del mensaje
            onMessageReceived(sender, messageText, url, type === 'groupchat', roomJid);
        }

        return true;
    };

    // Añade el manejador de mensajes a la conexión
    connection.addHandler(messageHandler, null, 'message', null, null, null);
};

/**
 * Envía un archivo al servidor de carga y notifica a un usuario o sala sobre el archivo.
 * 
 * @param {Strophe.Connection} connection - La conexión activa de Strophe.
 * @param {string} to - El JID del destinatario o sala de chat.
 * @param {File} file - El archivo a enviar.
 * @returns {Promise} - Una promesa que se resuelve con la URL del archivo subido o se rechaza si ocurre un error.
 */
const sendFile = (connection, to, file) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        const isGroupChat = to.split('@')[1].split('.')[0] === 'conference';
        const uploadService = 'httpfileupload.alumchat.lol';

        // Crea una solicitud IQ para obtener un slot de carga en el servidor
        const iq = $iq({ type: 'get', to: uploadService })
            .c('request', { xmlns: 'urn:xmpp:http:upload:0' })
            .c('filename').t(file.name).up()
            .c('size').t(file.size.toString()).up()
            .c('content-type').t(file.type);

        connection.sendIQ(iq,
            async function (result) {
                // Obtiene las URLs de carga y descarga desde la respuesta IQ
                const putUrl = result.querySelector('slot put').getAttribute('url');
                const getUrl = result.querySelector('slot get').getAttribute('url');

                try {
                    // Envía el archivo al servidor de carga
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

                    // Crea y envía un mensaje con la URL del archivo
                    const message = $msg({
                        to: isGroupChat ? to : Strophe.getBareJidFromJid(to),
                        type: isGroupChat ? 'groupchat' : 'chat'
                    })
                        .c('x', { xmlns: 'jabber:x:oob' })
                        .c('url').t(getUrl).up();

                    connection.send(message);
                    resolve(getUrl);
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

/**
 * Descubre los servicios disponibles en un servidor XMPP mediante el protocolo Disco.
 * 
 * @param {Strophe.Connection} connection - La conexión activa de Strophe.
 * @param {string} serviceJid - El JID del servicio a descubrir.
 * @returns {Promise} - Una promesa que se resuelve con la lista de servicios descubiertos o se rechaza si ocurre un error.
 */
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
                } else {
                    console.error('Error al descubrir servicios:', error);
                }
                reject(error);
            }
        );
    });
};

/**
 * Crea una sala de chat grupal en el servidor XMPP.
 * 
 * @param {Strophe.Connection} connection - La conexión activa de Strophe.
 * @param {string} roomName - El nombre de la sala a crear.
 * @param {string} nickname - El apodo del usuario en la sala.
 * @returns {Promise} - Una promesa que se resuelve si la sala se crea con éxito o se rechaza si ocurre un error.
 */
const createGroupChatRoom = (connection, roomName, nickname) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        const roomJid = `${roomName.replaceAll(' ', '_')}@conference.${consts.DOMAIN_NAME}`;

        // Envia una presencia a la sala para unirse a ella
        const presence = $pres({ to: `${roomJid}/${nickname}` })
            .c('x', { xmlns: 'http://jabber.org/protocol/muc' });

        connection.send(presence.tree());

        setTimeout(() => {
            // Crea una solicitud IQ para configurar la sala
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
                () => {
                    resolve('Sala grupal creada con éxito.');
                },
                (error) => {
                    console.error('Error al crear la sala grupal:', error);
                    reject(new Error(`Error al crear la sala grupal: ${error.condition}`));
                }
            );
        }, 1000);
    });
};

/**
 * Se une a una sala de chat grupal en el servidor XMPP.
 * 
 * @param {Strophe.Connection} connection - La conexión activa de Strophe.
 * @param {string} roomName - El nombre de la sala a la que unirse.
 * @param {string} nickname - El apodo del usuario en la sala.
 * @returns {Promise} - Una promesa que se resuelve con la información de la sala o se rechaza si ocurre un error.
 */
const joinGroupChatRoom = (connection, roomName, nickname) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        const roomJid = `${roomName}@conference.${consts.DOMAIN_NAME}`;
        // Crea y envía una presencia para unirse a la sala con un apodo
        const presence = $pres({ to: `${roomJid}/${nickname}` })
            .c('x', { xmlns: 'http://jabber.org/protocol/muc' })
            .up()
            .c('priority').t('50'); // Define la prioridad del recurso en la sala

        connection.send(presence);
        resolve({ jid: roomJid, name: roomName });
    });
};

/**
 * Lista las salas de chat grupal disponibles en el servidor XMPP.
 * 
 * @param {Strophe.Connection} connection - La conexión activa de Strophe.
 * @returns {Promise} - Una promesa que se resuelve con la lista de salas disponibles o se rechaza si ocurre un error.
 */
const listAvailableRooms = (connection) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        const discoServiceJid = 'conference.' + consts.DOMAIN_NAME;
        // Crea una solicitud IQ para descubrir las salas disponibles
        const iq = $iq({ type: 'get', to: discoServiceJid })
            .c('query', { xmlns: 'http://jabber.org/protocol/disco#items' });

        connection.sendIQ(iq,
            (result) => {
                const items = result.getElementsByTagName('item');
                // Extrae información de las salas descubiertas
                const rooms = Array.from(items).map(item => ({
                    jid: item.getAttribute('jid'),
                    name: item.getAttribute('name'),
                }));
                resolve(rooms);
            },
            (error) => {
                console.error('Error al listar las salas disponibles:', error);
                reject(new Error(`Error al listar las salas disponibles: ${error.condition}`));
            }
        );
    });
};

/**
 * Obtiene los mensajes de una sala de chat grupal o conversación privada en XMPP.
 * 
 * @param {Strophe.Connection} connection - La conexión activa de Strophe.
 * @param {string} jid - El JID de la sala de chat o contacto del que obtener los mensajes.
 * @returns {Promise} - Una promesa que se resuelve con una lista de mensajes o se rechaza si ocurre un error.
 */
const getMessagesByJid = (connection, jid) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        const isGroupChat = jid.split('@')[1]?.split('.')[0] === 'conference';
        // Crea una solicitud IQ para obtener mensajes usando el protocolo MAM (Message Archive Management)
        const iq = $iq({ type: 'get', to: jid })
            .c('query', { xmlns: 'urn:xmpp:mam:2' })
            .c('x', { xmlns: 'jabber:x:data', type: 'submit' })
            .c('field', { var: 'FORM_TYPE', type: 'hidden' })
            .c('value').t('urn:xmpp:mam:2').up().up()
            .c('field', { var: 'with' })
            .c('value').t(jid).up().up().up()
            .c('set', { xmlns: 'http://jabber.org/protocol/rsm' })
            .c('max').t('50').up();

        connection.sendIQ(iq,
            (response) => {
                const messages = [];
                const results = response.getElementsByTagName('result');

                // Procesa los resultados y extrae la información de los mensajes
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    const forwarded = result.getElementsByTagName('forwarded')[0];
                    if (forwarded) {
                        const message = forwarded.getElementsByTagName('message')[0];
                        const from = message.getAttribute('from');
                        const to = message.getAttribute('to');
                        const body = message.getElementsByTagName('body')[0];
                        const delay = forwarded.getElementsByTagName('delay')[0];
                        const timestamp = delay ? delay.getAttribute('stamp') : null;

                        if (body) {
                            messages.push({
                                from: isGroupChat ? Strophe.getResourceFromJid(from) : Strophe.getBareJidFromJid(from),
                                to: Strophe.getBareJidFromJid(to),
                                body: Strophe.getText(body),
                                timestamp: timestamp ? new Date(timestamp) : null,
                                isGroupChat: isGroupChat
                            });
                        }
                    }
                }

                resolve(messages);
            },
            (error) => {
                console.error('Error al obtener los mensajes:', error);
                reject(new Error(`Error al obtener los mensajes: ${error.condition}`));
            }
        );
    });
};

/**
 * Obtiene los detalles de una sala de chat grupal en el servidor XMPP.
 * 
 * @param {Strophe.Connection} connection - La conexión activa de Strophe.
 * @param {string} roomJid - El JID de la sala de chat.
 * @returns {Promise} - Una promesa que se resuelve con los detalles de la sala o se rechaza si ocurre un error.
 */
const getRoomDetails = (connection, roomJid) => {
    return new Promise((resolve, reject) => {
        if (!connection || !connection.connected) {
            return reject(new Error('La conexión no está activa.'));
        }

        // Crea una solicitud IQ para obtener la información de la sala
        const iq = $iq({ type: 'get', to: roomJid })
            .c('query', { xmlns: 'http://jabber.org/protocol/disco#info' });

        connection.sendIQ(iq, (response) => {
            try {
                const query = response.getElementsByTagName('query')[0];
                if (!query) {
                    throw new Error('No se encontró información de la sala.');
                }

                const identity = query.getElementsByTagName('identity')[0];
                const features = Array.from(query.getElementsByTagName('feature'));
                const fields = Array.from(query.getElementsByTagName('field'));

                const roomDetails = {
                    jid: roomJid,
                    name: identity ? identity.getAttribute('name') : null,
                    type: identity ? identity.getAttribute('type') : null,
                    features: features.map(f => f.getAttribute('var')),
                    fields: fields.reduce((acc, field) => {
                        const varAttr = field.getAttribute('var');
                        const valueElem = field.getElementsByTagName('value')[0];
                        acc[varAttr] = valueElem ? valueElem.textContent : null;
                        return acc;
                    }, {})
                };

                resolve(roomDetails);
            } catch (error) {
                console.error('Error al procesar la respuesta:', error);
                reject(new Error('Error al procesar la respuesta de la sala'));
            }
        }, (error) => {
            console.error('Error al obtener los detalles de la sala:', error);
            reject(new Error(`Error al obtener los detalles de la sala: ${error.condition}`));
        });
    });
};

// Exporta todas las funciones definidas en el archivo
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
    listAvailableRooms,
    getMessagesByJid,
    getRoomDetails,
};
