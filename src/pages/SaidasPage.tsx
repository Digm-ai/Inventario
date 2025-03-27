import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { FormField, TextAreaField } from '../components/FormField';
import { Button } from '../components/Button';
import { ItemList } from '../components/ItemList';

import { findItemByCode, getAllStockItems, addSaida } from '../services/publicSheetService';
import { saidaSchema, SaidaFormValues } from '../lib/validators';
import { getCurrentFormattedDate, formatCurrency } from '../lib/utils';
import { StockItem } from '../types';

export default function SaidasPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<StockItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    clearErrors,
    formState: { errors }
  } = useForm<SaidaFormValues>({
    resolver: zodResolver(saidaSchema),
    defaultValues: {
      Código: '',
      Descrição: '',
      Fornecedor: '',
      Quantidade: '0',
      'Ultima Atualização': getCurrentFormattedDate(),
      Preço: '0',
      Nota: ''
    },
    context: {
      stockDate: selectedItem ? selectedItem['Ultima Atualização'] : ''
    }
  });

  // Buscar por código
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const allItems = await getAllStockItems();
      const filtered = allItems.filter(item =>
        item.Código.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Descrição.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching items:', error);
      setFormMessage({
        type: 'error',
        text: 'Error al buscar items. Por favor, intente nuevamente.'
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Seleccionar un item de la lista
  const handleSelectItem = (item: StockItem) => {
    setSelectedItem(item);
    // Pre-rellenar el formulario con los datos del ítem seleccionado
    setValue('Código', item.Código);
    setValue('Descrição', item.Descrição);
    setValue('Fornecedor', item.Fornecedor);
    setValue('Preço', item.Preço.toString());
    setValue('Ultima Atualização', getCurrentFormattedDate());

    // Limpiar resultados de búsqueda
    setSearchResults([]);
    setSearchTerm('');
  };

  // Manejar el envío del formulario
  const onSubmit = async (data: SaidaFormValues) => {
    if (!selectedItem) {
      setFormMessage({
        type: 'error',
        text: 'Debe seleccionar un ítem del inventario para registrar una salida'
      });
      return;
    }

    // Validar que la cantidad a retirar no sea mayor que la disponible
    const stockQty = parseFloat(selectedItem.Quantidade.toString());
    const withdrawQty = parseFloat(data.Quantidade);

    if (withdrawQty > stockQty) {
      setError('Quantidade', {
        type: 'manual',
        message: `La cantidad a retirar no puede ser mayor que la disponible (${stockQty})`
      });
      return;
    }

    setIsSubmitting(true);
    setFormMessage(null);

    try {
      // Asegurarse de que la fecha de actualización esté en el formato correcto
      data['Ultima Atualização'] = getCurrentFormattedDate();

      // Añadir salida al inventario
      await addSaida(data);

      setFormMessage({
        type: 'success',
        text: 'Salida registrada correctamente'
      });

      // Resetear formulario
      reset({
        Código: '',
        Descrição: '',
        Fornecedor: '',
        Quantidade: '0',
        'Ultima Atualização': getCurrentFormattedDate(),
        Preço: '0',
        Nota: ''
      });

      setSelectedItem(null);

      // Opcional: Redirigir a la página principal después de unos segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error al registrar salida:', error);
      setFormMessage({
        type: 'error',
        text: 'Error al registrar la salida. Por favor, intente nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Registrar Nueva Salida</h2>

      {/* Búsqueda */}
      <div className="bg-white p-6 rounded-md shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-3">Buscar ítem existente</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código o descripción"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleSearch}
            isLoading={isSearching}
            className="sm:w-auto"
          >
            Buscar
          </Button>
        </div>
      </div>

      {/* Resultados de búsqueda */}
      {searchResults.length > 0 && (
        <ItemList
          items={searchResults}
          onSelectItem={handleSelectItem}
          isLoading={isSearching}
        />
      )}

      {/* Mensaje de formulario */}
      {formMessage && (
        <div className={`p-4 mb-6 rounded-md ${
          formMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <p>{formMessage.text}</p>
        </div>
      )}

      {/* Item seleccionado */}
      {selectedItem && (
        <div className="bg-blue-50 p-4 mb-6 rounded-md border border-blue-200">
          <h3 className="text-lg font-semibold mb-2">Ítem seleccionado:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="font-medium">Código:</span> {selectedItem.Código}
            </div>
            <div>
              <span className="font-medium">Descripción:</span> {selectedItem.Descrição}
            </div>
            <div>
              <span className="font-medium">Cantidad disponible:</span> {selectedItem.Quantidade}
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white p-6 rounded-md shadow-md">
        <h3 className="text-lg font-semibold mb-4">
          Registrar Salida de Inventario
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="Código"
              label="Código"
              disabled={true}
              error={errors.Código?.message?.toString()}
              {...register('Código')}
            />

            <FormField
              id="Descrição"
              label="Descripción"
              disabled={true}
              error={errors.Descrição?.message?.toString()}
              {...register('Descrição')}
            />

            <FormField
              id="Fornecedor"
              label="Proveedor"
              disabled={true}
              error={errors.Fornecedor?.message?.toString()}
              {...register('Fornecedor')}
            />

            <FormField
              id="Quantidade"
              label="Cantidad a retirar"
              type="number"
              min="0"
              error={errors.Quantidade?.message?.toString()}
              {...register('Quantidade')}
            />

            <FormField
              id="Preço"
              label="Precio (€)"
              disabled={true}
              error={errors.Preço?.message?.toString()}
              {...register('Preço')}
            />

            <FormField
              id="Ultima Atualização"
              label="Fecha de Actualización"
              readOnly
              value={getCurrentFormattedDate()}
              error={errors['Ultima Atualização']?.message?.toString()}
              {...register('Ultima Atualização')}
            />
          </div>

          <TextAreaField
            id="Nota"
            label="Nota"
            error={errors.Nota?.message?.toString()}
            {...register('Nota')}
          />

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!selectedItem}
            >
              Registrar Salida
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
