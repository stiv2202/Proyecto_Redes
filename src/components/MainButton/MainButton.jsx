import styles from './MainButton.module.scss'
import PropTypes from 'prop-types'

const MainButton = ({ text, onClick=null, type='button', className='' }) => {
    return (
        <button className={`${styles.button} ${className}`} type={type} onClick={onClick}>{text}</button>
    )
}

MainButton.propTypes = {
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    type: PropTypes.string,
    className: PropTypes.string
}

export default MainButton;