/* eslint-disable no-unused-vars */
import styles from './MainPage.module.css';
import ConnectionContext from '../../context/ConnectionContext';
import { useContext } from 'react';
import { logout, deleteAccount } from '../../hooks/hooks';

function MainPage() {
  const { connection } = useContext(ConnectionContext)

  const handleLogout = () => {
    logout(connection)
      .then(() => {
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error al cerrar la sesión:', error);
      });
  };

  const handleDeleteAccount = (e) => {

    deleteAccount(connection)
      .then(() => {
        window.location.reload();
      }).catch((err) => {
        console.error('Error al eliminar cuenta:', err);
      });
  };

  return (
    <div className={styles.container}>
      <h1>Bienvenido!</h1>
      <button onClick={handleLogout} className={styles.logoutButton}>
        Cerrar Sesión
      </button>
      <button type="button" onClick={() => handleDeleteAccount()}>Eliminar Cuenta</button>
    </div>
  );
}

export default MainPage;
