import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <MainLayout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/voluntarios" element={<Voluntarios />} />
            <Route path="/donaciones" element={<Donaciones />} />
            <Route path="/emergencias" element={<Emergencias />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/filiales" element={<Filiales />} />
            <Route path="/filial/:nombre" element={<FilialDetalle />} />
            <Route path="/sugerencias" element={<Sugerencias />} />
          </Routes>
        </Suspense>
      </MainLayout>
    </Router>
  );
}

export default App;
