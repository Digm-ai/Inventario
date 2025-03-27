import { StockItem } from '../types';

interface ItemListProps {
  items: StockItem[];
  onSelectItem: (item: StockItem) => void;
  isLoading?: boolean;
}

export function ItemList({ items, onSelectItem, isLoading = false }: ItemListProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-md shadow-md mb-6">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white p-4 rounded-md shadow-md mb-6">
        <p className="text-gray-600">No hay ítems disponibles.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-3">Seleccionar ítem:</h3>
      <div className="max-h-72 overflow-y-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.Código} className="hover:bg-gray-50">
                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.Código}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                  {item.Descrição}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                  {item.Quantidade}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onSelectItem(item)}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    Seleccionar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
