import { useForm, Controller } from 'react-hook-form'
import type { Role } from '../../lib/api'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'

type Form = { email: string; password?: string; role: Role }
type Props = {
  defaultValues?: Partial<Form>
  onSubmit: (values: Form) => Promise<void> | void
  onCancel: () => void
  submitting?: boolean
  isEdit?: boolean
}

export default function UserForm({ defaultValues, onSubmit, onCancel, submitting, isEdit }: Props) {
  const { register, handleSubmit, control,
    formState: { errors } } = useForm<Form>({
      defaultValues: { email: '', password: '', role: 'OPERATOR', ...defaultValues }
    })

  const roleOptions = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'OPERATOR', label: 'Operador' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <Input
          label="Email"
          type="email"
          {...register('email', { required: 'El email es obligatorio' })}
          name="email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div className="mb-4">
        <Input
          label="Contraseña"
          type="password"
          placeholder=""
          {...register('password', {
            required: 'La contraseña es obligatoria',
            minLength: {
              value: 8,
              message: 'La contraseña debe tener al menos 8 caracteres',
            },
          })}
          name="password"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">
            {errors.password.message as string}
          </p>
        )}
      </div>

      <div className="mb-2">
        <Controller
          control={control}
          name="role"
          rules={{ required: 'El rol es obligatorio' }}
          render={({ field }) => (
            <Select
              label="Rol"
              name={field.name}
              value={field.value}
              onChange={(value) => field.onChange(value)}
              options={roleOptions}
              required
            />
          )}
        />
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={submitting}>{isEdit ? 'Actualizar' : 'Crear'}</Button>
      </div>
    </form>
  )
}
