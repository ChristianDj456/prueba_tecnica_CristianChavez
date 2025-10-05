import { createBrowserRouter, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import EmployeesPage from './pages/EmployeesPage'
import { useAuth } from './context/AuthContext'
import UsersPage from './pages/UsersPage'
import type { JSX } from 'react'
import Layout from './components/Layout'

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'ADMIN' ? children : <Navigate to="/employees" replace />
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/employees" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <PrivateRoute><Layout /></PrivateRoute>,
    children: [
      { path: 'employees', element: <EmployeesPage /> },
      { path: 'users', element: <AdminRoute><UsersPage /></AdminRoute> },
    ],
  },
])
