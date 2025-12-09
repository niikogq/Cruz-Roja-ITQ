import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { MainLayout } from './components/layout/MainLayout';

// Lazy loading de páginas para mejor performance
const Inicio = lazy(() => import('./pages/Inicio'));
const Voluntarios = lazy(() => import('./pages/Voluntarios'));
const Donaciones = lazy(() => import('./pages/Donaciones'));
const Emergencias = lazy(() => import('./pages/Emergencias'));
const Reportes = lazy(() => import('./pages/Reportes'));
const Filiales = lazy(() => import('./pages/Filiales'));
const FilialDetalle = lazy(() => import('./pages/FilialDetalle'));
const Sugerencias = lazy(() => import('./pages/Sugerencias'));
const ValidacionFormularios = lazy(() => import('./pages/validacionFormularios'));
const Login = lazy(() => import('./pages/Login'));

// Loading fallback component
const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="60vh"
  >
    <CircularProgress style={{ color: '#9c1821' }} />
  </Box>
);

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Ruta pública - Login SIN MainLayout */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas protegidas - CON MainLayout */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout><Inicio /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/voluntarios" element={
            <ProtectedRoute>
              <MainLayout><Voluntarios /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/donaciones" element={
            <ProtectedRoute>
              <MainLayout><Donaciones /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/emergencias" element={
            <ProtectedRoute>
              <MainLayout><Emergencias /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/reportes" element={
            <ProtectedRoute>
              <MainLayout><Reportes /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/filiales" element={
            <ProtectedRoute>
              <MainLayout><Filiales /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/filial/:nombre" element={
            <ProtectedRoute>
              <MainLayout><FilialDetalle /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/sugerencias" element={
            <ProtectedRoute>
              <MainLayout><Sugerencias /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/validacion-formularios" element={
            <ProtectedRoute>
              <MainLayout><ValidacionFormularios /></MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
