import { useMemo } from 'react';
import { Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { EditableSelect } from '../components/common/EditableSelect';
import { formatDate } from '../utils/dateHelpers';
import { CALIDAD_OPTIONS, GENERO_OPTIONS, COLORS } from '../utils/constants';

export function useVoluntariosColumns({
  onVerDetalles,
  onCalidadChange,
  onGeneroChange,
  updatingCalidadId,
  updatingGeneroId,
  showAcciones = true
}) {
  return useMemo(() => {
    const columns = [
      { field: 'id', headerName: 'ID', width: 52 }
    ];

    if (showAcciones) {
      columns.push({
        field: 'acciones',
        headerName: '',
        width: 60,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Button
            size="small"
            onClick={() => onVerDetalles(params.row)}
            sx={{
              borderColor: COLORS.primary,
              color: COLORS.primary,
              minWidth: '40px',
              padding: '4px',
              '&:hover': {
                borderColor: COLORS.primaryDark,
                backgroundColor: 'rgba(156, 24, 33, 0.04)'
              }
            }}
          >
            <VisibilityIcon fontSize="small" />
          </Button>
        )
      });
    }

    return [
      ...columns,
      { field: 'Filial', headerName: 'Filial', width: 120 },
      {
        field: 'Calidad de voluntario',
        headerName: 'Calidad de voluntario',
        width: 180,
        renderCell: (params) => (
          <EditableSelect
            value={params.value}
            options={CALIDAD_OPTIONS}
            isUpdating={updatingCalidadId === params.id}
            onChange={(e) => onCalidadChange(params.id, e.target.value)}
          />
        )
      },
      { field: 'Nombres voluntario', headerName: 'Nombres voluntario', width: 150 },
      { field: 'Apellidos voluntarios', headerName: 'Apellidos voluntarios', width: 170 },
      { field: 'RUT', headerName: 'RUT', width: 130 },
      {
        field: 'Fecha de ingreso',
        headerName: 'Fecha de ingreso',
        width: 150,
        renderCell: (params) => formatDate(params.value)
      },
      {
        field: 'Fecha nacimiento',
        headerName: 'Fecha nacimiento',
        width: 150,
        renderCell: (params) => formatDate(params.value)
      },
      { field: 'Correo', headerName: 'Correo', width: 180 },
      { field: 'Direccion', headerName: 'Dirección', width: 180 },
      { field: 'Telefono', headerName: 'Teléfono', width: 130 },
      { field: 'Cargo', headerName: 'Cargo', width: 120 },
      { field: 'Edad', headerName: 'Edad', width: 90 },
      { field: 'Edad de ingreso a CRC', headerName: 'Edad ingreso CRC', width: 160 },
      { field: 'Antigüedad', headerName: 'Antigüedad', width: 120 },
      {
        field: 'Género',
        headerName: 'Género',
        width: 100,
        renderCell: (params) => (
          <EditableSelect
            value={params.value}
            options={GENERO_OPTIONS}
            isUpdating={updatingGeneroId === params.id}
            onChange={(e) => onGeneroChange(params.id, e.target.value)}
          />
        )
      },
      { field: 'Instructores de PPAA Básico', headerName: 'PPAA Básico', width: 140 },
      { field: 'Instructores de PPAA Avanzado', headerName: 'PPAA Avanzado', width: 150 },
      { field: 'Instructores doctrina', headerName: 'Instructores doctrina', width: 140 }
    ];
  }, [
    onVerDetalles,
    onCalidadChange,
    onGeneroChange,
    updatingCalidadId,
    updatingGeneroId,
    showAcciones
  ]);
}
