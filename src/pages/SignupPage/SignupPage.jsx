import { useContext, useState } from 'react';
import InputText from '../../components/InputText';
import styles from './SignupPage.module.scss';
import Title from '../../components/Title/Title';
import AnchorButton from '../../components/AnchorButton';
import MainButton from '../../components/MainButton';
import { DotLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';
import ConnectionContext from '../../context/ConnectionContext';
import XMPPError from '../../helpers/XMPPError';
import { registerAccount } from '../../hooks/hooks'

function SignupPage() {
  const { connection } = useContext(ConnectionContext);
  const navigate = useNavigate();
  const [error, setError] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    user: "",
    password: ""
  })
  const [errors, setErrors] = useState({});

  console.log('connection: ', connection)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((lastValue) => ({ ...lastValue, [name]: value }));
  }

  const clearErrors = () => {
    setErrors({});
  };

  const clearError = (e) => {
    setErrors((lastVal) => ({ ...lastVal, [e.target.name]: null }));
  };

  const validateUser = () => {
    if (form?.user?.trim().length === 0) {
      setErrors((lastVal) => ({ ...lastVal, user: 'El usuario es obligatorio.' }));
      return false
    }
    if (form?.user?.includes('@')) {
      setErrors((lastVal) => ({ ...lastVal, user: 'Ingresa tu usuario sin dominio.' }));
      return false;
    }
    return true;
  }

  const validatePassword = () => {
    if (form?.password?.trim().length > 0) return true;
    setErrors((lastVal) => ({ ...lastVal, password: 'La contraseña es obligatoria.' }));
    return false;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearErrors();

    if (!(validateUser() && validatePassword())) return;

    setLoading(true)

    registerAccount(connection, form).then(() => {
      navigate('/')
      setLoading(false)
    }).catch((err) => {
      setLoading(false)
      if (err instanceof XMPPError)
        setError(err)
      else {
        console.error('Error al registrar usuario:', err);
      }
    });


  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <Title title='Iniciar Sesión' className={styles.title} />
        <InputText
          title="Usuario"
          name="user"
          onChange={handleChange}
          value={form.user}
          error={errors?.user}
          onBlur={validateUser}
          onFocus={clearError}
        />
        <InputText
          title="Contraseña"
          name="password"
          onChange={handleChange}
          value={form.password}
          error={errors?.password}
          onBlur={validatePassword}
          onFocus={clearError}
          type="password"
        />
        {error && <div className={styles.errorMessage}>{error instanceof XMPPError ? error.message : 'Ocurrió un error.'}</div>}
        {!loading && (<MainButton text="Acceder" type="submit" />)}
        {loading && <DotLoader color="#26688c" />}
      </form>
      <p className={styles.text}>¿Ya tienes una cuenta? <AnchorButton text="¡Inicia sesión aquí!" link='/login' /></p>
    </div>
  )

}

export default SignupPage;
