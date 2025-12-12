import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useTheme, useMediaQuery } from '@mui/material';
import { API_ENDPOINTS } from '../config/api';

const CALIDAD_OPTIONS = ["Activo", "Llamada"];
const GENERO_OPTIONS = ["F", "M", "Otro"];

function excelDateToJSDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = (utc_days + 1) * 86400;
  const date_info = new Date(utc_value * 1000);
  const fractional_day = serial - Math.floor(serial) + 0.0000001;
  let total_seconds = Math.floor(86400 * fractional_day);
  let seconds = total_seconds % 60;
  total_seconds -= seconds;
  let hours = Math.floor(total_seconds / (60 * 60));
  let minutes = Math.floor(total_seconds / 60) % 60;
  date_info.setHours(hours);
  date_info.setMinutes(minutes);
  date_info.setSeconds(seconds);
  return date_info;
}

export default function Voluntarios() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [updatingGeneroId, setUpdatingGeneroId] = useState(null);
  const [selectedVoluntario, setSelectedVoluntario] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [updatingEdades, setUpdatingEdades] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetch(API_ENDPOINTS.voluntarios)
      .then(response => response.json())
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          setRows([{ id: 1 }]);
        } else {
          setRows(data.map((v, idx) => ({ id: idx + 1, ...v })));
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error al cargar voluntarios:', error);
        setRows([{ id: 1 }]);
        setLoading(false);
      });
  }, []);

  // Actualizar edades masivamente
  const handleActualizarEdades = async () => {
    setUpdatingEdades(true);
    setSnackbar({ open: false, message: '', severity: 'info' });
    try {
      const response = await fetch('/api/actualizarEdades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();

      setSnackbar({
        open: true,
        message: result.mensaje || 'Actualización completada',
        severity: response.ok ? 'success' : 'error'
      });

      if (response.ok) {
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({
        open: true,
        message: 'Error al actualizar edades. Verifica que el backend esté corriendo.',
        severity: 'error'
      });
    } finally {
      setUpdatingEdades(false);
    }
  };

  const handleCalidadChange = (id, newValue) => {
    setUpdatingId(id);
    const row = rows.find(r => r.id === id);
    fetch(`/api/voluntarios/${row._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "Calidad de voluntario": newValue })
    })
      .then(response => {
        if (response.ok) {
          setRows(old =>
            old.map(r =>
              r.id === id
                ? { ...r, "Calidad de voluntario": newValue }
                : r
            )
          );
          window.dispatchEvent(new Event('refreshFiliales'));
        } else {
          alert("Error al actualizar!");
        }
        setUpdatingId(null);
      })
      .catch(() => {
        alert("Error al actualizar!");
        setUpdatingId(null);
      });
  };

  const handleGeneroChange = (id, newValue) => {
    setUpdatingGeneroId(id);
    const row = rows.find(r => r.id === id);
    fetch(`/api/voluntarios/${row._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ "Género": newValue })
    })
      .then(response => {
        if (response.ok) {
          setRows(old =>
            old.map(r =>
              r.id === id
                ? { ...r, "Género": newValue }
                : r
            )
          );
          window.dispatchEvent(new Event('refreshFiliales'));
        } else {
          alert("Error al actualizar género!");
        }
        setUpdatingGeneroId(null);
      })
      .catch(() => {
        alert("Error al actualizar género!");
        setUpdatingGeneroId(null);
      });
  };

  const handleOpenModal = (voluntario) => {
    setSelectedVoluntario(voluntario);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedVoluntario(null);
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 52 },
    {
      field: 'acciones',
      headerName: '',
      width: 60,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() => handleOpenModal(params.row)}
          sx={{
            borderColor: '#9c1821',
            color: '#9c1821',
            minWidth: '40px',
            padding: '4px',
            '&:hover': {
              borderColor: '#7a1419',
              backgroundColor: 'rgba(156, 24, 33, 0.04)'
            }
          }}
        >
          <VisibilityIcon fontSize="small" />
        </Button>
      )
    },
    { field: 'Filial', headerName: 'Filial', width: 120 },
    {
      field: 'Calidad de voluntario',
      headerName: 'Calidad de voluntario',
      width: 180,
      renderCell: (params) => {
        const { id, value } = params;
        if (updatingId === id) return <CircularProgress size={20} />;
        return (
          <Select
            value={value}
            onChange={e => handleCalidadChange(id, e.target.value)}
            size="small"
            sx={{ minWidth: 120 }}
          >
            {CALIDAD_OPTIONS.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        );
      }
    },
    { field: 'Nombres voluntario', headerName: 'Nombres voluntario', width: 150 },
    { field: 'Apellidos voluntarios', headerName: 'Apellidos voluntarios', width: 170 },
    { field: 'RUT', headerName: 'RUT', width: 130 },
    {
      field: 'Fecha de ingreso',
      headerName: 'Fecha de ingreso',
      width: 150,
      renderCell: (params) => {
        if (!params.value) return '';
        const date = excelDateToJSDate(params.value);
        return date.toLocaleDateString('es-CL');
      }
    },
    {
      field: 'Fecha nacimiento',
      headerName: 'Fecha nacimiento',
      width: 150,
      renderCell: (params) => {
        if (!params.value) return '';
        const date = excelDateToJSDate(params.value);
        return date.toLocaleDateString('es-CL');
      }
    },
    { field: 'Correo', headerName: 'Correo', width: 180 },
    { field: 'Direccion', headerName: 'Dirección', width: 180 },
    { field: 'Telefono', headerName: 'Teléfono', width: 130 },
    { field: 'Cargo', headerName: 'Cargo', width: 120 },
    { field: 'Edad', headerName: 'Edad', width: 90 },
    {
      field: 'Edad de ingreso a CRC',
      headerName: 'Edad ingreso CRC',
      width: 160,
      renderCell: (params) => {
        const edadIngreso = params.value;
        return edadIngreso ? Math.round(edadIngreso).toString() : 'N/A';
      }
    },
    { field: 'Antigüedad', headerName: 'Antigüedad', width: 120 },
    {
      field: 'Género',
      headerName: 'Género',
      width: 100,
      renderCell: (params) => {
        const { id, value } = params;
        if (updatingGeneroId === id) return <CircularProgress size={20} />;
        return (
          <Select
            value={value || ""}
            onChange={e => handleGeneroChange(id, e.target.value)}
            size="small"
            sx={{ minWidth: 70 }}
          >
            {GENERO_OPTIONS.map(option => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        );
      }
    },
    { field: 'Instructores de PPAA Básico', headerName: 'PPAA Básico', width: 140 },
    { field: 'Instructores de PPAA Avanzado', headerName: 'PPAA Avanzado', width: 150 },
    { field: 'Instructores doctrina', headerName: 'Instructores doctrina', width: 140 },
  ];

  // Filtrar columnas para movil
  const displayedColumns = isMobile ? columns.filter(col => ['id', 'Filial', 'Calidad de voluntario', 'Nombres voluntario', 'RUT'].includes(col.field)) : columns;

  return (
    <div>
      {/* NUEVO: BOTÓN ACTUALIZAR EDADES */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', pr: 2 }}>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={handleActualizarEdades}
          disabled={updatingEdades}
          sx={{
            backgroundColor: '#9c1821',
            '&:hover': { backgroundColor: '#7a1419' },
            boxShadow: '0 4px 12px rgba(156, 24, 33, 0.3)'
          }}
          size="small"
        >
          {updatingEdades ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              Actualizando...
            </>
          ) : (
            'Actualizar Edades y Antigüedad'
          )}
        </Button>
      </Box>

      {/* DataGrid responsive */}
      <Box
        sx={{
          height: { xs: 600, sm: 550, md: 490 },
          width: '100%',
          maxWidth: { xs: '100%', sm: 1000 },
          margin: 'auto',
          background: '#fff',
          borderRadius: 2,
          boxShadow: 1,
          overflowX: 'auto',
          p: { xs: 1, sm: 2 },
        }}
      >
        <DataGrid
          rows={rows}
          columns={displayedColumns}
          pageSize={isMobile ? 10 : 15}
          rowsPerPageOptions={isMobile ? [10, 15] : [15, 25, 50]}
          loadingOverlayVisibility={loading}
          disableSelectionOnClick
          getRowId={(row) => row.id}
          suppressCellFocus={true}
        />
      </Box>

      {/* Snackbar para feedback */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Modal de detalles del voluntario */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#9c1821', color: '#fff' }}>
          Detalles del Voluntario
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedVoluntario && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nombre
                  </Typography>
                  <Typography variant="body1">
                    {selectedVoluntario['Nombres voluntario'] || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Apellido
                  </Typography>
                  <Typography variant="body1">
                    {selectedVoluntario['Apellidos voluntarios'] || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    RUT
                  </Typography>
                  <Typography variant="body1">
                    {selectedVoluntario.RUT || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha de Nacimiento
                  </Typography>
                  <Typography variant="body1">
                    {selectedVoluntario['Fecha nacimiento']
                      ? excelDateToJSDate(selectedVoluntario['Fecha nacimiento']).toLocaleDateString('es-CL')
                      : 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Edad
                  </Typography>
                  <Typography variant="body1">
                    {selectedVoluntario.Edad || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Género
                  </Typography>
                  <Typography variant="body1">
                    {selectedVoluntario['Género'] || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Filial
                  </Typography>
                  <Typography variant="body1">
                    {selectedVoluntario.Filial || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha de Ingreso
                  </Typography>
                  <Typography variant="body1">
                    {selectedVoluntario['Fecha de ingreso']
                      ? excelDateToJSDate(selectedVoluntario['Fecha de ingreso']).toLocaleDateString('es-CL')
                      : 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Correo
                  </Typography>
                  <Typography variant="body1">
                    {selectedVoluntario['Correo'] || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Dirección
                  </Typography>
                  <Typography variant="body1">
                    {selectedVoluntario.Direccion || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Teléfono
                  </Typography>
                  <Typography variant="body1">
                    {selectedVoluntario.Telefono || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cargo
                  </Typography>
                  <Typography variant="body1">
                    {selectedVoluntario.Cargo || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Edad de Ingreso
                  </Typography>
                  <Typography variant="body1">
                    {selectedVoluntario['Edad de ingreso a CRC'] || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Antigüedad
                  </Typography>
                  <Typography variant="body1">
                    {selectedVoluntario['Antigüedad'] || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseModal} 
            variant="contained" 
            sx={{ 
              bgcolor: '#9c1821',
              '&:hover': {
                bgcolor: '#7a1419'
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
