import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import MainPage from '../../pages/MainPage';
// import SignupPage from '../../pages/SignupPage';

function IndexPage() {
  const token = sessionStorage.getItem('session');

  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <MainPage /> : <LoginPage />} />
        <Route path="/login" element={token ? <MainPage /> : <LoginPage />} />
        {/* <Route path="/signup" element={token ? <MainPage /> : <SignupPage />} /> */}
      </Routes>
    </Router>
  );
}

export default IndexPage;
