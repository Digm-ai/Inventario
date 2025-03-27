import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Función para determinar la clase activa
  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `px-4 py-2 rounded-md transition-colors ${
      isActive ? 'bg-white text-blue-600 font-bold' : 'hover:bg-blue-700'
    }`;
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Control de Inventario</h1>

          {/* Botón para móviles */}
          <button
            className="md:hidden p-2 rounded-md bg-blue-700 hover:bg-blue-800 mb-4"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>

          {/* Navegación */}
          <nav className={`flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 ${isMenuOpen ? 'block' : 'hidden md:flex'}`}>
            <Link
              to="/"
              className={getLinkClass('/')}
              onClick={() => setIsMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              to="/entradas"
              className={getLinkClass('/entradas')}
              onClick={() => setIsMenuOpen(false)}
            >
              Registrar Entrada
            </Link>
            <Link
              to="/saidas"
              className={getLinkClass('/saidas')}
              onClick={() => setIsMenuOpen(false)}
            >
              Registrar Salida
            </Link>

            {/* Menú desplegable */}
            <div className="relative group">
              <button
                className="px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                Historial
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block z-10">
                <Link
                  to="/historial-entradas"
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Historial de Entradas
                </Link>
                <Link
                  to="/historial-salidas"
                  className="block px-4 py-2 text-gray-800 hover:bg-blue-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Historial de Salidas
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
