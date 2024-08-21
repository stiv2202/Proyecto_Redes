import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import MainPage from '../../pages/MainPage';
import ConnectionContext from '../../context/ConnectionContext';
import { useContext } from 'react';

function IndexPage() {
  const { isAuthenticated, isLoading } = useContext(ConnectionContext);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <MainPage /> : <LoginPage />} />
        <Route path="/login" element={isAuthenticated ? <MainPage /> : <LoginPage />} />
        {/* <Route path="/signup" element={isAuthenticated ? <MainPage /> : <SignupPage />} /> */}
      </Routes>
    </Router>
  );
}

export default IndexPage;
