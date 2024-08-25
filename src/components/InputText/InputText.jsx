import PropTypes from 'prop-types';
import randomId from '../../helpers/randomString';
import styles from './InputText.module.scss';

function InputText({
  title=null, error = null, value = '', onChange=null, onBlur=null, onFocus=null, name = randomId(15), className='', disabled=false, ...props
}) {
  const id = randomId(15);
  return (
    <div className={`${styles.inputTextContainer} ${error ? styles.error : ''} ${className}`}>
      <input
        className={styles.inputField}
        type="text"
        {...props}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
      />
      <label className={styles.inputLabel} htmlFor={id}>
        <div className={styles.labelText}>{title}</div>
      </label>
      {error && <span className={styles.inputError}>{error}</span>}
    </div>
  );
}

InputText.propTypes = {
  title: PropTypes.string,
  error: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  value: PropTypes.string,
  name: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default InputText;
