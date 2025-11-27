import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { formatDate } from '../../utils/dateHelpers';
import { COLORS } from '../../utils/constants';

const DetailField = React.memo(({ label, value }) => (
  <Box>
    <Typography variant="subtitle2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1">
      {value || 'N/A'}
    </Typography>
  </Box>
));

DetailField.displayName = 'DetailField';

export const VoluntarioDetalleModal = React.memo(({ 
  open, 
  voluntario, 
  onClose 
}) => {
  if (!voluntario) return null;

  const fields = [
    { label: 'Nombre', value: voluntario['Nombres voluntario'] },
    { label: 'Apellido', value: voluntario['Apellidos voluntarios'] },
    { label: 'RUT', value: voluntario.RUT },
    { 
      label: 'Fecha de Nacimiento', 
      value: voluntario['Fecha nacimiento'] ? formatDate(voluntario['Fecha nacimiento']) : null
    },
    { label: 'Edad', value: voluntario.Edad },
    { label: 'Género', value: voluntario['Género'] },
    { label: 'Filial', value: voluntario.Filial },
    { 
      label: 'Fecha de Ingreso', 
      value: voluntario['Fecha de ingreso'] ? formatDate(voluntario['Fecha de ingreso']) : null
    },
    { label: 'Correo', value: voluntario.Correo },
    { label: 'Dirección', value: voluntario.Direccion },
    { label: 'Teléfono', value: voluntario.Telefono },
    { label: 'Cargo', value: voluntario.Cargo },
    { label: 'Edad de Ingreso', value: voluntario['Edad de ingreso a CRC'] },
    { label: 'Antigüedad', value: voluntario['Antigüedad'] }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: COLORS.primary, color: COLORS.white }}>
        Detalles del Voluntario
      </DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 2 
        }}>
          {fields.map((field, index) => (
            <DetailField 
              key={index} 
              label={field.label} 
              value={field.value} 
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          variant="contained" 
          sx={{ 
            bgcolor: COLORS.primary,
            '&:hover': { bgcolor: COLORS.primaryDark }
          }}
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
});

VoluntarioDetalleModal.displayName = 'VoluntarioDetalleModal';
