import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SignupPage.module.css';
import { register } from '../../helpers/server';

function SignupPage() {
  const [form, setForm] = useState({ user: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const field = e.target.name;
    const { value } = e.target;
    setForm((lastValue) => ({ ...lastValue, [field]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.user.trim()) {
      newErrors.user = 'El nombre de usuario es obligatorio.';
    }

    if (!form.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    register(form)
      .then(() => {
        console.log('Cuenta creada exitosamente');
        navigate('/'); // Redirigir al inicio de sesión
      })
      .catch((error) => {
        console.error('Error al registrar:', error);
        setErrors((lastErrors) => ({ ...lastErrors, server: error }));
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
        />
        {errors.user && <p className={styles.error}>{errors.user}</p>}
        <input
          type="password"
          id="password"
          name="password"
          className={styles.input}
          onChange={handleChange}
          value={form.password}
        />
        {errors.password && <p className={styles.error}>{errors.password}</p>}
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          className={styles.input}
          onChange={handleChange}
          value={form.confirmPassword}
        />
        {errors.confirmPassword && <p className={styles.error}>{errors.confirmPassword}</p>}
        <button type="submit">Registrarse</button>
        {errors.server && <p className={styles.error}>{errors.server}</p>}
      </form>
    </div>
  );
}

export default SignupPage;
