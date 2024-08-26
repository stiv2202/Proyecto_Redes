import styles from './PopUp.module.scss'; // Importa el módulo de estilos SCSS para el componente
import PropTypes from 'prop-types'; // Importa PropTypes para la validación de las props

// Componente PopUp para mostrar un diálogo emergente
const PopUp = ({
  id,                // Identificador único para el pop-up
  isVisible,         // Determina si el pop-up debe ser visible
  content,           // Contenido del pop-up
  inputRequired,     // Indica si se requiere un campo de entrada
  inputValue,        // Valor del campo de entrada
  onInputChange,     // Función llamada cuando cambia el valor del campo de entrada
  onConfirm,         // Función llamada al confirmar la acción
  onCancel           // Función llamada al cancelar la acción
}) => {
  // No renderiza nada si el pop-up no es visible
  if (!isVisible) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <p>{content}</p>
        {inputRequired && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(id, e.target.value)}
            placeholder="Ingrese aquí"
          />
        )}
        <div className={styles.popupButtons}>
          <button onClick={() => onConfirm(id)}>Aceptar</button>
          <button onClick={() => onCancel(id)}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

// Definición de las propiedades esperadas del componente
PopUp.propTypes = {
  id: PropTypes.string,              // Identificador único del pop-up, opcional
  isVisible: PropTypes.bool,         // Determina si el pop-up es visible, requerido
  content: PropTypes.string,         // Contenido a mostrar en el pop-up, requerido
  onConfirm: PropTypes.func,         // Función a llamar al confirmar, opcional
  onCancel: PropTypes.func,          // Función a llamar al cancelar, opcional
  inputRequired: PropTypes.bool,     // Indica si se requiere un campo de entrada, opcional
  inputValue: PropTypes.string,      // Valor del campo de entrada, opcional
  onInputChange: PropTypes.func,     // Función a llamar al cambiar el valor del campo, opcional
}

export default PopUp; // Exporta el componente para su uso en otros archivos
