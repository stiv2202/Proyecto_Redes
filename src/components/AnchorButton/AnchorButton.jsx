import styles from './AnchorButton.module.scss'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'

const AnchorButton = ({link, text, className = ''}) =>{
    const navigate = useNavigate()

    const handleNavigate = () =>{
      navigate(link)  
    }

    return(
        <button onClick={handleNavigate} className={`${styles.button} ${className}`} >{text}</button>
    )
}

AnchorButton.propTypes = {
    link: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    className: PropTypes.string,
}

export default AnchorButton;
