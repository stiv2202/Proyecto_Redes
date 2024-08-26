// Importaciones necesarias
import styles from './AnchorButton.module.scss'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'

// Define el componente funcional AnchorButton
const AnchorButton = ({link, text, className = ''}) => {
    const navigate = useNavigate()

    const handleNavigate = () => {
        navigate(link)  
    }

    // Renderiza el botón con las propiedades y estilos correspondientes
    return (
        <button 
            onClick={handleNavigate} 
            // Combina la clase de estilos del módulo con la clase adicional proporcionada
            className={`${styles.button} ${className}`} 
        >
            {text}
        </button>
    )
}

// Define las propTypes para validar las props del componente
AnchorButton.propTypes = {
    link: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    className: PropTypes.string,
}

export default AnchorButton;
