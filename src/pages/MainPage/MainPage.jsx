import { useContext, useState, useEffect } from 'react';
import ConnectionContext from '../../context/ConnectionContext';
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
} from '../../hooks/hooks';
import styles from './MainPage.module.css';

function MainPage() {
  const { connection, isAuthenticated } = useContext(ConnectionContext);
  const [contacts, setContacts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentContact, setCurrentContact] = useState(null);
  const [presences, setPresences] = useState({});

  useEffect(() => {
    if (connection && connection.connected) {
      const messageHandler = (jid, messageText, url) => {
        console.log(`Nuevo mensaje de ${jid}: ${messageText} ${url && url !== messageText ? `, ${url}` : ''}`);
      };

      const presenceHandler = (jid, presenceType) => {
        setPresences(prevPresences => ({
          ...prevPresences,
          [jid]: presenceType,
        }));
      };

      handleIncomingMessages(connection, messageHandler);
      handlePresence(connection, presenceHandler);

      return () => {
        // Limpiar los handlers si es necesario
        connection.deleteHandler(messageHandler);
        connection.deleteHandler(presenceHandler);
      };
    }
  }, [connection, isAuthenticated]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileSend = () => {
    if (!selectedFile) return;

    try {
      const to = prompt('Ingrese el JID del contacto:');
      sendFile(connection, to, selectedFile)
        .then(result => console.log(result))
        .catch(error => console.error('Error al obtener detalles:', error));
    } catch (error) {
      console.error('Error al enviar el archivo:', error);
    }
  };

  const handleGetDetails = (jid) => {
    getContactDetails(connection, jid)
      .then(result => setCurrentContact(result))
      .catch(error => console.error('Error al obtener detalles:', error));
  };

  const handleGetContacts = () => {
    getContacts(connection)
      .then(result => setContacts(result))
      .catch(error => console.error('Error al obtener contactos:', error));
  };

  const handleLogout = () => {
    logout(connection)
      .then(() => window.location.reload())
      .catch(error => console.error('Error al cerrar sesión:', error));
  };

  const handleDeleteAccount = () => {
    deleteAccount(connection)
      .then(() => window.location.reload())
      .catch(error => console.error('Error al eliminar cuenta:', error));
  };

  const handleAddContact = () => {
    const jid = prompt('Ingrese el JID del contacto:');
    if (jid) {
      addContact(connection, jid, '')
        .then(message => alert(message))
        .catch(error => alert(error.message));
    }
  };

  const handleSendMessage = () => {
    const jid = prompt('Ingrese el JID del contacto:');
    if (jid) {
      const message = prompt('Ingrese el mensaje:');
      sendMessage(connection, jid, message)
        .then(message => alert(message))
        .catch(error => alert(error.message));
    }
  };

  return (
    <div className={styles.container}>
      <h1>Bienvenido!</h1>
      <div>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Cerrar Sesión
        </button>
        <button type="button" onClick={handleDeleteAccount}>Eliminar Cuenta</button>
        <button type="button" onClick={handleGetContacts}>Obtener contactos</button>
        <button onClick={handleAddContact}>Agregar Contacto</button>
        <button onClick={handleSendMessage}>Enviar mensaje</button>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileSend}>Enviar archivo</button>
      </div>
      <div>
        {contacts.map(contact => (
          <div key={contact.jid}>
            <button onClick={() => handleGetDetails(contact.jid)}>{contact.jid}</button>
            <span>
              {presences[contact.jid] ? ` - ${presences[contact.jid]}` : ' - unknown'}
            </span>
          </div>
        ))}
      </div>
      {currentContact &&
        <>
          <h2>Detalles de contacto seleccionado</h2>
          <div>JID: {currentContact.jid}</div>
          <div>NAME: {currentContact.name}</div>
          <div>SUBSCRIPTION: {currentContact.subscription}</div>
          <div>PRESENCE: {presences[currentContact.jid] ? presences[currentContact.jid] : 'unknown'}</div>
        </>
      }
    </div>
  );
}

export default MainPage;
