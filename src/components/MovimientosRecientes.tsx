import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EntradaItem, SaidaItem } from '../types';
import { getAllEntradas, getAllSaidas } from '../services/publicSheetService';
import { formatCurrency } from '../lib/utils';

type Movimiento = (EntradaItem | SaidaItem) & { tipo: 'entrada' | 'saida' };

export function MovimientosRecientes() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovimientos() {
      try {
        setIsLoading(true);
        const entradas = await getAllEntradas();
        const saidas = await getAllSaidas();

        // Combinar entradas y salidas
        const entradasConTipo = entradas.map(e => ({ ...e, tipo: 'entrada' as const }));
        const saidasConTipo = saidas.map(s => ({ ...s, tipo: 'saida' as const }));

        // Unir y ordenar por fecha (las más recientes primero)
        const todosMovimientos = [...entradasConTipo, ...saidasConTipo].sort((a, b) => {
          // Manejar el campo de fecha independientemente de su nombre
          const fechaA = a['Ultima Atualização'] || '';
          const fechaB = b['Ultima Atualização'] || '';

          // Si las fechas están en formato DD/MM/YYYY HH:mm, convertirlas para comparar correctamente
          const convertirFecha = (fechaStr: string) => {
            if (!fechaStr) return '';
            const match = fechaStr.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
            if (match) {
              // Convertir a formato YYYY-MM-DD HH:mm para ordenar correctamente
              return `${match[3]}-${match[2]}-${match[1]} ${match[4]}:${match[5]}`;
            }
            return fechaStr;
          };

          const fechaConvertidaA = convertirFecha(fechaA);
          const fechaConvertidaB = convertirFecha(fechaB);

          // Ordenar de forma descendente (más reciente primero)
          return fechaConvertidaB.localeCompare(fechaConvertidaA);
        });

        // Tomar solo los últimos 10 movimientos
        const ultimosMovimientos = todosMovimientos.slice(0, 10);

        setMovimientos(ultimosMovimientos);
        setError(null);
      } catch (err) {
        console.error('Error al cargar movimientos:', err);
        setError('Error al cargar los movimientos recientes');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovimientos();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Movimientos Recientes</h3>
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-10 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Movimientos Recientes</h3>
        <div className="bg-red-100 p-3 rounded-md text-red-800">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (movimientos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Movimientos Recientes</h3>
        <p className="text-gray-500">No hay movimientos registrados</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Movimientos Recientes</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {movimientos.map((movimiento, index) => (
              <tr key={`${movimiento.Código}-${movimiento['Ultima Atualização']}-${index}`} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {movimiento['Ultima Atualização']}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    movimiento.tipo === 'entrada'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {movimiento.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {movimiento.Código}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {movimiento.Descrição}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {movimiento.Quantidade}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {typeof movimiento.Preço === 'string' ? movimiento.Preço : formatCurrency(movimiento.Preço)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end space-x-4">
        <Link
          to="/historial-entradas"
          className="text-sm text-green-600 hover:text-green-800 font-medium"
        >
          Ver todas las entradas
        </Link>
        <Link
          to="/historial-salidas"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Ver todas las salidas
        </Link>
      </div>
    </div>
  );
}
