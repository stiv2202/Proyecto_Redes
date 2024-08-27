import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Importa los componentes necesarios para la gestión de rutas.
import LoginPage from '../../pages/LoginPage'; // Importa la página de inicio de sesión.
import MainPage from '../../pages/MainPage'; // Importa la página principal.
import useConnection from './../../hooks/useConnection'; // Importa el hook personalizado para obtener el estado de conexión.
import { Navigate } from 'react-router-dom'; // Importa el componente para redireccionar rutas.
import SignupPage from '../SignupPage/SignupPage';

function IndexPage() {
  const connection = useConnection(); // Obtiene el objeto de conexión del hook useConnection.
  const connected = connection ? connection.connected : undefined; // Determina si la conexión está activa.

  return (
    <Router> {/* Configura el enrutador para la aplicación. */}
      <Routes>
        {/* Define las rutas de la aplicación */}

        <Route path="/" element={connected ? <MainPage /> : <LoginPage />} />
        {/* Redirige a la página principal si la conexión está activa, o muestra la página de inicio de sesión si no lo está. */}

        <Route path="/login"
          element={connected ? <Navigate to="/" /> : <LoginPage />}
        />
        {/* Redirige a la página principal si la conexión está activa, o muestra la página de inicio de sesión si no lo está. */}
        
        <Route path="/signup"
          element={connected ? <Navigate to="/" /> : <SignupPage />}
        />
        {/* Redirige a la página principal si la conexión está activa, o muestra la página de registro si no lo está. */}
        
        <Route path="*" element={<Navigate to="/" />} />
        {/* Redirige a la página principal para cualquier ruta no definida. */}
      </Routes>
    </Router>
  );
}

export default IndexPage;
