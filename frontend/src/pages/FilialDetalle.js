import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Box, Button, Grid, Typography, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Imports optimizados
import { voluntariosService } from '../services/voluntariosService';
import { EditableSelect } from '../components/common/EditableSelect';
import { StatsCard } from '../components/common/StatsCard';
import { formatDate } from '../utils/dateHelpers';
import { CALIDAD_OPTIONS, GENERO_OPTIONS, COLORS, CHART_COLORS } from '../utils/constants';

export default function FilialDetalle() {
  const { nombre } = useParams();
  const navigate = useNavigate();
  const [voluntarios, setVoluntarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingCalidadId, setUpdatingCalidadId] = useState(null);
  const [updatingGeneroId, setUpdatingGeneroId] = useState(null);

  // Calcular estadísticas con useMemo
  const estadisticas = useMemo(() => {
    const activos = voluntarios.filter(v => v["Calidad de voluntario"] === 'Activo').length;
    const llamada = voluntarios.filter(v => v["Calidad de voluntario"] === 'Llamada').length;
    const edades = voluntarios.filter(v => v.Edad).map(v => v.Edad);
    const promedioEdad = edades.length > 0
      ? Math.round(edades.reduce((a, b) => a + b, 0) / edades.length)
      : 0;

    const cargoCount = {};
    voluntarios.forEach(v => {
      const cargo = v.Cargo || 'Sin cargo';
      cargoCount[cargo] = (cargoCount[cargo] || 0) + 1;
    });

    const distribucionCargo = Object.entries(cargoCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      total: voluntarios.length,
      activos,
      llamada,
      promedioEdad,
      distribucionCargo
    };
  }, [voluntarios]);

  // Cargar datos
  useEffect(() => {
    const loadVoluntarios = async () => {
      try {
        const data = await voluntariosService.getAll();
        const volsFilial = data.filter(v => v.Filial === decodeURIComponent(nombre));
        setVoluntarios(volsFilial.map((v, idx) => ({ id: idx + 1, ...v })));
      } catch (error) {
        console.error('Error cargando voluntarios:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVoluntarios();
  }, [nombre]);

  // Handlers con useCallback
  const handleCalidadChange = useCallback(async (id, newValue) => {
    setUpdatingCalidadId(id);
    const row = voluntarios.find(r => r.id === id);
    
    try {
      await voluntariosService.updateCalidad(row._id, newValue);
      setVoluntarios(old =>
        old.map(r => r.id === id ? { ...r, "Calidad de voluntario": newValue } : r)
      );
      window.dispatchEvent(new Event('refreshFiliales'));
    } catch (error) {
      alert("Error al actualizar!");
    } finally {
      setUpdatingCalidadId(null);
    }
  }, [voluntarios]);

  const handleGeneroChange = useCallback(async (id, newValue) => {
    setUpdatingGeneroId(id);
    const row = voluntarios.find(r => r.id === id);
    
    try {
      await voluntariosService.updateGenero(row._id, newValue);
      setVoluntarios(old =>
        old.map(r => r.id === id ? { ...r, "Género": newValue } : r)
      );
      window.dispatchEvent(new Event('refreshFiliales'));
    } catch (error) {
      alert("Error al actualizar género!");
    } finally {
      setUpdatingGeneroId(null);
    }
  }, [voluntarios]);

  // Columnas con useMemo
  const columns = useMemo(() => [
    { field: 'id', headerName: 'ID', width: 60 },
    { field: 'Nombres voluntario', headerName: 'Nombre', width: 150 },
    { field: 'Apellidos voluntarios', headerName: 'Apellido', width: 150 },
    { field: 'RUT', headerName: 'RUT', width: 120 },
    { field: 'Cargo', headerName: 'Cargo', width: 140 },
    {
      field: 'Calidad de voluntario',
      headerName: 'Calidad',
      width: 130,
      renderCell: (params) => (
        <EditableSelect
          value={params.value}
          options={CALIDAD_OPTIONS}
          isUpdating={updatingCalidadId === params.id}
          onChange={(e) => handleCalidadChange(params.id, e.target.value)}
        />
      )
    },
    { field: 'Edad', headerName: 'Edad', width: 80 },
    {
      field: 'Género',
      headerName: 'Género',
      width: 100,
      renderCell: (params) => (
        <EditableSelect
          value={params.value}
          options={GENERO_OPTIONS}
          isUpdating={updatingGeneroId === params.id}
          onChange={(e) => handleGeneroChange(params.id, e.target.value)}
        />
      )
    },
    {
      field: 'fecha de ingreso',
      headerName: 'Fecha Ingreso',
      width: 130,
      renderCell: (params) => formatDate(params.value)
    },
    { field: 'Correo ', headerName: 'Correo', width: 180 },
    { field: 'Telefono', headerName: 'Teléfono', width: 120 },
  ], [updatingCalidadId, updatingGeneroId, handleCalidadChange, handleGeneroChange]);

  // Data de gráficos con useMemo
  const doughnutData = useMemo(() => ({
    labels: ['Activos', 'De Llamada'],
    datasets: [{
      data: [estadisticas.activos, estadisticas.llamada],
      backgroundColor: [CHART_COLORS.activos, CHART_COLORS.llamada],
      borderWidth: 3,
      borderColor: COLORS.white
    }]
  }), [estadisticas]);

  const barData = useMemo(() => ({
    labels: estadisticas.distribucionCargo?.map(c => c.name) || [],
    datasets: [{
      label: 'Cantidad de Voluntarios',
      data: estadisticas.distribucionCargo?.map(c => c.value) || [],
      backgroundColor: COLORS.primary
    }]
  }), [estadisticas]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress style={{ color: COLORS.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, margin: 1, marginTop: -4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/filiales')}
        sx={{
          mb: 1,
          color: COLORS.primary,
          fontWeight: 600,
          '&:hover': { backgroundColor: 'rgba(156, 24, 33, 0.04)' }
        }}
      >
        Volver a Filiales
      </Button>

      <Typography variant="h4" sx={{ mb: 4, color: COLORS.primary, fontWeight: 700 }}>
        Filial: {decodeURIComponent(nombre)}
      </Typography>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Voluntarios"
            value={estadisticas.total}
            gradient="linear-gradient(135deg, #9c1821 0%, #c54646 100%)"
            shadowColor="rgba(156, 24, 33, 0.3)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Voluntarios Activos"
            value={estadisticas.activos}
            gradient="linear-gradient(135deg, #38b000 0%, #4caf50 100%)"
            shadowColor="rgba(56, 176, 0, 0.3)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="De Llamada"
            value={estadisticas.llamada}
            gradient="linear-gradient(135deg, #f8c102 0%, #ffc107 100%)"
            shadowColor="rgba(248, 193, 2, 0.3)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Edad Promedio"
            value={estadisticas.promedioEdad}
            gradient="linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)"
            shadowColor="rgba(25, 118, 210, 0.3)"
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Box sx={{
            background: '#fff',
            p: 3,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: COLORS.primary, fontWeight: 600 }}>
              Distribución: Activos vs Llamada
            </Typography>
            <Box sx={{ height: 280, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut
                data={doughnutData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{
            background: '#fff',
            p: 3,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" sx={{ mb: 2, color: COLORS.primary, fontWeight: 600 }}>
              Cantidad voluntarios por cargo
            </Typography>
            <Box sx={{ height: 280 }}>
              <Bar
                data={barData}
                options={{
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 1 }
                    }
                  }
                }}
              />
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Tabla de voluntarios */}
      <Typography variant="h5" sx={{ mb: 2, color: COLORS.primary, fontWeight: 600 }}>
        Lista Completa de Voluntarios
      </Typography>
      <Box sx={{
        height: 500,
        background: '#fff',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        width: 1000
      }}>
        <DataGrid
          rows={voluntarios}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
        />
      </Box>
    </Box>
  );
}
