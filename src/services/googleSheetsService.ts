import { EntradaItem, SaidaItem, StockItem } from '../types';
import { SHEETS } from '../lib/sheetId';
import { getCurrentFormattedDate } from '../lib/utils';
import { mockStock, mockEntradas, mockSaidas } from './mockData';

// Variables para mantener los datos en memoria
let stockData = [...mockStock];
let entradasData = [...mockEntradas];
let saidasData = [...mockSaidas];

// Función para simular un delay de red
const simulateNetworkDelay = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 500));
};

// Obtener datos de una hoja específica
export const fetchSheetData = async (sheetName: string): Promise<any[]> => {
  try {
    await simulateNetworkDelay();

    if (sheetName === SHEETS.STOCK) {
      return [...stockData];
    } else if (sheetName === SHEETS.ENTRADAS) {
      return [...entradasData];
    } else if (sheetName === SHEETS.SAIDAS) {
      return [...saidasData];
    }

    return [];
  } catch (error) {
    console.error(`Error fetching ${sheetName} data:`, error);
    throw error;
  }
};

// Buscar un item en Stock por su código
export const findItemByCode = async (code: string): Promise<StockItem | null> => {
  try {
    await simulateNetworkDelay();
    const item = stockData.find((item: StockItem) => item.Código === code);
    return item || null;
  } catch (error) {
    console.error('Error finding item by code:', error);
    throw error;
  }
};

// Añadir una nueva entrada
export const addEntrada = async (item: EntradaItem): Promise<void> => {
  try {
    await simulateNetworkDelay();

    // Añadir a la hoja de Entradas
    const newEntrada = {
      ...item,
      'Ultima Atualização': getCurrentFormattedDate()
    };
    entradasData.push(newEntrada);

    // Actualizar el Stock
    const stockItem = stockData.find(si => si.Código === item.Código);

    if (stockItem) {
      // Actualizar el item existente
      const updatedQuantity = Number(stockItem.Quantidade) + Number(item.Quantidade);
      stockItem.Quantidade = updatedQuantity;
      stockItem['Ultima Atualização'] = getCurrentFormattedDate();
    } else {
      // Añadir un nuevo item
      stockData.push({
        ...item,
        'Ultima Atualização': getCurrentFormattedDate()
      });
    }
  } catch (error) {
    console.error('Error adding entrada:', error);
    throw error;
  }
};

// Añadir una nueva salida
export const addSaida = async (item: SaidaItem): Promise<void> => {
  try {
    await simulateNetworkDelay();

    // Añadir a la hoja de Saídas
    const newSaida = {
      ...item,
      'Ultima Atualização': getCurrentFormattedDate()
    };
    saidasData.push(newSaida);

    // Actualizar el Stock
    const stockItem = stockData.find(si => si.Código === item.Código);

    if (stockItem) {
      // Calcular nueva cantidad
      let newQuantity = Number(stockItem.Quantidade) - Number(item.Quantidade);
      newQuantity = newQuantity < 0 ? 0 : newQuantity;

      // Actualizar el item
      stockItem.Quantidade = newQuantity;
      stockItem['Ultima Atualização'] = getCurrentFormattedDate();
    }
  } catch (error) {
    console.error('Error adding saida:', error);
    throw error;
  }
};

// Obtener todos los items del Stock
export const getAllStockItems = async (): Promise<StockItem[]> => {
  try {
    await simulateNetworkDelay();
    return [...stockData];
  } catch (error) {
    console.error('Error getting all stock items:', error);
    throw error;
  }
};
