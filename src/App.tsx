import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import HomePage from './pages/HomePage';
import EntradasPage from './pages/EntradasPage';
import SaidasPage from './pages/SaidasPage';
import HistorialEntradasPage from './pages/HistorialEntradasPage';
import HistorialSalidasPage from './pages/HistorialSalidasPage';
import { loadInitialData } from './services/publicSheetService';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeData() {
      try {
        await loadInitialData();
        setError(null);
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('Error al cargar los datos iniciales. Algunos datos mostrados podrían ser de ejemplo.');
      } finally {
        setIsLoading(false);
      }
    }

    initializeData();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main>
          {isLoading ? (
            <div className="container mx-auto px-4 py-8">
              <div className="bg-blue-100 p-4 rounded-md">
                <p className="text-blue-800">Cargando datos de la hoja de cálculo...</p>
              </div>
              <div className="animate-pulse mt-8 space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="container mx-auto px-4 py-8">
              <div className="bg-yellow-100 p-4 rounded-md mb-4">
                <p className="text-yellow-800">{error}</p>
              </div>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/entradas" element={<EntradasPage />} />
                <Route path="/saidas" element={<SaidasPage />} />
                <Route path="/historial-entradas" element={<HistorialEntradasPage />} />
                <Route path="/historial-salidas" element={<HistorialSalidasPage />} />
              </Routes>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/entradas" element={<EntradasPage />} />
              <Route path="/saidas" element={<SaidasPage />} />
              <Route path="/historial-entradas" element={<HistorialEntradasPage />} />
              <Route path="/historial-salidas" element={<HistorialSalidasPage />} />
            </Routes>
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;
