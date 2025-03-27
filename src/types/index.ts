// Types for the inventory control application

// Base item interface
export interface InventoryItem {
  Código: string;
  Descrição: string;
  Descripción?: string;  // Campo alternativo para descripción
  Fornecedor: string;
  Quantidade: string | number;
  'Ultima Atualização': string;
  Preço: string | number;
  Nota: string;
  [key: string]: string | number | undefined;  // Índice de firma para permitir acceso dinámico a propiedades
}

export type EntradaItem = InventoryItem;

export type SaidaItem = InventoryItem;

export type StockItem = InventoryItem;

export interface FormValues {
  Código: string;
  Descrição: string;
  Descripción?: string;  // Campo alternativo para descripción
  Fornecedor: string;
  Quantidade: string;
  'Ultima Atualização': string;
  Preço: string;
  Nota: string;
  [key: string]: string | undefined;  // Índice de firma para permitir acceso dinámico a propiedades
}
