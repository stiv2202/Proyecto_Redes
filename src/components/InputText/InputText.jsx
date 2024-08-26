import PropTypes from 'prop-types';
import randomId from '../../helpers/randomString';
import styles from './InputText.module.scss';

// Componente InputText para un campo de entrada de texto con etiqueta y manejo de errores
function InputText({
  title = null,       // Título o etiqueta del campo de entrada
  error = null,       // Mensaje de error para mostrar debajo del campo
  value = '',         // Valor del campo de entrada
  onChange = null,    // Función para manejar el cambio de valor del campo
  onBlur = null,      // Función para manejar el evento de perder el enfoque
  onFocus = null,     // Función para manejar el evento de recibir el enfoque
  name = randomId(15), // Nombre del campo, generado aleatoriamente si no se proporciona
  className = '',     // Clases CSS adicionales para el contenedor del campo
  disabled = false,   // Estado de deshabilitación del campo
  ...props            // Otros props adicionales para el input
}) {
  // Genera un identificador único para el campo de entrada
  const id = randomId(15);

  return (
    <div className={`${styles.inputTextContainer} ${error ? styles.error : ''} ${className}`}>
      <input
        className={styles.inputField}
        type="text"
        {...props}  // Propiedades adicionales para el input
        id={id}     // Identificador único para el input
        name={name} // Nombre del campo
        value={value} // Valor del campo de entrada
        onChange={onChange} // Función llamada al cambiar el valor
        onBlur={onBlur}     // Función llamada al perder el enfoque
        onFocus={onFocus}   // Función llamada al recibir el enfoque
        disabled={disabled} // Deshabilita el campo si se establece en true
      />
      <label className={styles.inputLabel} htmlFor={id}>
        <div className={styles.labelText}>{title}</div>
      </label>
      {error && <span className={styles.inputError}>{error}</span>} {/* Muestra el mensaje de error si existe */}
    </div>
  );
}

// Definición de las propiedades esperadas del componente
InputText.propTypes = {
  title: PropTypes.string,  // Título o etiqueta del campo
  error: PropTypes.string,  // Mensaje de error
  onChange: PropTypes.func, // Función para manejar el cambio de valor
  onBlur: PropTypes.func,   // Función para manejar el evento de perder el enfoque
  onFocus: PropTypes.func,  // Función para manejar el evento de recibir el enfoque
  value: PropTypes.string,  // Valor del campo
  name: PropTypes.string,   // Nombre del campo
  className: PropTypes.string, // Clases CSS adicionales
  disabled: PropTypes.bool, // Estado de deshabilitación del campo
};

export default InputText;
