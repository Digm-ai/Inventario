import axios from 'axios';
import { EntradaItem, SaidaItem, StockItem } from '../types';
import { getCurrentFormattedDate } from '../lib/utils';
import { SHEET_ID, SHEETS, PUBLIC_SHEET_URL } from '../lib/sheetId';
import { mockStock, mockEntradas, mockSaidas } from './mockData';

// URLs para acceder a las hojas publicadas en formato CSV
const CSV_BASE_URL = 'https://docs.google.com/spreadsheets/d/';
const CSV_SUFFIX = '/pub?gid=0&single=true&output=csv';

// Para extraer datos de una hoja específica publicada
const getSheetCsvUrl = (sheetName: string): string => {
  // Usar directamente la URL pública proporcionada
  return PUBLIC_SHEET_URL;
};

// Variables para mantener los datos en caché
let stockData: StockItem[] = [...mockStock]; // Inicializar con datos de ejemplo
let entradasData: EntradaItem[] = [...mockEntradas];
let saidasData: SaidaItem[] = [...mockSaidas];
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 segundos de caché

// Función para simular un delay de red
const simulateNetworkDelay = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 300));
};

// Función para extraer datos de una tabla HTML
const extractDataFromHtml = (html: string, tableName: string): any[] => {
  console.log(`Intentando extraer datos para tabla: ${tableName} de HTML`);

  try {
    // Crear un parser DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Intentar encontrar la tabla correcta - esto depende de la estructura del HTML
    const tables = doc.querySelectorAll('table');
    let targetTable = null;

    // Buscar la tabla que corresponde al nombre de la hoja
    for (let i = 0; i < tables.length; i++) {
      const tableText = tables[i].textContent || '';
      // Intentar identificar la tabla correcta por su contenido
      if (tableText.includes(tableName) ||
          (tableName === SHEETS.STOCK && tableText.includes('Código')) ||
          (tableName === SHEETS.ENTRADAS && tableText.includes('Entrada')) ||
          (tableName === SHEETS.SAIDAS && tableText.includes('Salida'))) {
        targetTable = tables[i];
        break;
      }
    }

    // Si no encontramos una tabla específica, usar la primera
    if (!targetTable && tables.length > 0) {
      targetTable = tables[0];
    }

    if (!targetTable) {
      console.error('No se encontró ninguna tabla en el HTML');
      return [];
    }

    // Extraer encabezados
    const headers: string[] = [];
    const headerRow = targetTable.querySelector('tr');
    if (headerRow) {
      const headerCells = headerRow.querySelectorAll('th, td');
      headerCells.forEach(cell => {
        headers.push((cell.textContent || '').trim());
      });
    }

    // Extraer datos
    const result: any[] = [];
    const rows = targetTable.querySelectorAll('tr');

    // Empezar desde la segunda fila (índice 1) para omitir los encabezados
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const cells = row.querySelectorAll('td');

      if (cells.length === 0) continue;

      const obj: Record<string, any> = {};

      cells.forEach((cell, index) => {
        if (index < headers.length) {
          obj[headers[index]] = (cell.textContent || '').trim();
        }
      });

      result.push(obj);
    }

    return result;
  } catch (error) {
    console.error('Error extrayendo datos del HTML:', error);
    return [];
  }
};

// Función para parsear CSV a un array de objetos
const parseCSV = (csv: string): any[] => {
  const lines = csv.split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => {
    // Eliminar comillas si existen
    return h.trim().replace(/^"(.*)"$/, '$1');
  });

  const result = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Ignorar líneas vacías

    // Manejar correctamente las comas en campos con comillas
    const values: string[] = [];
    let insideQuotes = false;
    let currentValue = '';

    // Recorrer cada caracter de la línea
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];

      if (char === '"' && (j === 0 || lines[i][j-1] !== '\\')) {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim().replace(/^"(.*)"$/, '$1'));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    // Añadir el último valor
    values.push(currentValue.trim().replace(/^"(.*)"$/, '$1'));

    const obj: Record<string, any> = {};

    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });

    result.push(obj);
  }

  return result;
};

// Función auxiliar para mapear cualquier objeto a la estructura InventoryItem
const mapToInventoryItem = (item: any): StockItem => ({
  Código: item.Código || item.Codigo || '',
  Descrição: item.Descrição || item.Descripcion || item.Descripción || '',
  Fornecedor: item.Fornecedor || item.Proveedor || '',
  Quantidade: item.Quantidade || item.Cantidad || 0,
  'Ultima Atualização': item['Ultima Atualização'] || item['Ultima Atualización'] || getCurrentFormattedDate(),
  Preço: item.Preço || item.Precio || '0',
  Nota: item.Nota || ''
});

