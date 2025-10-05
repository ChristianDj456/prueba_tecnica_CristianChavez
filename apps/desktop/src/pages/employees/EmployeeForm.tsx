import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type EmployeeFormValues, employeeSchema, bloodTypes } from './employee.schema';
import { useCatalogs } from '../../hooks/useCatalogs';
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'


type Props = {
  defaultValues?: Partial<EmployeeFormValues>;
  onSubmit: (values: EmployeeFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
};

export default function EmployeeForm({ defaultValues, onSubmit, onCancel, submitting }: Props) {
  const { arl, eps, pf, loading: loadingCats } = useCatalogs();
  const { register, handleSubmit, formState: { errors }, control } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: '', lastName: '', nationalId: '',
      bloodType: 'O_POS', phone: '', salary: '',
      arlId: '', epsId: '', pensionFundId: '',
      ...defaultValues,
    },
  });

  const salaryValue = useWatch({ control, name: 'salary' });
  const s = Number(salaryValue || 0);
  const empEps = s * 0.04;
  const empPen = s * 0.04;
  const net = s - (empEps + empPen);


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid w-full gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label>Nombre</label>
          <Input {...register('firstName')} />
          {errors.firstName && <small className="text-red-600">{errors.firstName.message}</small>}
        </div>
        <div>
          <label>Apellido</label>
          <Input {...register('lastName')} />
          {errors.lastName && <small className="text-red-600">{errors.lastName.message}</small>}
        </div>
        <div>
          <label>Cédula</label>
          <Input {...register('nationalId')} />
          {errors.nationalId && <small className="text-red-600">{errors.nationalId.message}</small>}
        </div>
        <div>
          <Controller
            name="bloodType"
            control={control}
            render={({ field }) => (
              <Select
                label="Tipo de sangre"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                options={bloodTypes.map((b) => ({ value: b, label: b }))}
              />
            )}
          />
          {errors.bloodType && <small className="text-red-600">{errors.bloodType.message}</small>}
        </div>
        <div>
          <label>Teléfono</label>
          <Input {...register('phone')} />
          {errors.phone && <small className="text-red-600">{errors.phone.message}</small>}
        </div>
        <div>
          <label>Salario</label>
          <Input {...register('salary')} />
          {errors.salary && <small className="text-red-600">{errors.salary.message}</small>}
        </div>
        <div>
          <Controller
            name="arlId"
            control={control}
            render={({ field }) => (
              <Select
                label="ARL"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                options={[ ...arl.map(a => ({ value: a.id, label: a.name }))]}
                disabled={loadingCats}
              />
            )}
          />
          {errors.arlId && <small className="text-red-600">{errors.arlId.message}</small>}
        </div>
        <div>
          <Controller
            name="epsId"
            control={control}
            render={({ field }) => (
              <Select
                label="EPS"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                options={[ ...eps.map(e => ({ value: e.id, label: e.name }))]}
                disabled={loadingCats}
              />
            )}
          />
          {errors.epsId && <small className="text-red-600">{errors.epsId.message}</small>}
        </div>
        <div>
          <Controller
            name="pensionFundId"
            control={control}
            render={({ field }) => (
              <Select
                label="Fondo de Pensiones"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                options={[ ...pf.map(p => ({ value: p.id, label: p.name }))]}
                disabled={loadingCats}
              />
            )}
          />
          {errors.pensionFundId && <small className="text-red-600">{errors.pensionFundId.message}</small>}
        </div>
      </div>

      <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-2 text-lg font-semibold">Preview de deducciones</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm text-gray-700">
          <div>Salario bruto: <b>{isNaN(s) ? '-' : s.toLocaleString()}</b></div>
          <div>EPS (empleado 4%): <b>{isNaN(empEps) ? '-' : empEps.toLocaleString()}</b></div>
          <div>Pensión (empleado 4%): <b>{isNaN(empPen) ? '-' : empPen.toLocaleString()}</b></div>
          <div>EPS (empleador 4%): <b>{isNaN(s) ? '-' : (s * 0.04).toLocaleString()}</b></div>
          <div>Pensión (empleador 4%): <b>{isNaN(s) ? '-' : (s * 0.04).toLocaleString()}</b></div>
          <div>Neto estimado: <b>{isNaN(net) ? '-' : net.toLocaleString()}</b></div>
        </div>
        <p className="mt-2 text-xs text-gray-500">Este preview es local; el cálculo oficial también está en el backend.</p>
      </div>


      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={submitting}>Guardar</Button>
      </div>
    </form>
  )
}
