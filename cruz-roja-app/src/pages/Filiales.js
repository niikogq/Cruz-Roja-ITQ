import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function Filiales() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ← NUEVO

  const fetchFiliales = () => {
    setLoading(true);
    fetch('http://localhost:3001/api/filialesTotals')
      .then(response => response.json())
      .then(data => {
        const numberedRows = data.map((item, index) => ({
          id: item._id.toString(),
          numero: index + 1,
          ...item,
        }));
        setRows(numberedRows);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error al cargar filiales:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFiliales();

    const handleRefresh = () => fetchFiliales();
    window.addEventListener('refreshFiliales', handleRefresh);

    return () => {
      window.removeEventListener('refreshFiliales', handleRefresh);
    };
  }, []);

  // ← NUEVO: Función para navegar a detalle
  const handleVerDetalles = (row) => {
    navigate(`/filial/${encodeURIComponent(row.Filial)}`);
  };

  // ← MODIFICADO: Agregada columna "acciones" al inicio del array columns
  const columns = [
    { field: 'numero', headerName: 'N°', width: 60 },
    { 
      field: 'acciones', 
      headerName: 'Detalles', 
      width: 90, 
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() => handleVerDetalles(params.row)}
          sx={{ 
            borderColor: '#9c1821',
            color: '#9c1821',
            minWidth: '40px',
            padding: '2px 6px',
            '&:hover': {
              backgroundColor: 'rgba(156, 24, 33, 0.04)'
            }
          }}
        >
          <VisibilityIcon fontSize="small" />
        </Button>
      )
    },
    { field: 'Filial', headerName: 'Filial', width: 130 },
    { field: 'Sede regional', headerName: 'Sede regional', width: 130 },
    { field: 'Voluntarios activos', headerName: 'Voluntarios activos', width: 130 },
    { field: 'Voluntarios de llamada', headerName: 'Voluntarios de llamada', width: 130 },
    { field: 'RUT', headerName: 'RUT', width: 130 },
    { field: 'Dirección', headerName: 'Dirección', width: 180 },
    { field: 'Teléfono contacto', headerName: 'Teléfono contacto', width: 130 },
    { field: 'Fecha ultima elecciones', headerName: 'Fecha última elecciones', width: 150 },
    { field: 'Instagram', headerName: 'Instagram', width: 130 },
    { field: 'Tiene al menos una red social?', headerName: '¿Red social?', width: 130 },
    { field: 'Persona dedicada a redes', headerName: 'Persona redes', width: 150 },
    { field: 'Cambiar uniforme ceremonial', headerName: 'Uniforme ceremonial', width: 150 },
    { field: 'Cambiar Color azul Chaquetas gestión del riesgo', headerName: 'Chaquetas gestión riesgo', width: 180 },
    { field: 'Voluntarios sin capacitación', headerName: 'Sin capacitación', width: 130 },
    { field: 'Voluntarios sin PPAA', headerName: 'Sin PPAA', width: 130 },
    { field: 'Voluntarios sin Doctrina', headerName: 'Sin Doctrina', width: 130 },
    { field: 'Voluntarios con título específico', headerName: 'Título específico', width: 150 },
    { field: 'Instructores de PPAA', headerName: 'Instructores PPAA', width: 130 },
    { field: 'Instructores doctrina', headerName: 'Instructores doctrina', width: 130 },
    { field: 'Club adulto mayor', headerName: 'Club adulto mayor', width: 130 },
    { field: 'Res. San. Policlinico', headerName: 'Res. San. Policlinico', width: 150 },
    { field: 'Acción migratoria', headerName: 'Acción migratoria', width: 130 },
    { field: 'Acción situación de calle', headerName: 'Acción situación de calle', width: 130 },
    { field: 'Filial con Antena y Radio Teleco', headerName: 'Antena y Radio Teleco', width: 150 },
    { field: 'Voluntarios con hoja de vida actualizada', headerName: 'Hoja de vida actualizada', width: 150 },
    { field: 'Voluntariado con credencial actualizada', headerName: 'Credencial actualizada', width: 150 },
    { field: 'Filial realiza charlas estatutos y reglamentos?', headerName: 'Charlas estatutos', width: 150 },
    { field: 'Acción cambio climático', headerName: 'Acción cambio climático', width: 130 },
    { field: 'Acciones PGI (protección, género, inclusión)', headerName: 'Acciones PGI', width: 150 },
    { field: 'Acción CEA (Rendición cuentas a la comunidad)', headerName: 'Acción CEA', width: 150 },
    { field: 'Kits alimentos entregados', headerName: 'Kits alimentos', width: 130 },
    { field: 'Kits higiene entregados', headerName: 'Kits higiene', width: 130 },
    { field: 'Kits abrigo entregados', headerName: 'Kits abrigo', width: 130 },
    { field: 'Voluntarios capacitados en AA', headerName: 'Capacitados en AA', width: 130 },
    { field: 'Voluntarios capacitados en SPAC', headerName: 'Capacitados en SPAC', width: 130 },
    { field: 'Voluntarios capacitados en SMAPS', headerName: 'Capacitados en SMAPS', width: 130 },
    { field: 'Voluntarios capacitados en RCF', headerName: 'Capacitados en RCF', width: 130 },
    { field: 'Voluntarios capacitados en Manejo Redes', headerName: 'Capacitados en Manejo Redes', width: 150 },
    { field: 'Voluntarios capacitados en Balances y EERR', headerName: 'Capacitados en Balances y EERR', width: 170 },
    { field: 'N° personas capacitados en primeros auxilios (comunidad)', headerName: 'Personas capacitados primeros auxilios', width: 170 },
    { field: 'Cantidad Personal rentado', headerName: 'Personal rentado', width: 130 },
    { field: 'Cantidad Unidades Educativas Colegios', headerName: 'Unidades Educativas', width: 150 },
    { field: 'Prioridad Sustentabilidad financiera', headerName: 'Sustentabilidad financiera', width: 170 },
    { field: 'Prioridad Manejo tecnologías', headerName: 'Manejo tecnologías', width: 150 },
    { field: 'Prioridad  políticas del voluntariado', headerName: 'Políticas voluntariado', width: 170 },
    { field: 'Prioridad Liderazgo y estatutos', headerName: 'Liderazgo y estatutos', width: 150 },
    { field: 'Prioridad Derecho internacional y cambio climático', headerName: 'Derecho internacional y cambio climático', width: 200 },
    { field: 'Preferencia capacitacion', headerName: 'Preferencia capacitación', width: 150 },
    { field: 'Relevancia 2024 Gestión del riesgo', headerName: 'Relevancia Gestión del riesgo', width: 170 },
    { field: 'Relevancia 2024 Salud', headerName: 'Relevancia Salud', width: 150 },
    { field: 'Relevancia 2024 Bienestar Social', headerName: 'Relevancia Bienestar Social', width: 170 },
    { field: 'Relevancia 2024 Juventud', headerName: 'Relevancia Juventud', width: 150 },
    { field: 'Financiamiento', headerName: 'Financiamiento', width: 120 },
    { field: 'Comentario otro financiamiento', headerName: 'Comentario otro financiamiento', width: 170 },
    { field: 'Encuesta confiable? (prioridades y relevancia', headerName: 'Encuesta confiable?', width: 170 },
  ];

  return (
    <div>
      <Box
        sx={{
          height: 490,
          width: '100%',
          maxWidth: 1000,
          background: '#fff',
          margin: 'auto',
          borderRadius: 2,
          boxShadow: 1,
          overflow: 'auto',
        }}
      >
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={15}
          rowsPerPageOptions={[15, 25, 50]}
          loading={loading}
          disableSelectionOnClick
          getRowId={(row) => row.id}
        />
      </Box>
    </div>
  );
}
