import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllStockItems } from '../services/publicSheetService';
import { StockItem } from '../types';
import { formatCurrency } from '../lib/utils';
import { MovimientosRecientes } from '../components/MovimientosRecientes';

export default function HomePage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchStockItems() {
      try {
        setIsLoading(true);
        const items = await getAllStockItems();
        setStockItems(items);
        setError(null);
      } catch (err) {
        console.error('Error fetching stock items:', err);
        setError('Error al cargar los items del inventario. Por favor, intente nuevamente.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStockItems();
  }, []);

  // Filtramos los items basados en el término de búsqueda
  const filteredItems = stockItems.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.Código.toLowerCase().includes(searchLower) ||
      (item.Descrição ? item.Descrição.toLowerCase().includes(searchLower) : '') ||
      (item.Descripción ? item.Descripción.toLowerCase().includes(searchLower) : '') ||
      item.Fornecedor.toLowerCase().includes(searchLower)
    );
  });

  // Calcular valor total del inventario
  const valorTotal = stockItems.reduce((total, item) => {
    const precio = typeof item.Preço === 'string' ?
      parseFloat(item.Preço.replace(',', '.')) :
      item.Preço;
    const cantidad = typeof item.Quantidade === 'string' ?
      parseFloat(item.Quantidade) :
      item.Quantidade;

    return total + (precio * cantidad);
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold mb-4 sm:mb-0">Inventario Actual</h2>
        <div className="flex space-x-4">
          <Link
            to="/entradas"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Nueva Entrada
          </Link>
          <Link
            to="/saidas"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Nueva Salida
          </Link>
        </div>
      </div>

      {/* Dashboard de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Productos</h3>
          <p className="text-3xl font-bold text-blue-600">{stockItems.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Valor del Inventario</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(valorTotal)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Productos con Stock Bajo</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {stockItems.filter(item => {
              const cantidad = typeof item.Quantidade === 'string' ?
                parseFloat(item.Quantidade) :
                item.Quantidade;
              return cantidad < 10; // Consideramos bajo stock menos de 10 unidades
            }).length}
          </p>
        </div>
      </div>

      {/* Movimientos recientes */}
      <MovimientosRecientes />

      {/* Búsqueda */}
      <div className="bg-white p-4 rounded-md shadow-md mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, descripción o proveedor"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Enlaces a historiales completos */}
      <div className="flex justify-end space-x-4 mb-4">
        <Link
          to="/historial-entradas"
          className="text-sm text-green-600 hover:text-green-800 font-medium"
        >
          Ver historial de entradas
        </Link>
        <Link
          to="/historial-salidas"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Ver historial de salidas
        </Link>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded-md text-red-800">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-600 hover:underline"
          >
            Intentar nuevamente
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Actualización
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron ítems que coincidan con la búsqueda.' : 'No hay ítems en el inventario'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.Código} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.Código}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.Descrição || item.Descripción || ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.Fornecedor}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      typeof item.Quantidade === 'string' && parseFloat(item.Quantidade) < 10 ||
                      typeof item.Quantidade === 'number' && item.Quantidade < 10 ?
                      'text-red-600 font-semibold' : 'text-gray-500'
                    }`}>
                      {item.Quantidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {typeof item.Preço === 'string' ? item.Preço : formatCurrency(item.Preço)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item['Última Actualización']}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
