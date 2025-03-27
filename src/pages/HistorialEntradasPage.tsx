import { useState, useEffect } from 'react';
import { getAllEntradas } from '../services/publicSheetService';
import { EntradaItem } from '../types';
import { formatCurrency } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function HistorialEntradasPage() {
  const [entradas, setEntradas] = useState<EntradaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    async function fetchEntradas() {
      try {
        setIsLoading(true);
        const data = await getAllEntradas();
        // Ordenar por fecha (más reciente primero)
        data.sort((a, b) => {
          return b['Ultima Atualização'].localeCompare(a['Ultima Atualização']);
        });
        setEntradas(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar historial de entradas:', err);
        setError('Error al cargar el historial de entradas');
      } finally {
        setIsLoading(false);
      }
    }

    fetchEntradas();
  }, []);

  // Filtrar entradas según el término de búsqueda
  const entradasFiltradas = entradas.filter(entrada =>
    entrada.Código.toLowerCase().includes(filtro.toLowerCase()) ||
    entrada.Descrição.toLowerCase().includes(filtro.toLowerCase()) ||
    entrada.Fornecedor.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 sm:mb-0">Historial de Entradas</h2>
        <Link
          to="/entradas"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Registrar Nueva Entrada
        </Link>
      </div>

      {/* Filtro */}
      <div className="bg-white p-4 rounded-md shadow-md mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar por código, descripción o proveedor"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {entradasFiltradas.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {filtro ? 'No se encontraron entradas que coincidan con la búsqueda.' : 'No hay entradas registradas.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
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
                      Nota
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entradasFiltradas.map((entrada, index) => (
                    <tr key={`${entrada.Código}-${entrada['Ultima Atualização']}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entrada['Ultima Atualização']}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entrada.Código}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entrada.Descrição}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entrada.Fornecedor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entrada.Quantidade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof entrada.Preço === 'string' ? entrada.Preço : formatCurrency(entrada.Preço)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {entrada.Nota}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
