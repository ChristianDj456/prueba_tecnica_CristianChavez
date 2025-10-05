import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { user, logout } = useAuth()
  const loc = useLocation()

  const Tab = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <Link
      to={to}
      className={[
        'px-3 py-2 rounded-md transition-colors',
        loc.pathname.startsWith(to)
          ? 'bg-red-700 text-white'
          : 'text-gray-300 hover:bg-red-800 hover:text-white',
        'ml-4'
      ].join(' ')}
    >
      {children}
    </Link>
  )

  return (
    <header className="bg-black text-white w-full flex items-center h-16 px-4">

      <strong className="font-bold text-xl mr-8 text-red-600">
        CRUD Empleados
      </strong>

      <Tab to="/employees">Empleados</Tab>
      {user?.role === 'ADMIN' && <Tab to="/users">Usuarios</Tab>}

      <div className="ml-auto flex items-center gap-3">
        <span className="text-gray-300">
          {user?.email} ({user?.role})
        </span>
        <button
          onClick={logout}
          className="inline-flex items-center px-3 py-2 border border-red-700 rounded-md text-red-700 hover:bg-red-700 hover:text-white transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
