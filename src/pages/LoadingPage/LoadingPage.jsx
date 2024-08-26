import { DotLoader } from 'react-spinners'; // Importa el componente DotLoader para mostrar un indicador de carga.
import styles from './LoadingPage.module.scss'; // Importa el archivo de estilos SCSS para esta página.

function LoadingPage() {
  return (
    <div className={styles.container}> {/* Usa el estilo container definido en LoadingPage.module.scss */}
      <DotLoader color="#26688c" /> {/* Muestra el indicador de carga con el color especificado */}
    </div>
  );
}

export default LoadingPage; // Exporta el componente LoadingPage para su uso en otras partes de la aplicación.
