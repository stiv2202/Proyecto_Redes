import React, { useEffect } from 'react';
import styles from './InputFile.module.scss';
import PropTypes from 'prop-types';
import { HiPaperClip } from "react-icons/hi";

// Componente InputFile para manejar la selección de archivos
const InputFile = ({ onFileChange, formSubmitted }) => {
    // Referencia al input de tipo archivo
    const fileInputRef = React.useRef(null);

    // Abre el diálogo de selección de archivos al hacer clic en el icono
    const handleIconClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Maneja el cambio de archivo y llama a la función onFileChange pasada como prop
    const handleFileChange = (event) => {
        if (onFileChange) {
            onFileChange(event);
        }
    };

    // Limpia el input de archivo cuando el formulario se haya enviado
    useEffect(() => {
        if (formSubmitted && fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [formSubmitted]);

    return (
        <div className={styles.fileInputIcon}>
            {/* Input de archivo oculto */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            {/* Botón que abre el diálogo de selección de archivos */}
            <button
                type="button"
                className={styles.iconButton}
                onClick={handleIconClick}
            >
                <HiPaperClip />
            </button>
        </div>
    );
};

// Definición de las propiedades esperadas del componente
InputFile.propTypes = {
    onFileChange: PropTypes.func, // Función llamada al cambiar el archivo
    formSubmitted: PropTypes.bool, // Indica si el formulario se ha enviado
}

export default InputFile;
