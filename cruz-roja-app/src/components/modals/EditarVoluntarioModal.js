import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Box
} from '@mui/material';
import { COLORS } from '../../utils/constants';
import { authFetch } from '../../utils/authFetch';

export const EditarVoluntarioModal = ({ 
  open, 
  onClose, 
  voluntarioId,
  voluntarioData,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  const [formData, setFormData] = useState({
    Telefono: '',
    Correo: '',
    Direccion: '',
    Filial: '',
    'Calidad de voluntario': '',
    Cargo: '',
    'Estado civil': '',
    'Nivel de escolaridad': '',
    'Contacto de emergencia': '',
    'Teléfono contacto emergencia': '',
    'Relación contacto emergencia': ''
  });

  // Actualizar formData cuando cambie voluntarioData
  React.useEffect(() => {
    if (voluntarioData) {
      setFormData({
        Telefono: voluntarioData.Telefono || '',
        Correo: voluntarioData.Correo || '',
        Direccion: voluntarioData.Direccion || '',
        Filial: voluntarioData.Filial || '',
        'Calidad de voluntario': voluntarioData['Calidad de voluntario'] || '',
        Cargo: voluntarioData.Cargo || '',
        'Estado civil': voluntarioData['Estado civil'] || '',
        'Nivel de escolaridad': voluntarioData['Nivel de escolaridad'] || '',
        'Contacto de emergencia': voluntarioData['Contacto de emergencia'] || '',
        'Teléfono contacto emergencia': voluntarioData['Teléfono contacto emergencia'] || '',
        'Relación contacto emergencia': voluntarioData['Relación contacto emergencia'] || ''
      });
    }
  }, [voluntarioData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Validar que Teléfono solo tenga números
    if (name === 'Telefono' || name === 'Teléfono contacto emergencia') {
      formattedValue = value.replace(/\D/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await authFetch(`/api/voluntarios/${voluntarioId}`, {
        method: 'PATCH',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: '✅ Información actualizada exitosamente',
          severity: 'success'
        });

        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        const error = await response.json();
        setSnackbar({
          open: true,
          message: error.error || 'Error al actualizar',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({
        open: true,
        message: 'Error actualizando información',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: COLORS.primary, color: '#fff', fontWeight: 700 }}>
        ✏️ Editar Información del Voluntario
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        
        {/* Datos de Contacto */}
        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
          📞 Datos de Contacto
        </Typography>

        <TextField
          fullWidth
          label="Teléfono"
          name="Telefono"
          value={formData.Telefono}
          onChange={handleChange}
          type="tel"
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Correo Electrónico"
          name="Correo"
          value={formData.Correo}
          onChange={handleChange}
          type="email"
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Dirección"
          name="Direccion"
          value={formData.Direccion}
          onChange={handleChange}
          sx={{ mb: 4 }}
        />

        {/* Datos Institucionales */}
        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
          🏥 Datos Institucionales
        </Typography>

        <TextField
          fullWidth
          label="Filial"
          name="Filial"
          value={formData.Filial}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Calidad de Voluntario</InputLabel>
          <Select
            name="Calidad de voluntario"
            value={formData['Calidad de voluntario']}
            onChange={handleChange}
            label="Calidad de Voluntario"
          >
            <MenuItem value="Activo">Activo</MenuItem>
            <MenuItem value="Llamada">De Llamada</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Cargo"
          name="Cargo"
          value={formData.Cargo}
          onChange={handleChange}
          sx={{ mb: 4 }}
        />

        {/* Otros Datos */}
        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
          📋 Otros Datos
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Estado Civil</InputLabel>
          <Select
            name="Estado civil"
            value={formData['Estado civil']}
            onChange={handleChange}
            label="Estado Civil"
          >
            <MenuItem value="Soltero/a">Soltero/a</MenuItem>
            <MenuItem value="Casado/a">Casado/a</MenuItem>
            <MenuItem value="Divorciado/a">Divorciado/a</MenuItem>
            <MenuItem value="Viudo/a">Viudo/a</MenuItem>
            <MenuItem value="Pareja de hecho">Pareja de hecho</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 4 }}>
          <InputLabel>Nivel de Escolaridad</InputLabel>
          <Select
            name="Nivel de escolaridad"
            value={formData['Nivel de escolaridad']}
            onChange={handleChange}
            label="Nivel de Escolaridad"
          >
            <MenuItem value="Básico">Básico</MenuItem>
            <MenuItem value="Medio">Medio</MenuItem>
            <MenuItem value="Técnico">Técnico</MenuItem>
            <MenuItem value="Profesional">Profesional</MenuItem>
            <MenuItem value="Postgrado">Postgrado</MenuItem>
          </Select>
        </FormControl>

        {/* Contacto de Emergencia */}
        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
          🆘 Contacto de Emergencia
        </Typography>

        <TextField
          fullWidth
          label="Nombre del Contacto"
          name="Contacto de emergencia"
          value={formData['Contacto de emergencia']}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Teléfono Contacto"
          name="Teléfono contacto emergencia"
          value={formData['Teléfono contacto emergencia']}
          onChange={handleChange}
          type="tel"
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Relación"
          name="Relación contacto emergencia"
          value={formData['Relación contacto emergencia']}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ backgroundColor: COLORS.primary }}
        >
          {loading ? <CircularProgress size={20} /> : 'Guardar Cambios'}
        </Button>
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};
