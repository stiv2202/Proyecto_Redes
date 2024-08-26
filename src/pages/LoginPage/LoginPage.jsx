import { useContext, useState } from 'react'; // Importa hooks de React.
import InputText from '../../components/InputText'; // Importa el componente InputText para los campos de entrada.
import styles from './LoginPage.module.scss'; // Importa los estilos SCSS para la página de inicio de sesión.
import Title from '../../components/Title/Title'; // Importa el componente Title para el título de la página.
import MainButton from '../../components/MainButton'; // Importa el componente MainButton para el botón de acceso.
import { DotLoader } from 'react-spinners'; // Importa DotLoader para mostrar un indicador de carga.
import { useNavigate } from 'react-router-dom'; // Importa el hook useNavigate para la navegación.
import ConnectionContext from '../../context/ConnectionContext'; // Importa el contexto para manejar la conexión.
import XMPPError from '../../helpers/XMPPError'; // Importa la clase XMPPError para manejar errores específicos.

function LoginPage() {
  // Obtiene la función de login del contexto.
  const { login } = useContext(ConnectionContext); 
  const navigate = useNavigate(); // Hook para la navegación.
  const [error, setError] = useState(undefined); // Estado para almacenar errores globales.
  const [loading, setLoading] = useState(false); // Estado para manejar el estado de carga.
  const [form, setForm] = useState({ user: "", password: "" }); // Estado para manejar los valores del formulario.
  const [errors, setErrors] = useState({}); // Estado para almacenar errores de validación de campos.

  // Maneja los cambios en los campos de entrada del formulario.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((lastValue) => ({ ...lastValue, [name]: value }));
  };

  // Limpia todos los errores.
  const clearErrors = () => {
    setErrors({});
  };

  // Limpia el error específico de un campo.
  const clearError = (e) => {
    setErrors((lastVal) => ({ ...lastVal, [e.target.name]: null }));
  };

  // Valida el campo de usuario.
  const validateUser = () => {
    if (form?.user?.trim().length === 0) {
      setErrors((lastVal) => ({ ...lastVal, user: 'El usuario es obligatorio.' }));
      return false;
    }
    if (form?.user?.includes('@')) {
      setErrors((lastVal) => ({ ...lastVal, user: 'Ingresa tu usuario sin dominio.' }));
      return false;
    }
    return true;
  };

  // Valida el campo de contraseña.
  const validatePassword = () => {
    if (form?.password?.trim().length > 0) return true;
    setErrors((lastVal) => ({ ...lastVal, password: 'La contraseña es obligatoria.' }));
    return false;
  };

  // Maneja el envío del formulario.
  const handleSubmit = (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario.
    clearErrors(); // Limpia los errores antes de validar.

    // Valida los campos y muestra errores si es necesario.
    if (!(validateUser() && validatePassword())) return;

    setLoading(true); // Activa el indicador de carga.

    // Llama a la función de login y maneja el resultado.
    login(form).then(() => {
      navigate('/'); // Redirige al usuario a la página principal después del login exitoso.
      setLoading(false); // Desactiva el indicador de carga.
    }).catch((err) => {
      setLoading(false); // Desactiva el indicador de carga en caso de error.
      if (err instanceof XMPPError) {
        setError(err); // Establece el error si es una instancia de XMPPError.
      } else {
        console.error('Error al iniciar sesión:', err); // Muestra un error en la consola para otros tipos de errores.
      }
    });
  };

  return (
    <div className={styles.container}> {/* Contenedor principal con estilos */}
      <form className={styles.form} onSubmit={handleSubmit}> {/* Formulario con estilos y manejador de envío */}
        <Title title='Iniciar Sesión' className={styles.title} /> {/* Título de la página */}
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
        {!loading && (<MainButton text="Acceder" type="submit" />)} {/* Muestra el botón si no está cargando */}
        {loading && <DotLoader color="#26688c" />} {/* Muestra el indicador de carga si está cargando */}
      </form>
      {/* <p className={styles.text}>¿No tienes una cuenta? <AnchorButton text="¡Regístrate!" link='/signup' /></p> */}
    </div>
  );
}

export default LoginPage; // Exporta el componente LoginPage para su uso en otras partes de la aplicación.
