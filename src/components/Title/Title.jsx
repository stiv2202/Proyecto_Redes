import PropTypes from 'prop-types'; // Importa PropTypes para la validación de las props
import styles from './Title.module.scss'; // Importa el módulo de estilos SCSS para el componente

// Componente Title para mostrar un título con estilo
const Title = ({ title, className = '' }) => {
    return (
        <div className={`${styles.container} ${className}`}>
            {/* Renderiza el título dentro de un contenedor con clases de estilo */}
            <h1 className={styles.title}>{title}</h1>
        </div>
    );
};

// Definición de las propiedades esperadas del componente
Title.propTypes = {
    title: PropTypes.string.isRequired, // Título a mostrar, requerido
    className: PropTypes.string,        // Clases CSS adicionales para el contenedor, opcional
};

export default Title; // Exporta el componente para su uso en otros archivos
