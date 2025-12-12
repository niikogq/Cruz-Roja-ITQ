import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import { API_ENDPOINTS } from '../config/api';  // ← NUEVO

export default function ValidacionFormularios() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_ENDPOINTS.filialesTotals.replace('/filialesTotals', '/validacionFormularios')}`)
      .then(res => res.json())
      .then(data => {
        const mappedRows = data.map((item, idx) => ({
          id: idx + 1,
          numero: item.__EMPTY_1 || '',
          sedeRegional: item['Sede Regional'] || '',
          presidente: item.Presidente || '',
          fonoSede: item['Fono Sede'] || '',
          fonoCelular: item['Fono Celular'] || '',
          correoElectronico: item['Correo electrónico'] || '',
        }));
        setRows(mappedRows);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando validación formularios:', err);
        setLoading(false);
      });
  }, []);


  const columns = [
    { field: 'numero', headerName: 'N°', width: 80 },
    { field: 'sedeRegional', headerName: 'Sede Regional', width: 200 },
    { field: 'presidente', headerName: 'Presidente', width: 200 },
    { field: 'fonoSede', headerName: 'Teléfono Sede', width: 150 },
    { field: 'fonoCelular', headerName: 'Teléfono Celular', width: 150 },
    { field: 'correoElectronico', headerName: 'Correo electrónico', width: 250 },
  ];

  return (
    <Box sx={{ height: 480, width: '100%', maxWidth: 1100, margin: 'auto'}}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pageSize={10}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </Box>
  );
}
