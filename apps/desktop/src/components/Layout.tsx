import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'

export default function Layout() {
  
  return (
    <div style={{ display:'grid', gridTemplateRows:'auto 1fr', height:'100vh' }}>
      <NavBar />
      <main style={{ padding:16, overflow:'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
