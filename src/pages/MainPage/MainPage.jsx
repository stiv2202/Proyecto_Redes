/* eslint-disable react-hooks/exhaustive-deps */ // Desactiva la regla de eslint para dependencias en hooks de efecto (useEffect).

import { useContext, useState, useEffect } from 'react'; // Importa hooks de React.
import { ClipLoader } from 'react-spinners'; // Importa el componente ClipLoader para el indicador de carga.
import ConnectionContext from '../../context/ConnectionContext'; // Importa el contexto para manejar la conexión.
import { IoIosArrowUp } from "react-icons/io";
import {
  logout,
  deleteAccount,
  getContacts,
  addContact,
  getContactDetails,
  handlePresence,
  sendMessage,
  handleIncomingMessages,
  sendFile,
  listAvailableRooms,
  joinGroupChatRoom,
  createGroupChatRoom,
  sendPresence,
  getRoomDetails,
} from '../../hooks/hooks'; // Importa varias funciones relacionadas con XMPP.
import styles from './MainPage.module.scss'; // Importa los estilos SCSS para la página principal.
import selectContactImg from '../../assets/select_contact.png'; // Importa una imagen para seleccionar contactos.
import getColorByPresence from '../../helpers/getColorByPresence'; // Importa una función para obtener colores basados en la presencia.
import InputFile from '../../components/InputFile/InputFile'; // Importa el componente InputFile para subir archivos.
import { BsSendFill } from "react-icons/bs"; // Importa el icono de enviar.
import consts from '../../helpers/consts'; // Importa constantes.
import useNotifications from '../../hooks/useNotifications'; // Importa el hook personalizado para notificaciones.
import randomString from '../../helpers/randomString'; // Importa una función para generar cadenas aleatorias.
import PopUp from '../../components/PopUp/PopUp'; // Importa el componente PopUp para mostrar diálogos emergentes.
import usePopup from '../../hooks/usePopUp'; // Importa el hook personalizado para manejar popups.
import { IoIosArrowDown } from "react-icons/io";

