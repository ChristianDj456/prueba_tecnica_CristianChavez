import { type FormEvent, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { UserIcon, LockIcon, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('admin@local.test')
  const [password, setPassword] = useState('Admin123*')
  const [error, setError] = useState<string | null>(null)

  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await login(email, password);
      nav('/employees')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error de login')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-black py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600">Bienvenido</h1>
            <p className="text-white mt-1">Sistema de Gestión de Empleados</p>
          </div>
        </div>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            Iniciar Sesión
          </h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={onSubmit}>
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon size={18} className="text-gray-400" />
                </div>
                <Input
                  type="email"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon size={18} className="text-gray-400" />
                </div>
                <Input
                  type="password"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting} aria-busy={submitting}>
              {submitting ? (
                <span className="inline-flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ingresando…
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </div>
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Cristian Chavez. Todos los derechos
          reservados.
        </div>
      </div>
    </div>
  )
}
