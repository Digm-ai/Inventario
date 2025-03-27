import { EntradaItem, SaidaItem, StockItem } from '../types';
import { getCurrentFormattedDate } from '../lib/utils';

// Datos de ejemplo para el inventario
export const mockStock: StockItem[] = [
  {
    Código: '001',
    Descrição: 'Laptop Dell XPS 13',
    Fornecedor: 'Dell Computers',
    Quantidade: 15,
    'Ultima Atualização': '25/03/2025 10:30',
    Preço: '1299,99',
    Nota: 'Modelo 2025 con Intel i7'
  },
  {
    Código: '002',
    Descrição: 'Monitor Samsung 27"',
    Fornecedor: 'Samsung Electronics',
    Quantidade: 28,
    'Ultima Atualização': '24/03/2025 14:45',
    Preço: '349,99',
    Nota: 'Resolución 4K, HDMI, DisplayPort'
  },
  {
    Código: '003',
    Descrição: 'Teclado Logitech MX Keys',
    Fornecedor: 'Logitech',
    Quantidade: 42,
    'Ultima Atualização': '23/03/2025 09:15',
    Preço: '119,99',
    Nota: 'Retroiluminado, conexión USB-C'
  },
  {
    Código: '004',
    Descrição: 'Ratón Logitech MX Master 3',
    Fornecedor: 'Logitech',
    Quantidade: 37,
    'Ultima Atualização': '22/03/2025 16:20',
    Preço: '99,99',
    Nota: 'Inalámbrico, Bluetooth'
  },
  {
    Código: '005',
    Descrição: 'Disco SSD Samsung 1TB',
    Fornecedor: 'Samsung Electronics',
    Quantidade: 50,
    'Ultima Atualização': '21/03/2025 11:10',
    Preço: '149,99',
    Nota: 'NVMe, PCIe 4.0'
  }
];

// Datos de ejemplo para las entradas
export const mockEntradas: EntradaItem[] = [
  {
    Código: '001',
    Descrição: 'Laptop Dell XPS 13',
    Fornecedor: 'Dell Computers',
    Quantidade: 10,
    'Ultima Atualização': '20/03/2025 09:00',
    Preço: '1299,99',
    Nota: 'Primera compra'
  },
  {
    Código: '002',
    Descrição: 'Monitor Samsung 27"',
    Fornecedor: 'Samsung Electronics',
    Quantidade: 20,
    'Ultima Atualização': '20/03/2025 09:15',
    Preço: '349,99',
    Nota: 'Modelos nuevos'
  },
  {
    Código: '001',
    Descrição: 'Laptop Dell XPS 13',
    Fornecedor: 'Dell Computers',
    Quantidade: 5,
    'Ultima Atualização': '22/03/2025 14:30',
    Preço: '1299,99',
    Nota: 'Reposición de stock'
  }
];

// Datos de ejemplo para las salidas
export const mockSaidas: SaidaItem[] = [
  {
    Código: '002',
    Descrição: 'Monitor Samsung 27"',
    Fornecedor: 'Samsung Electronics',
    Quantidade: 2,
    'Ultima Atualização': '21/03/2025 10:45',
    Preço: '349,99',
    Nota: 'Venta a cliente corporativo'
  },
  {
    Código: '003',
    Descrição: 'Teclado Logitech MX Keys',
    Fornecedor: 'Logitech',
    Quantidade: 3,
    'Ultima Atualização': '22/03/2025 16:30',
    Preço: '119,99',
    Nota: 'Venta a oficina central'
  }
];
