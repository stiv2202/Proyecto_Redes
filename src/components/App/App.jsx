// Importaciones necsearias
import IndexPage from '../../pages/IndexPage';
import { ConnectionProvider } from '../../context/ConnectionContext';
import { SnackbarProvider } from 'notistack';
import styles from './App.module.scss'

// Define el componente funcional App
function App() {
  return (
    // Proveedor de notificaciones (SnackbarProvider) para la gestión de mensajes emergentes
    <SnackbarProvider
      // Número máximo de notificaciones que se pueden mostrar al mismo tiempo
      maxSnack={3}
      className={styles.notifications}
    >
      {/* Proveedor de conexión (ConnectionProvider) para proporcionar el contexto de conexión a los componentes */}
      <ConnectionProvider>
        {/* Componente de la página principal de la aplicación */}
        <IndexPage />
      </ConnectionProvider>
    </SnackbarProvider>
  );
}

export default App;