// Cargar datos iniciales desde las hojas publicadas
export const loadInitialData = async (): Promise<void> => {
  try {
    console.log('Iniciando carga de datos iniciales...');
    // Cargar datos solo si ha pasado el tiempo de caché o es la primera carga
    const now = Date.now();
    if (now - lastFetchTime > CACHE_DURATION || stockData.length === 0) {
      // Cargar datos desde el CSV público
      const items = await fetchSheetData(SHEETS.STOCK);

      if (items.length > 0) {
        console.log('Datos cargados:', items);

        // Procesar los datos según su tipo
        // En el CSV, cada fila debe tener una columna 'Tipo' que indique si es Stock, Entrada o Salida
        const stockItems = items.filter(item => !item.Tipo || item.Tipo === 'Stock');
        const entradasItems = items.filter(item => item.Tipo === 'Entrada');
        const saidasItems = items.filter(item => item.Tipo === 'Salida' || item.Tipo === 'Saída');

        // Si no hay datos clasificados por tipo o todos están en una sola categoría,
        // consideramos que todos pertenecen al stock
        if (stockItems.length === 0 && entradasItems.length === 0 && saidasItems.length === 0) {
          // Todos los items se consideran stock
          stockData = items.map(mapToInventoryItem);

          // Para efectos de demostración, generamos algunos datos de ejemplo para entradas y salidas
          // basados en el stock actual si no hay datos específicos
          if (stockData.length > 0) {
            // Crear entradas de ejemplo basadas en los primeros items del stock
            entradasData = stockData.slice(0, Math.min(3, stockData.length)).map(item => ({
              ...item,
              'Ultima Atualização': getCurrentFormattedDate(-2) // 2 días antes
            }));

            // Crear salidas de ejemplo basadas en los siguientes items del stock
            saidasData = stockData.slice(Math.min(3, stockData.length), Math.min(5, stockData.length)).map(item => ({
              ...item,
              Quantidade: Math.min(2, Number(item.Quantidade)),
              'Ultima Atualização': getCurrentFormattedDate(-1) // 1 día antes
            }));
          } else {
            // Si no hay datos de stock, usamos los ejemplos predefinidos
            entradasData = [...mockEntradas];
            saidasData = [...mockSaidas];
          }
        } else {
          // Usar los datos clasificados
          if (stockItems.length > 0) {
            console.log('Datos de stock identificados:', stockItems);
            stockData = stockItems.map(mapToInventoryItem);
          }

          if (entradasItems.length > 0) {
            console.log('Datos de entradas identificados:', entradasItems);
            entradasData = entradasItems.map(mapToInventoryItem);
          } else {
            // Si no hay entradas, usamos los ejemplos
            entradasData = [...mockEntradas];
          }

          if (saidasItems.length > 0) {
            console.log('Datos de salidas identificados:', saidasItems);
            saidasData = saidasItems.map(mapToInventoryItem);
          } else {
            // Si no hay salidas, usamos los ejemplos
            saidasData = [...mockSaidas];
          }
        }
      } else {
        // Si no hay datos, usamos los ejemplos
        stockData = [...mockStock];
        entradasData = [...mockEntradas];
        saidasData = [...mockSaidas];
      }

      lastFetchTime = now;
    }

    console.log('Datos iniciales cargados con éxito. Stock:', stockData);
    console.log('Entradas:', entradasData);
    console.log('Salidas:', saidasData);
  } catch (error) {
    console.error('Error cargando datos iniciales:', error);
    // Si hay error, usamos los datos de ejemplo que ya están cargados
    stockData = [...mockStock];
    entradasData = [...mockEntradas];
    saidasData = [...mockSaidas];
    throw error;
  }
};

// Función para cargar datos de una hoja específica
const fetchSheetData = async (sheetName: string): Promise<any[]> => {
  try {
    console.log(`Cargando datos de la hoja: ${sheetName}`);

    // Intentamos cargar directamente desde la URL CSV pública
    try {
      const csvUrl = PUBLIC_SHEET_URL;
      console.log(`Intentando cargar CSV desde: ${csvUrl}`);
      const response = await axios.get(csvUrl);
      if (response.data && typeof response.data === 'string') {
        return parseCSV(response.data);
      }
    } catch (csvError) {
      console.warn(`No se pudo cargar como CSV, error:`, csvError);
    }

    // Si falla, usamos datos de ejemplo
    console.warn(`Usando datos de ejemplo para ${sheetName}`);
    if (sheetName === SHEETS.STOCK) return [...mockStock];
    if (sheetName === SHEETS.ENTRADAS) return [...mockEntradas];
    if (sheetName === SHEETS.SAIDAS) return [...mockSaidas];

    return [];
  } catch (error) {
    console.error(`Error al cargar datos de ${sheetName}:`, error);
    // Si hay un error, devolvemos datos de ejemplo para desarrollo
    if (sheetName === SHEETS.STOCK) return [...mockStock];
    if (sheetName === SHEETS.ENTRADAS) return [...mockEntradas];
    if (sheetName === SHEETS.SAIDAS) return [...mockSaidas];
    return [];
  }
};

