import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Formatear fecha con el formato requerido (DD/MM/YYYY HH:mm)
export const formatDate = (date: Date): string => {
  return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
};

// Obtener la fecha actual formateada
export const getCurrentFormattedDate = (dayAdjustment: number = 0): string => {
  const date = new Date();
  if (dayAdjustment !== 0) {
    date.setDate(date.getDate() + dayAdjustment);
  }
  return formatDate(date);
};

// Validar que la fecha de salida no sea menor a la de entrada
export const isValidSaidaDate = (stockDate: string, saidaDate: string): boolean => {
  if (!stockDate || !saidaDate) return true;

  try {
    const [stockDay, stockMonth, stockRest] = stockDate.split('/');
    const [stockYear, stockTime] = stockRest.split(' ');

    const [saidaDay, saidaMonth, saidaRest] = saidaDate.split('/');
    const [saidaYear, saidaTime] = saidaRest.split(' ');

    const stockDateObj = new Date(
      Number(stockYear),
      Number(stockMonth) - 1,
      Number(stockDay),
      ...stockTime.split(':').map(Number)
    );

    const saidaDateObj = new Date(
      Number(saidaYear),
      Number(saidaMonth) - 1,
      Number(saidaDay),
      ...saidaTime.split(':').map(Number)
    );

    return saidaDateObj >= stockDateObj;
  } catch (error) {
    console.error('Error validating dates:', error);
    return false;
  }
};

// Formatear valor como moneda (Euro)
export const formatCurrency = (value: number | string): string => {
  if (typeof value === 'string') {
    // Convertir a número si es una cadena
    value = parseFloat(value.replace(',', '.'));
  }

  // Asegurar que no sea negativo
  value = value < 0 ? 0 : value;

  // Formatear con 2 decimales y separador de miles
  return value.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Parsear un valor de moneda a número
export const parseCurrency = (value: string): number => {
  // Remover el símbolo de euro y reemplazar comas por puntos
  const numStr = value.replace(/[€\s]/g, '').replace(',', '.');
  const num = parseFloat(numStr);
  return isNaN(num) ? 0 : num;
};

// Asegurar que un valor numérico no sea negativo
export const ensurePositiveNumber = (value: number | string): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) || num < 0 ? 0 : num;
};
