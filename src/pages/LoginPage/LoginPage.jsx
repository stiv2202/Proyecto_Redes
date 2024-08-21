/* eslint-disable no-unused-vars */
// import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import styles from './LoginPage.module.css';
import ConnectionContext from '../../context/ConnectionContext';

function LoginPage() {
  const { login } = useContext(ConnectionContext);
  const [form, setForm] = useState({ user: '', password: '' })
  const [errors, setErrors] = useState({});
  // const navigate = useNavigate();

  const clearErrors = () => {
    setErrors({});
  };

  const clearError = (e) => {
    setErrors((lastVal) => ({ ...lastVal, [e.target.name]: null }));
  };

  const validateEmail = () => {
    if (form?.user?.trim().length > 0) return true;
    setErrors((lastVal) => ({ ...lastVal, user: 'El email es obligatorio.' }));
    return false;
  };

  const validatePassword = () => {
    if (form?.password?.trim().length > 0) return true;
    setErrors((lastVal) => ({ ...lastVal, password: 'La contraseña es obligatoria.' }));
    return false;
  };

  const handleChange = (e) => {
    const field = e.target.name;
    const { value } = e.target;
    setForm((lastValue) => ({ ...lastValue, [field]: value }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    clearErrors();

    if (!(validateEmail() && validatePassword())) return;

    login(form).then(() => {
      window.location.reload();
    }).catch((err) => {
      console.error('Error al iniciar sesión:', err);
    });
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          id="user"
          name="user"
          className={styles.input}
          onChange={handleChange}
          value={form.user}
          onFocus={clearError}
        />
        <input
          type="password"
          id="password"
          name="password"
          className={styles.input}
          onChange={handleChange}
          value={form.password}
          onFocus={clearError}
        />
        <button type="submit">Iniciar Sesión</button>
      </form>
      {/* <button onClick={() => navigate('/signup')} className={styles.signupButton}>
        Crear una cuenta
      </button> */}
    </div>
  )

}

export default LoginPage;
