import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
// import SignupPage from '../../pages/SignupPage';
import MainPage from '../../pages/MainPage';
import useConnection from './../../hooks/useConnection'
import { Navigate } from 'react-router-dom';

function IndexPage() {
  const connection = useConnection();
  const connected = connection ? connection.connected : undefined

  return (
    <Router>
      <Routes>
        <Route path="/" element={connected ? <MainPage /> : <LoginPage />} />
        <Route path="/login"
          element={connected ? <Navigate to="/" /> : <LoginPage />}
        />
        {/* <Route path="/signup"
          element={connected ? <Navigate to="/" /> : <SignupPage />}
        /> */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default IndexPage;
