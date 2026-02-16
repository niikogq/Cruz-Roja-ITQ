import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Select, MenuItem, FormControl, InputLabel, Card, CardContent, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../utils/authFetch';
import { COLORS } from '../utils/constants';

export default function VoluntariosNuevo() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [filiales, setFiliales] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const [formData, setFormData] = useState({
    RUT: '',
    'Apellidos voluntarios': '',
    'Nombres voluntario': '',
    'Grupo sanguíneo': '',
    'Fecha nacimiento': '',
    Nacionalidad: '',
    'Estado civil': '',
    Género: '',
    Telefono: '',
    Direccion: '',
    Correo: '',
    'Nivel de escolaridad': '',
    Filial: '',
    'Calidad de voluntario': 'Activo',
    Cargo: 'Voluntario',
    'Contacto de emergencia': '',
    'Teléfono contacto emergencia': '',
    'Relación contacto emergencia': ''
  });

  useEffect(() => {
    const cargarFiliales = async () => {
      try {
        const response = await authFetch('/api/filialesTotals');
        const data = await response.json();
        const filialesUnicas = [...new Set(data.map(f => f.Filial))].sort();
        setFiliales(filialesUnicas);
      } catch (error) {
        console.error('Error cargando filiales:', error);
        setSnackbar({
          open: true,
          message: 'Error al cargar las filiales',
          severity: 'error'
        });
      }
    };
    cargarFiliales();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatear RUT automáticamente
    if (name === 'RUT') {
      formattedValue = formatearRUT(value);
    }
    
    // Validar que Teléfono solo tenga números
    if (name === 'Telefono' || name === 'Teléfono contacto emergencia') {
      formattedValue = value.replace(/\D/g, ''); // Remover todo lo que no sea número
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  // Función para formatear RUT chileno
  const formatearRUT = (rut) => {
    if (!rut) return '';
    
    // Limpiar: remover puntos, guiones y espacios
    let rutLimpio = rut.replace(/[\.\-\s]/g, '').toUpperCase();
    
    // Validar que solo tenga números y la K al final
    if (!/^[0-9]+[0-9K]?$/.test(rutLimpio)) {
      return formData.RUT;
    }

    // Separar número y dígito verificador
    let numero = rutLimpio.slice(0, -1);
    let digito = rutLimpio.slice(-1);

    // Formatear número con puntos
    let partes = [];
    let contador = 0;

    for (let i = numero.length - 1; i >= 0; i--) {
      if (contador === 3) {
        partes.unshift('.');
        contador = 0;
      }
      partes.unshift(numero[i]);
      contador++;
    }

    let numeroFormateado = partes.join('');
    return `${numeroFormateado}-${digito}`;
  };

  const validarRUT = (rut) => {
    const rutLimpio = rut.replace(/[\.\-\s]/g, '');
    return rutLimpio.length >= 7 && rutLimpio.length <= 9;
  };

  const validarFormulario = () => {
    if (!formData.RUT) {
      setSnackbar({ open: true, message: 'El RUT es requerido', severity: 'error' });
      return false;
    }
    if (!validarRUT(formData.RUT)) {
      setSnackbar({ open: true, message: 'RUT inválido', severity: 'error' });
      return false;
    }
    if (!formData['Nombres voluntario']) {
      setSnackbar({ open: true, message: 'Los nombres son requeridos', severity: 'error' });
      return false;
    }
    if (!formData['Apellidos voluntarios']) {
      setSnackbar({ open: true, message: 'Los apellidos son requeridos', severity: 'error' });
      return false;
    }
    if (!formData['Fecha nacimiento']) {
      setSnackbar({ open: true, message: 'La fecha de nacimiento es requerida', severity: 'error' });
      return false;
    }
    if (!formData.Género) {
      setSnackbar({ open: true, message: 'El género es requerido', severity: 'error' });
      return false;
    }
    if (!formData.Telefono) {
      setSnackbar({ open: true, message: 'El teléfono es requerido', severity: 'error' });
      return false;
    }
    if (!formData.Correo) {
      setSnackbar({ open: true, message: 'El correo electrónico es requerido', severity: 'error' });
      return false;
    }
    if (!formData['Contacto de emergencia']) {
      setSnackbar({ open: true, message: 'El nombre del contacto de emergencia es requerido', severity: 'error' });
      return false;
    }
    if (!formData['Teléfono contacto emergencia']) {
      setSnackbar({ open: true, message: 'El teléfono del contacto de emergencia es requerido', severity: 'error' });
      return false;
    }
    if (!formData['Relación contacto emergencia']) {
      setSnackbar({ open: true, message: 'La relación del contacto de emergencia es requerida', severity: 'error' });
      return false;
    }
    if (!formData.Filial) {
      setSnackbar({ open: true, message: 'Debe seleccionar una filial', severity: 'error' });
      return false;
    }
    return true;
  };

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    setLoading(true);

    try {
      const response = await authFetch('/api/voluntarios/crear', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: '✅ Voluntario creado exitosamente',
          severity: 'success'
        });

        setTimeout(() => {
          navigate('/voluntarios');
        }, 1500);
      } else {
        setSnackbar({
          open: true,
          message: data.error || 'Error al crear voluntario',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({
        open: true,
        message: 'Error al crear voluntario',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', p: 2 }}>
      {/* Encabezado */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/voluntarios')}
          sx={{ color: COLORS.primary }}
        >
          Volver
        </Button>
        <Typography variant="h4" sx={{ color: COLORS.primary, fontWeight: 700 }}>
          Registrar Nuevo Voluntario
        </Typography>
      </Box>

      {/* Formulario */}
      <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {/* Sección 1: Datos Personales */}
            <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
              📋 Datos Personales
            </Typography>

            <TextField
              fullWidth
              label="RUT"
              name="RUT"
              value={formData.RUT}
              onChange={handleChange}
              placeholder="12.345.678-9"
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Nombres"
              name="Nombres voluntario"
              value={formData['Nombres voluntario']}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Apellidos"
              name="Apellidos voluntarios"
              value={formData['Apellidos voluntarios']}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Fecha de Nacimiento"
              name="Fecha nacimiento"
              type="date"
              value={formData['Fecha nacimiento']}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Género</InputLabel>
              <Select
                name="Género"
                value={formData.Género}
                onChange={handleChange}
                label="Género"
                required
              >
                <MenuItem value="M">Masculino</MenuItem>
                <MenuItem value="F">Femenino</MenuItem>
                <MenuItem value="Otro">Otro</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Grupo Sanguíneo</InputLabel>
              <Select
                name="Grupo sanguíneo"
                value={formData['Grupo sanguíneo']}
                onChange={handleChange}
                label="Grupo Sanguíneo"
              >
                <MenuItem value="A+">A+</MenuItem>
                <MenuItem value="A-">A-</MenuItem>
                <MenuItem value="B+">B+</MenuItem>
                <MenuItem value="B-">B-</MenuItem>
                <MenuItem value="AB+">AB+</MenuItem>
                <MenuItem value="AB-">AB-</MenuItem>
                <MenuItem value="O+">O+</MenuItem>
                <MenuItem value="O-">O-</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Nacionalidad</InputLabel>
              <Select
                name="Nacionalidad"
                value={formData.Nacionalidad}
                onChange={handleChange}
                label="Nacionalidad"
              >
                <MenuItem value="Chilena">Chilena</MenuItem>
                <MenuItem value="Extranjera">Extranjera</MenuItem>
              </Select>
            </FormControl>

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

            <TextField
              fullWidth
              label="Teléfono"
              name="Telefono"
              value={formData.Telefono}
              onChange={handleChange}
              type="tel"
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Correo Electrónico"
              name="Correo"
              value={formData.Correo}
              onChange={handleChange}
              type="email"
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Dirección Particular"
              name="Direccion"
              value={formData.Direccion}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />

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

            {/* Sección 2: Contacto de Emergencia */}
            <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
              🆘 Contacto de Emergencia
            </Typography>

            <TextField
              fullWidth
              label="Nombre del Contacto"
              name="Contacto de emergencia"
              value={formData['Contacto de emergencia']}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Teléfono Contacto"
              name="Teléfono contacto emergencia"
              value={formData['Teléfono contacto emergencia']}
              onChange={handleChange}
              type="tel"
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Relación (Ej: Hermano, Madre, Amigo)"
              name="Relación contacto emergencia"
              value={formData['Relación contacto emergencia']}
              onChange={handleChange}
              required
              sx={{ mb: 4 }}
            />

            {/* Sección 3: Datos de la Cruz Roja */}
            <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
              🏥 Datos de la Cruz Roja
            </Typography>

            <FormControl fullWidth required sx={{ mb: 2 }}>
              <InputLabel>Filial</InputLabel>
              <Select
                name="Filial"
                value={formData.Filial}
                onChange={handleChange}
                label="Filial"
              >
                {filiales.map(filial => (
                  <MenuItem key={filial} value={filial}>
                    {filial}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 4 }}>
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

            {/* Botones */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/voluntarios')}
                sx={{ color: COLORS.primary, borderColor: COLORS.primary }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
                sx={{
                  backgroundColor: COLORS.primary,
                  '&:hover': { backgroundColor: COLORS.primaryDark }
                }}
              >
                {loading ? 'Guardando...' : 'Guardar Voluntario'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
      {/* Snackbar para mensajes */}
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
    </Box>
  );
}