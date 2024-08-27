import styles from './PopUp.module.scss';
import PropTypes from 'prop-types';
import InputText from '../InputText'
import { useState, useEffect } from 'react'; // Importamos useState y useEffect

const PopUp = ({
  id,
  isVisible,
  content,
  inputRequired,
  inputValue,
  onInputChange,
  onConfirm,
  onCancel
}) => {
  const [localInputValue, setLocalInputValue] = useState(inputValue);

  useEffect(() => {
    setLocalInputValue(inputValue);
  }, [inputValue]);

  if (!isVisible) return null;

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      onConfirm(id, localInputValue);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setLocalInputValue(newValue);
    onInputChange(id, newValue);
  };

  const handleConfirm = () => {
    onConfirm(id, localInputValue);
  };

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <p>{content}</p>
        {inputRequired && (
          <InputText
            value={localInputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
        )}
        <div className={styles.popupButtons}>
          <button className={styles.accept} onClick={handleConfirm}>Aceptar</button>
          <button className={styles.cancel} onClick={() => onCancel(id)}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

PopUp.propTypes = {
  id: PropTypes.string,
  isVisible: PropTypes.bool.isRequired,
  content: PropTypes.string.isRequired,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  inputRequired: PropTypes.bool,
  inputValue: PropTypes.string,
  onInputChange: PropTypes.func,
}

export default PopUp;