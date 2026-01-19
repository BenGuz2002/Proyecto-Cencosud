import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './componentes/navbar';
import AppRoutes from './mis-routers/AppRoutes';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