// Obtener todos los items del Stock
export const getAllStockItems = async (): Promise<StockItem[]> => {
  await simulateNetworkDelay();

  // Verificar si necesitamos actualizar los datos del caché
  const now = Date.now();
  if (now - lastFetchTime > CACHE_DURATION) {
    await loadInitialData();
  }

  return [...stockData];
};

// Buscar un item en Stock por su código
export const findItemByCode = async (code: string): Promise<StockItem | null> => {
  await simulateNetworkDelay();

  // Verificar si necesitamos actualizar los datos del caché
  const now = Date.now();
  if (now - lastFetchTime > CACHE_DURATION) {
    await loadInitialData();
  }

  const item = stockData.find(item => item.Código === code);
  return item || null;
};

// Función para enviar datos a Google Sheets usando Google Apps Script
const sendDataToGoogleSheet = async (
  data: any,
  operation: 'entrada' | 'saida'
): Promise<void> => {
  try {
    // Esta función simula el envío de datos a la hoja de cálculo
    // En un entorno real, se necesitaría una API o WebApp desplegada en Apps Script
    console.log(`Simulando envío de datos de ${operation} a Google Sheets:`, data);

    // Aquí simplemente actualizamos nuestros datos en memoria
    // En un caso real, esto se enviaría a Google Sheets
  } catch (error) {
    console.error(`Error simulando envío de datos de ${operation} a Google Sheets:`, error);
    throw error;
  }
};

// Añadir una nueva entrada
export const addEntrada = async (item: EntradaItem): Promise<void> => {
  await simulateNetworkDelay();

  // Asegurar que la descripción esté correctamente asignada
  if (!item.Descrição && item.Descripción) {
    item.Descrição = item.Descripción;
  }

  // Añadir a la hoja de Entradas
  const newEntrada = {
    ...item,
    'Ultima Atualização': getCurrentFormattedDate()
  };
  entradasData.push(newEntrada);

  // Actualizar el Stock en memoria
  const stockItem = stockData.find(si => si.Código === item.Código);

  if (stockItem) {
    // Actualizar el item existente
    const updatedQuantity = Number(stockItem.Quantidade) + Number(item.Quantidade);
    stockItem.Quantidade = updatedQuantity;
    stockItem['Ultima Atualização'] = getCurrentFormattedDate();

    // Asegurarse de que la descripción se mantiene
    if (item.Descrição && !stockItem.Descrição) {
      stockItem.Descrição = item.Descrição;
    }
  } else {
    // Añadir un nuevo item al stock
    const newItem: StockItem = {
      Código: item.Código,
      Descrição: item.Descrição || '',
      Fornecedor: item.Fornecedor,
      Quantidade: item.Quantidade,
      'Ultima Atualização': getCurrentFormattedDate(),
      Preço: item.Preço,
      Nota: item.Nota || ''
    };
    stockData.push(newItem);
  }

  // Simular envío de datos a Google Sheet
  try {
    await sendDataToGoogleSheet(newEntrada, 'entrada');
    console.log('Entrada añadida y stock actualizado:', item);
  } catch (error) {
    console.error('Error al registrar entrada (simulado):', error);
    // Incluso si falla el envío, mantenemos los datos actualizados localmente
  }
};

// Añadir una nueva salida
export const addSaida = async (item: SaidaItem): Promise<void> => {
  await simulateNetworkDelay();

  // Añadir a la hoja de Saídas
  const newSaida = {
    ...item,
    'Ultima Atualização': getCurrentFormattedDate()
  };
  saidasData.push(newSaida);

  // Actualizar el Stock en memoria
  const stockItem = stockData.find(si => si.Código === item.Código);

  if (stockItem) {
    // Calcular nueva cantidad
    let newQuantity = Number(stockItem.Quantidade) - Number(item.Quantidade);
    newQuantity = newQuantity < 0 ? 0 : newQuantity;

    // Actualizar el item
    stockItem.Quantidade = newQuantity;
    stockItem['Ultima Atualização'] = getCurrentFormattedDate();
  }

  // Simular envío de datos a Google Sheet
  try {
    await sendDataToGoogleSheet(newSaida, 'saida');
    console.log('Salida añadida y stock actualizado:', item);
  } catch (error) {
    console.error('Error al registrar salida (simulado):', error);
    // Incluso si falla el envío, mantenemos los datos actualizados localmente
  }
};

// Obtener historial de entradas
export const getAllEntradas = async (): Promise<EntradaItem[]> => {
  await simulateNetworkDelay();

  // Verificar si necesitamos actualizar los datos del caché
  const now = Date.now();
  if (now - lastFetchTime > CACHE_DURATION) {
    await loadInitialData();
  }

  return [...entradasData];
};

// Obtener historial de salidas
export const getAllSaidas = async (): Promise<SaidaItem[]> => {
  await simulateNetworkDelay();

  // Verificar si necesitamos actualizar los datos del caché
  const now = Date.now();
  if (now - lastFetchTime > CACHE_DURATION) {
    await loadInitialData();
  }

  return [...saidasData];
};
