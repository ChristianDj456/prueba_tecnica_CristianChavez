import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOutIcon } from 'lucide-react'
export const Header = ({
  user,
}: {
  user?: {
    email: string
    role: string
  }
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const handleLogout = () => {

    navigate('/login')
  }
  
  if (location.pathname === '/login') return null
  return (
    <header className="bg-black text-white w-full">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="font-bold text-xl mr-8 text-red-600">
              4G Architecture
            </h1>
            <nav className="flex space-x-4">
              <Link
                to="/employees"
                className={`px-3 py-2 rounded-md ${location.pathname === '/employees' ? 'bg-red-700 text-white' : 'text-gray-300 hover:bg-red-800 hover:text-white'}`}
              >
                Empleados
              </Link>
              <Link
                to="/users"
                className={`px-3 py-2 rounded-md ${location.pathname === '/users' ? 'bg-red-700 text-white' : 'text-gray-300 hover:bg-red-800 hover:text-white'}`}
              >
                Usuarios
              </Link>
            </nav>
          </div>
          {user && (
            <div className="flex items-center">
              <span className="text-gray-300 mr-4">
                {user.email} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 border border-red-700 rounded-md text-red-700 hover:bg-red-700 hover:text-white transition-colors"
              >
                <LogOutIcon size={16} className="mr-2" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
