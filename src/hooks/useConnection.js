import { useContext } from 'react'; // Importa el hook useContext de React para acceder al contexto.
import ConnectionContext from '../context/ConnectionContext'; // Importa el contexto de conexión desde el archivo de contexto.

function useConnection() {
  // Usa el hook useContext para acceder al valor del contexto ConnectionContext.
  const { connection } = useContext(ConnectionContext);
  // Retorna la conexión obtenida del contexto.
  return connection;
}

export default useConnection; // Exporta el hook personalizado para que pueda ser utilizado en otros componentes.
