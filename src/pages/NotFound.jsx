import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-center px-4">
      <p className="text-lavender text-sm font-semibold mb-2">404</p>
      <h1 className="text-xl font-semibold mb-2">Página no encontrada</h1>
      <p className="text-text-secondary text-sm mb-6">La ruta que buscas no existe.</p>
      <Link to="/inicio" className="text-sm text-lavender font-medium hover:underline">
        Volver al tablero
      </Link>
    </div>
  )
}
