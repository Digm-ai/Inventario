import { z } from 'zod';
import { isValidSaidaDate } from './utils';

// Regexp para validar el formato de fecha (DD/MM/YYYY HH:mm)
const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4} ([01][0-9]|2[0-3]):([0-5][0-9])$/;

// Validador base para los campos comunes
const baseValidator = {
  Código: z.string().min(1, 'El código es obligatorio'),
  Descrição: z.string().optional().default(''), // Hacerlo opcional para que no falle en registros existentes
  Descripción: z.string().optional().default(''), // Añadir soporte para ambos nombres
  Fornecedor: z.string().min(1, 'El proveedor es obligatorio'),
  Quantidade: z
    .string()
    .min(1, 'La cantidad es obligatoria')
    .transform((val) => {
      const num = parseFloat(val);
      return isNaN(num) || num < 0 ? '0' : val;
    }),
  'Ultima Atualização': z
    .string()
    .regex(dateRegex, 'El formato de fecha debe ser DD/MM/YYYY HH:mm'),
  'Ultima Actualización': z // Añadir soporte para ambos nombres de campo
    .string()
    .optional()
    .default(''),
  Preço: z
    .string()
    .min(1, 'El precio es obligatorio')
    .transform((val) => {
      const numStr = val.replace(/[€\s]/g, '').replace(',', '.');
      const num = parseFloat(numStr);
      return isNaN(num) || num < 0 ? '0' : val;
    }),
  Nota: z.string().optional().default('')
};

// Esquema para validar el formulario de entrada
export const entradaSchema = z.object({
  ...baseValidator
});

// Tipo de contexto para la validación
type SaidaContext = z.RefinementCtx & {
  contextData?: { stockDate: string };
};

// Esquema para validar el formulario de salida
export const saidaSchema = z.object({
  ...baseValidator,
  'Ultima Atualização': z
    .string()
    .regex(dateRegex, 'El formato de fecha debe ser DD/MM/YYYY HH:mm')
    .superRefine((date, ctx: SaidaContext) => {
      const stockDate = ctx.contextData?.stockDate;
      if (stockDate && !isValidSaidaDate(stockDate, date)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La fecha de salida no puede ser menor a la fecha de entrada en Stock'
        });
      }
    })
});

// Tipos inferidos para los formularios
export type EntradaFormValues = z.infer<typeof entradaSchema>;
export type SaidaFormValues = z.infer<typeof saidaSchema>;