function MainPage() {
  // Obtiene funciones y estados del hook usePopup.
  const { popups, showPopup, handleConfirm, handleCancel, handleInputChange } = usePopup();
  // Obtiene la conexión y la presencia del cliente del contexto.
  const { connection, clientPresence } = useContext(ConnectionContext);
  // Define estados locales para manejar contactos, salas, archivos, mensajes, etc.
  const [contacts, setContacts] = useState([]);
  const [currentNickName, setCurrentNickName] = useState(undefined);
  const [rooms, setRooms] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [inputDisabled, setInputDisabled] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [presences, setPresences] = useState({});
  const [currentChat, setCurrentChat] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [exposerOpen, setExposerOpen] = useState(false);
  // Obtiene la función de notificaciones del hook useNotifications.
  const { displayNotification } = useNotifications();

  // Limpia el chat actual cuando se cambia el contacto seleccionado.
  useEffect(() => {
    if (currentContact) {
      setTimeout(() => {
        setCurrentChat([]);
      }, 3);
    }
  }, [currentContact]);

  // Actualiza la lista de contactos y salas cada vez que cambia la conexión.
  useEffect(() => {
    updateContacts();
    updateRooms();
  }, [connection]);

  // Función para mostrar una notificación.
  const triggerNotification = (content) => {
    displayNotification(content, 'info');
  };

  // Configura los manejadores de mensajes y presencia cuando la conexión está disponible y conectada.
  useEffect(() => {
    if (connection && connection.connected) {
      // Manejador de mensajes entrantes.
      const messageHandler = (jid, messageText, url, _, roomJid) => {
        const newMessage = {
          from: roomJid ? `${jid}@${consts.DOMAIN_NAME}` : jid,
          message: messageText ?? url,
          timestamp: new Date().getTime(),
          id: randomString()
        };

        // Lógica para manejar mensajes entrantes.
        if (!currentContact) {
          triggerNotification(`Nuevo mensaje ${roomJid ? `(grupo ${roomJid}) ` : ''}de ${jid}`);
        } else if (currentContact.jid === connection.jid.split('/')[0]
          || jid === connection.jid.split('@')[0]
          || currentNickName === jid) {
          return;
        } else if (roomJid === currentContact.jid || jid === currentContact.jid) {
          setCurrentChat((current) => [newMessage, ...current]);
        } else {
          triggerNotification(`Nuevo mensaje ${roomJid ? `(grupo ${roomJid}) ` : ''}de ${jid}`);
        }
      };

      // Manejador de presencia.
      const presenceHandler = (jid, presenceType) => {
        if (jid === connection.jid.split('/')[0] && presenceType !== clientPresence) {
          sendPresence(connection, clientPresence);
        } else {
          setPresences(prevPresences => ({
            ...prevPresences,
            [jid]: presenceType,
          }));
        }
      };

      // Configura los manejadores de mensajes y presencia.
      handleIncomingMessages(connection, messageHandler);
      handlePresence(connection, presenceHandler);

      // Limpia los manejadores cuando el componente se desmonte.
      return () => {
        connection.deleteHandler(messageHandler);
        connection.deleteHandler(presenceHandler);
      };
    }
  }, [currentContact]);

  // Actualiza la lista de contactos desde el servidor.
  const updateContacts = () => {
    getContacts(connection)
      .then(result => setContacts(result))
      .catch(error => console.error('Error al obtener contactos:', error));
  };

  // Función para actualizar la lista de salas disponibles.
  const updateRooms = () => {
    listAvailableRooms(connection)
      .then(result => setRooms(result))
      .catch(error => console.error('Error al obtener salas disponibles:', error));
  };

  // Maneja el cambio en el campo de mensaje.
  const handleInputMessageChange = (e) => {
    const { value } = e.target;
    setMessage(value);
  };

  // Maneja el cambio en el archivo seleccionado.
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]); // Establece el archivo seleccionado.
    setMessage(`Archivo adjunto: ${event.target.files[0].name}`); // Actualiza el mensaje con el nombre del archivo.
    setInputDisabled(true); // Desactiva el campo de entrada mientras se carga el archivo.
  };

  // Maneja la obtención de detalles de un contacto o sala.
  const handleGetDetails = (jid) => {
    const isRoom = jid.split('@')[1].includes('conference'); // Verifica si el JID es una sala de conferencia.

    if (isRoom) {
      // Si es una sala, obtiene detalles de la sala y se une a la sala.
      getRoomDetails(connection, jid)
        .then(result => {
          handleJoinRoom(result.name); // Maneja la unión a la sala.
        })
        .catch(error => console.error('Error al obtener detalles de la sala:', error));
    } else {
      // Si es un contacto, obtiene detalles del contacto.
      getContactDetails(connection, jid)
        .then(result => setCurrentContact(result)) // Establece el contacto actual.
        .catch(error => console.error('Error al obtener detalles del contacto:', error));
    }
  };

  // Maneja el cierre de sesión.
  const handleLogout = () => {
    logout(connection)
      .then(() => window.location.reload()) // Recarga la página después del cierre de sesión.
      .catch(error => console.error('Error al cerrar sesión:', error));
  };

  // Maneja la eliminación de la cuenta.
  const handleDeleteAccount = () => {
    showPopup(
      'deleteAccount',
      '¿Está seguro de eliminar su cuenta? Esta acción es irreversible.', // Mensaje de confirmación.
      false,
      () => {
        deleteAccount(connection)
          .then(() => window.location.reload()) // Recarga la página después de eliminar la cuenta.
          .catch(error => console.error('Error al eliminar cuenta:', error));
      },
      () => { return } // Función para manejar la cancelación (vacía en este caso).
    );
  };

  // Maneja la adición de un nuevo contacto.
  const handleAddContact = () => {
    showPopup(
      'addContact',
      'Ingrese el JID del contacto:', // Mensaje para ingresar el JID del nuevo contacto.
      true, // Indica que se debe mostrar un campo de entrada.
      (jid) => {
        addContact(connection, jid, '') // Agrega el contacto con el JID ingresado.
          .then(() => {
            updateContacts(); // Actualiza la lista de contactos.
            displayNotification(`${jid} agregado correctamente.`, 'success'); // Muestra una notificación de éxito.
          })
          .catch(() => displayNotification('Error al agregar contacto.', 'error')); // Muestra una notificación de error.
      },
      () => { return } // Función para manejar la cancelación (vacía en este caso).
    );
  };

  // Limpia el estado del mensaje y restablece varias propiedades.
  const clearMessageState = (customMessage = undefined) => {
    const isRoom = currentContact.jid.split('@')[1].includes('conference'); // Verifica si el contacto es una sala de conferencia.
    setCurrentChat((current) => [{
      from: isRoom ? `${currentNickName}@${consts.DOMAIN_NAME}` : connection.jid.split('/')[0], // Determina el remitente del mensaje.
      message: customMessage ?? message, // Utiliza un mensaje personalizado si se proporciona.
      timestamp: new Date().getTime(), // Marca la hora actual.
      id: randomString() // Genera un ID único para el mensaje.
    }, ...current]);
    setMessage(''); // Limpia el campo de mensaje.
    setInputDisabled(false); // Habilita el campo de entrada.
    setLoadingSend(false); // Restablece el estado de carga.
    setSelectedFile(undefined); // Limpia el archivo seleccionado.
    setFormSubmitted(true); // Marca el formulario como enviado.
    setTimeout(() => setFormSubmitted(false), 200); // Restablece el estado del formulario después de un breve retraso.
  };

  // Maneja el envío de un mensaje o archivo.
  const handleSendMessage = (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario.
    if (!message && !selectedFile) return; // No hace nada si no hay mensaje ni archivo seleccionado.

    setLoadingSend(true); // Establece el estado de carga para indicar que el mensaje o archivo se está enviando.

    // Determina si se debe enviar un archivo o un mensaje.
    const sendPromise = selectedFile
      ? sendFile(connection, currentContact.jid, selectedFile) // Envía el archivo.
      : sendMessage(connection, currentContact.jid, message); // Envía el mensaje.

    sendPromise
      .then(result => {
        clearMessageState(selectedFile ? result : undefined); // Limpia el estado del mensaje después de enviarlo.
      })
      .catch(error => {
        console.error('Error al enviar:', error); // Muestra un error en la consola si el envío falla.
        setLoadingSend(false); // Restablece el estado de carga.
      });
  };

  // Maneja la creación de una nueva sala.
  const handleCreateRoom = () => {
    showPopup(
      'createRoom',
      'Ingrese el nombre de la sala:', // Mensaje para ingresar el nombre de la sala.
      true, // Muestra un campo de entrada.
      (room) => {
        showPopup(
          'newRoomNickname',
          'Ingrese el nickname a utilizar:', // Mensaje para ingresar el nickname.
          true,
          (nickname) => {
            createGroupChatRoom(connection, room, nickname) // Crea la sala de chat grupal.
              .then(message => {
                displayNotification(message, 'success'); // Muestra una notificación de éxito.
                updateRooms(); // Actualiza la lista de salas disponibles.
              })
              .catch(() => displayNotification('Error al crear nueva sala.', 'error')); // Muestra una notificación de error.
          },
          () => { return } // Función para manejar la cancelación (vacía en este caso).
        );
      },
      () => { return } // Función para manejar la cancelación (vacía en este caso).
    );
  };

  // Maneja la unión a una sala existente.
  const handleJoinRoom = (roomName) => {
    showPopup(
      'joinRoom',
      'Ingrese su nickname:', // Mensaje para ingresar el nickname.
      true, // Muestra un campo de entrada.
      (nickname) => {
        joinGroupChatRoom(connection, roomName, nickname) // Se une a la sala de chat grupal.
          .then(result => {
            setCurrentContact(result); // Establece el contacto actual como la sala.
            setCurrentNickName(nickname); // Establece el nickname para la sala.
          })
          .catch(error => console.error(error.message)); // Muestra un error en la consola si falla la unión.
      },
      () => { return } // Función para manejar la cancelación (vacía en este caso).
    );
  };

  console.log('contacts: ', contacts)

  // Renderiza la página principal.
  return (
    <div className={styles.mainContainer}>
      <div className={styles.contactsSection}>
        <div className={styles.myProfile}>
          <div className={styles.mainContactInfo}>
            {/* Indicador de presencia del contacto */}
            <span className={styles.presenceIndicator} style={{
              background: getColorByPresence(clientPresence ? clientPresence : 'unknown')
            }} />
            <h3 className={styles.contactName}>
              {connection.name || connection.jid.split('@')[0]}
            </h3>
            {connection.name && (
              <p className={styles.contactJid}>
                {`(${connection.jid.split('@')[0]})`}
              </p>
            )}
          </div>
          <div className={styles.userActions}>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Cerrar Sesión
            </button>
            <button type="button" onClick={handleDeleteAccount}>Eliminar Cuenta</button>
            <button onClick={handleAddContact}>Agregar Contacto</button>
            <button onClick={handleCreateRoom}>Crear Sala Grupal</button>
          </div>
        </div>
        <div className={styles.contactList}>

          {/* Muestra la lista de contactos si hay alguno */}
          {contacts && contacts.length > 0 &&
            <h2>Mis contactos</h2>}
          {contacts.map(contact => (
            <button
              key={contact.jid}
              className={`${styles.contactCard} ${currentContact && currentContact.jid === contact.jid ? styles.selectedChat : ''}`}
              onClick={() => handleGetDetails(contact.jid)}
            >
              <div className={styles.contactCardName}>
                <span className={styles.presenceIndicator} style={{
                  background: getColorByPresence(presences[contact.jid] ? presences[contact.jid] : 'unknown')
                }} />
                <h3>{contact.name ?? contact.jid.split('@')[0]}</h3>
              </div>
              <p>{`(${contact.jid})`}</p>
            </button>
          ))}

          {/* Muestra la lista de salas disponibles si hay alguna */}
          {rooms && rooms.length > 0 &&
            <h2>Salas disponibles</h2>}
          {rooms.map(room => (
            <button
              key={room.jid}
              className={`${styles.contactCard} ${currentContact && currentContact.jid === room.jid ? styles.selectedChat : ''}`}
              onClick={() => handleGetDetails(room.jid)}
            >
              <div className={styles.contactCardName}>
                <span className={styles.presenceIndicator} style={{
                  background: getColorByPresence(presences[room.jid] ?? 'unknown')
                }} />
                <h3>{room.name ?? room.jid.split('@')[0]}</h3>
              </div>
              <p>{`(${room.jid})`}</p>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chatSection}>
        {/* Muestra un mensaje de selección si no hay contacto seleccionado */}
        {!currentContact && <div className={styles.placeholderContainer}>
          <img className={styles.chatSectionPlaceholder} src={selectContactImg} alt="Select Contact Image" />
          <p>Selecciona un contacto o sala para empezar a chatear.</p>
        </div>}

        {/* Muestra la sección de chat si hay un contacto seleccionado */}
        {currentContact && (
          <div key={currentContact?.jid} className={styles.chatContent}>
            <div className={styles.contactInfo}>
              <div className={styles.contactInfoContent}>
                {/* Indicador de presencia del contacto */}
                <span className={styles.presenceIndicator} style={{
                  background: getColorByPresence(presences[currentContact.jid] ? presences[currentContact.jid] : 'unknown')
                }} />
                <h3 className={styles.contactName}>
                  {currentContact.name || currentContact.jid.split('@')[0]}
                </h3>
                {currentContact.name && (
                  <p className={styles.contactJid}>
                    {`(${currentContact.jid.split('@')[0]})`}
                  </p>
                )}
              </div>
              {/* Muestra detalles del contacto seleccionado si existe */}
              <div className={`${styles.contactDetailContainer} ${exposerOpen ? styles.contactDetailOpen : ''}`}>
                <div className={styles.contactDetail}>
                  <h2>Detalles de contacto.</h2>
                  <p><strong>JID:</strong> {currentContact.jid}</p>
                  <p><strong>NOMBRE:</strong> {currentContact.name ?? currentContact.jid.split('@')[0]}</p>
                  <p><strong>SUSCRIPCIÓN:</strong> {currentContact.subscription}</p>
                  <p><strong>PRESENCIA:</strong> {presences[currentContact.jid] ? presences[currentContact.jid] : 'unknown'}</p>
                  <button className={styles.detailExposer} onClick={() => setExposerOpen((old) => !old)}>
                    {exposerOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.messages}>
              {/* Muestra los mensajes del chat actual */}
              {currentChat.length !== 0
                && currentChat.map((element) => {
                  if (!element?.message) return

                  return (
                    <div
                      className={`${styles.chatElement} ${element.from === connection.jid.split('/')[0]
                        || element.from === `${currentNickName}@${consts.DOMAIN_NAME}`
                        ? styles.sentContainer : styles.receivedContainer}`}
                      key={element.id || element.timestamp}
                    >
                      <div className={`${element.from === connection.jid.split('/')[0]
                        || element.from === `${currentNickName}@${consts.DOMAIN_NAME}`
                        ? styles.sent : styles.received}`}>
                        <p>{element.from}</p>
                        <p>{element.message}</p>
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Sección de entrada de mensajes */}
            <div className={styles.inputMessageContent}>
              <form className={styles.formMessage} onSubmit={handleSendMessage}>
                <InputFile onFileChange={handleFileChange} formSubmitted={formSubmitted} />
                <input disabled={inputDisabled} className={styles.inputMessage} onChange={handleInputMessageChange} value={message} />
                {!loadingSend && <button className={styles.sendButton} type="submit">
                  <BsSendFill />
                </button>}
                {loadingSend &&
                  <div className={styles.loadingButton} >
                    <ClipLoader color="white" />
                  </div>}
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Muestra los popups en caso de que estén visibles */}
      {Object.entries(popups).map(([id, { isVisible, content, inputRequired, inputValue }]) => (
        <PopUp
          key={id}
          id={id}
          isVisible={isVisible}
          content={content}
          inputRequired={inputRequired}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      ))}
    </div>
  );
}

export default MainPage;
