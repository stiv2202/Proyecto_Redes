import PropTypes from 'prop-types';
import styles from './Title.module.scss'

const Title = ({title, className = ''}) =>{
    return(
        <div className={`${styles.container} ${className}`}>
            <h1 className={styles.title}>{title}</h1>
        </div>
    )
}

Title.propTypes = {
    title: PropTypes.string.isRequired,
    className: PropTypes.string
}

export default Title