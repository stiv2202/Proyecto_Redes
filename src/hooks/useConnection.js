import { useContext } from 'react';
import ConnectionContext from '../context/ConnectionContext';

function useConnection() {
  const { connection } = useContext(ConnectionContext);
  return connection;
}

export default useConnection;
