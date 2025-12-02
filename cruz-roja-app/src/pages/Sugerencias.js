import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Box from '@mui/material/Box';
import { jsPDF } from 'jspdf';


const columns = [
  { field: 'Filial', headerName: 'Filial', width: 200 },
  { 
    field: 'Comentarios',
    headerName: 'Comentarios', 
    width: 800, 
    flex: 1,
    editable: true,
    renderCell: (params) => (
      <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: '1.5' }}>
        {params.value || ''}
      </div>
    )
  },
];

export default function Sugerencias() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/filiales')
      .then(res => res.json())
      .then(data => {
        setRows(data.map((v, idx) => ({ 
          id: v._id.toString(),
          _id: v._id,
          ...v,
          Comentarios: v.Comentarios || ''
        })));
        setLoading(false);
      })
      .catch(error => {
        console.error('Error al cargar filiales:', error);
        setLoading(false);
      });
  }, []);

  const processRowUpdate = async (newRow) => {
    console.log('Guardando comentario para ID:', newRow.id);
    
    const response = await fetch(`http://localhost:3001/api/filiales/${newRow.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Comentarios: newRow.Comentarios })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error del servidor:', errorData);
      throw new Error('Error al actualizar comentario');
    }

    console.log('✅ Comentario guardado exitosamente');
    return newRow;
  };

  const handleProcessRowUpdateError = (error) => {
    console.error('Error al actualizar:', error);
    alert('Error al guardar el comentario. Revisa la consola para más detalles.');
  };

  const generarPDF = () => {
    const doc = new jsPDF();
    
    // Fecha actual
    const fecha = new Date();
    const fechaFormateada = fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const horaFormateada = fecha.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(156, 24, 33);
    doc.text('Cruz Roja Chilena', 105, 15, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Informe de Sugerencias por Filial', 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha de generación: ${fechaFormateada} - ${horaFormateada}`, 105, 32, { align: 'center' });

    // Filtrar filiales con comentarios
    const filialesConComentarios = rows.filter(row => row.Comentarios && row.Comentarios.trim() !== '');

    if (filialesConComentarios.length === 0) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text('No hay comentarios registrados.', 105, 50, { align: 'center' });
    } else {
      // Configuración de la tabla
      const startY = 45;
      const rowHeight = 10;
      const colFilialWidth = 40;
      const colComentarioWidth = 140;
      const startX = 15;
      let currentY = startY;

      // Dibujar encabezado de la tabla
      doc.setFillColor(156, 24, 33); // Color rojo Cruz Roja
      doc.rect(startX, currentY, colFilialWidth, rowHeight, 'F');
      doc.rect(startX + colFilialWidth, currentY, colComentarioWidth, rowHeight, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Filial', startX + 2, currentY + 7);
      doc.text('Comentarios', startX + colFilialWidth + 2, currentY + 7);
      
      currentY += rowHeight;

      // Dibujar filas de datos
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      filialesConComentarios.forEach((row, index) => {
        const filial = row.Filial || 'Sin nombre';
        const comentario = row.Comentarios || 'Sin comentario';
        
        // Dividir comentario en múltiples líneas si es muy largo
        const comentarioLineas = doc.splitTextToSize(comentario, colComentarioWidth - 4);
        const cellHeight = Math.max(rowHeight, comentarioLineas.length * 5 + 4);

        // Verificar si necesita nueva página
        if (currentY + cellHeight > 280) {
          doc.addPage();
          currentY = 20;
          
          // Redibujar encabezado en nueva página
          doc.setFillColor(156, 24, 33);
          doc.rect(startX, currentY, colFilialWidth, rowHeight, 'F');
          doc.rect(startX + colFilialWidth, currentY, colComentarioWidth, rowHeight, 'F');
          
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text('Filial', startX + 2, currentY + 7);
          doc.text('Comentarios', startX + colFilialWidth + 2, currentY + 7);
          
          currentY += rowHeight;
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
        }

        // Color de fondo alternado para filas
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(startX, currentY, colFilialWidth + colComentarioWidth, cellHeight, 'F');
        }

        // Dibujar bordes de celda
        doc.setDrawColor(200, 200, 200);
        doc.rect(startX, currentY, colFilialWidth, cellHeight);
        doc.rect(startX + colFilialWidth, currentY, colComentarioWidth, cellHeight);

        // Texto de filial
        doc.setFont('helvetica', 'bold');
        const filialLineas = doc.splitTextToSize(filial, colFilialWidth - 4);
        doc.text(filialLineas, startX + 2, currentY + 5);

        // Texto de comentario
        doc.setFont('helvetica', 'normal');
        doc.text(comentarioLineas, startX + colFilialWidth + 2, currentY + 5);

        currentY += cellHeight;
      });

      // Pie de página con número de páginas
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }
    }

    doc.save(`Informe_Sugerencias_${fechaFormateada.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div style={{ width: '90%', margin: 'auto', background: '#f8f9fa', padding: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} mt={0}>
        <h2 style={{ marginBottom: 18, color: '#9c1821' }}>Sugerencias por Filial</h2>
        <Button
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          onClick={generarPDF}
          sx={{ 
            bgcolor: '#9c1821',
            '&:hover': { bgcolor: '#7a1419' }
          }}
        >
          Generar Informe PDF
        </Button>
      </Box>
      <div style={{ height: 400, overflowY: 'auto' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={12}
          loading={loading}
          disableSelectionOnClick
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          experimentalFeatures={{ newEditingApi: true }}
          sx={{
            background: '##f8f9fa',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#c54646',
              color: '#000000ff',
              fontWeight: 'bold',
            },
          }}
          style={{ height: '100%' }}
        />
      </div>
    </div>
  );
}
