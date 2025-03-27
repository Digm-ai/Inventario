import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { FormField, TextAreaField } from '../components/FormField';
import { Button } from '../components/Button';
import { ItemList } from '../components/ItemList';

import { findItemByCode, getAllStockItems, addEntrada } from '../services/publicSheetService';
import { entradaSchema, EntradaFormValues } from '../lib/validators';
import { getCurrentFormattedDate, formatCurrency } from '../lib/utils';
import { StockItem } from '../types';

export default function EntradasPage() {
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
    reset,
    formState: { errors }
  } = useForm<EntradaFormValues>({
    resolver: zodResolver(entradaSchema),
    defaultValues: {
      Código: '',
      Descrição: '',
      Fornecedor: '',
      Quantidade: '0',
      'Ultima Atualização': getCurrentFormattedDate(),
      Preço: '0',
      Nota: ''
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
    setValue('Ultima Atualização', getCurrentFormattedDate());

    // Limpiar resultados de búsqueda
    setSearchResults([]);
    setSearchTerm('');
  };

  // Manejar el envío del formulario
  const onSubmit = async (data: EntradaFormValues) => {
    setIsSubmitting(true);
    setFormMessage(null);

    try {
      // Asegurarse de que la fecha de actualización esté en el formato correcto
      data['Ultima Atualização'] = getCurrentFormattedDate();

      // Añadir entrada al inventario
      await addEntrada(data);

      setFormMessage({
        type: 'success',
        text: 'Entrada registrada correctamente'
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
      console.error('Error al registrar entrada:', error);
      setFormMessage({
        type: 'error',
        text: 'Error al registrar la entrada. Por favor, intente nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Registrar Nueva Entrada</h2>

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

      {/* Formulario */}
      <div className="bg-white p-6 rounded-md shadow-md">
        <h3 className="text-lg font-semibold mb-4">
          {selectedItem ? 'Actualizar ítem existente' : 'Registrar nuevo ítem'}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              id="Código"
              label="Código"
              disabled={!!selectedItem}
              error={errors.Código?.message?.toString()}
              {...register('Código')}
            />

            <FormField
              id="Descrição"
              label="Descripción"
              disabled={!!selectedItem}
              error={errors.Descrição?.message?.toString()}
              {...register('Descrição')}
            />

            <FormField
              id="Fornecedor"
              label="Proveedor"
              error={errors.Fornecedor?.message?.toString()}
              {...register('Fornecedor')}
            />

            <FormField
              id="Quantidade"
              label="Cantidad"
              type="number"
              min="0"
              error={errors.Quantidade?.message?.toString()}
              {...register('Quantidade')}
            />

            <FormField
              id="Preço"
              label="Precio (€)"
              placeholder="0,00"
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
            >
              Registrar Entrada
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
