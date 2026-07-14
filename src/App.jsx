import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import AppShell from './components/layout/AppShell.jsx'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'
import RecuperarContrasena from './pages/RecuperarContrasena.jsx'
import RestablecerContrasena from './pages/RestablecerContrasena.jsx'
import Tablero from './pages/Tablero.jsx'
import Equipos from './pages/Equipos.jsx'
import Reportes from './pages/Reportes.jsx'
import NuevaActividad from './pages/NuevaActividad.jsx'
import DetalleActividad from './pages/DetalleActividad.jsx'
import EspaciosTrabajo from './pages/EspaciosTrabajo.jsx'
import EspacioDetalle from './pages/EspacioDetalle.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/inicio" element={<Tablero />} />
          <Route path="/equipos" element={<Equipos />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/actividad/nueva" element={<NuevaActividad />} />
          <Route path="/actividad/:id" element={<DetalleActividad />} />
          <Route path="/espacios" element={<EspaciosTrabajo />} />
          <Route path="/espacios/:id" element={<EspacioDetalle />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/inicio" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
