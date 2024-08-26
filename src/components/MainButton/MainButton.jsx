import styles from './MainButton.module.scss'; // Importa el módulo de estilos SCSS para el componente
import PropTypes from 'prop-types'; // Importa PropTypes para la validación de las props

// Componente MainButton para un botón personalizado
const MainButton = ({ text, onClick = null, type = 'button', className = '' }) => {
    return (
        <button
            className={`${styles.button} ${className}`} // Aplica estilos del módulo y clases adicionales
            type={type} // Tipo del botón (por defecto 'button')
            onClick={onClick} // Función que se llama al hacer clic en el botón
        >
            {text}
        </button>
    );
}

// Definición de las propiedades esperadas del componente
MainButton.propTypes = {
    text: PropTypes.string.isRequired, // Texto del botón, requerido
    onClick: PropTypes.func, // Función para manejar el clic, opcional
    type: PropTypes.string, // Tipo del botón, opcional (por defecto 'button')
    className: PropTypes.string, // Clases CSS adicionales, opcional
};

export default MainButton; // Exporta el componente para su uso en otros archivos
