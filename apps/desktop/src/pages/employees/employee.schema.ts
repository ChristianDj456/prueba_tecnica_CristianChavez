import { z } from 'zod';

export const bloodTypes = [
  'O_POS','O_NEG','A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG'
] as const;

export const employeeSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  nationalId: z.string().min(5, 'Cédula inválida'),
  bloodType: z.enum(bloodTypes, { message: 'Tipo de sangre inválido' }),
  phone: z.string().min(1, 'Teléfono inválido'),
  salary: z.string().refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Salario inválido'),
  arlId: z.string().uuid('ARL requerida'),
  epsId: z.string().uuid('EPS requerida'),
  pensionFundId: z.string().uuid('Fondo requerido'),
  terminationDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)')
    .optional()
    .or(z.literal('')),
}); 

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
