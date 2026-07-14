import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'

export default function AppShell() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
