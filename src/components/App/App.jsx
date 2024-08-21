import IndexPage from '../../pages/IndexPage';
import { ConnectionProvider } from '../../context/ConnectionContext';

function App() {
  return (
    <ConnectionProvider>
      <IndexPage />
    </ConnectionProvider>
  );
}

export default App;
