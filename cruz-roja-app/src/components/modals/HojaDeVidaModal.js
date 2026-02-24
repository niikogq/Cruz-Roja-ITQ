import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import { COLORS } from '../../utils/constants';
import { authFetch } from '../../utils/authFetch';

export const HojaDeVidaModal = ({ 
  open, 
  onClose, 
  voluntarioId,
  voluntarioData 
}) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [tabValue, setTabValue] = useState(0);
  
  const [formData, setFormData] = useState({
    fotoId: '',
    'Comité regional': '',
    Alergia: '',
    Enfermedades: '',
    'Títulos aprobados': [],
    'Cursos aprobados': [],
    Sanciones: [],
    'Reconocimiento anual': [],
    Comentarios: ''
  });

  // Actualizar formData cuando cambie voluntarioData
  React.useEffect(() => {
    if (voluntarioData) {
      setFormData({
        fotoId: voluntarioData.fotoId || '',
        'Comité regional': voluntarioData['Comité regional'] || '',
        Alergia: voluntarioData.Alergia || '',
        Enfermedades: voluntarioData.Enfermedades || '',
        'Títulos aprobados': voluntarioData['Títulos aprobados'] || [],
        'Cursos aprobados': voluntarioData['Cursos aprobados'] || [],
        Sanciones: voluntarioData.Sanciones || [],
        'Reconocimiento anual': voluntarioData['Reconocimiento anual'] || [],
        Comentarios: voluntarioData.Comentarios || ''
      });
    }
  }, [voluntarioData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Títulos Aprobados
  const handleAddTitulo = () => {
    setFormData(prev => ({
      ...prev,
      'Títulos aprobados': [...prev['Títulos aprobados'], { titulo: '', entregadoPor: '', codigo: '' }]
    }));
  };

  const handleRemoveTitulo = (index) => {
    setFormData(prev => ({
      ...prev,
      'Títulos aprobados': prev['Títulos aprobados'].filter((_, i) => i !== index)
    }));
  };

  const handleTituloChange = (index, field, value) => {
    setFormData(prev => {
      const titulos = [...prev['Títulos aprobados']];
      titulos[index][field] = value;
      return { ...prev, 'Títulos aprobados': titulos };
    });
  };

  const handleTituloDocumentoChange = async (index, file) => {
  if (!file) return;
  
  try {
    setLoading(true);
    
    const formDataUpload = new FormData();
    formDataUpload.append('documento', file);
    
    const token = sessionStorage.getItem('token');
    
    const response = await fetch(`/api/fotos/voluntarios/${voluntarioId}/documento`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formDataUpload
    });

    if (response.ok) {
      const data = await response.json();
      
      // Actualizar el título con el documentoId
      setFormData(prev => {
        const titulos = [...prev['Títulos aprobados']];
        titulos[index].documentoId = data.documentoId;
        titulos[index].nombreArchivo = data.nombreArchivo;
        return { ...prev, 'Títulos aprobados': titulos };
      });

      setSnackbar({
        open: true,
        message: '✅ Documento adjuntado exitosamente',
        severity: 'success'
      });
    }
  } catch (error) {
    console.error('Error subiendo documento:', error);
    setSnackbar({
      open: true,
      message: 'Error al adjuntar documento',
      severity: 'error'
    });
  } finally {
    setLoading(false);
  }
};


  // Cursos Aprobados
  const handleAddCurso = () => {
    setFormData(prev => ({
      ...prev,
      'Cursos aprobados': [...prev['Cursos aprobados'], { nombre: '', entregadoPor: '', codigo: '' }]
    }));
  };

  const handleRemoveCurso = (index) => {
    setFormData(prev => ({
      ...prev,
      'Cursos aprobados': prev['Cursos aprobados'].filter((_, i) => i !== index)
    }));
  };

  const handleCursoChange = (index, field, value) => {
    setFormData(prev => {
      const cursos = [...prev['Cursos aprobados']];
      cursos[index][field] = value;
      return { ...prev, 'Cursos aprobados': cursos };
    });
  };

  const handleCursoDocumentoChange = async (index, file) => {
  if (!file) return;
  
  try {
    setLoading(true);
    
    const formDataUpload = new FormData();
    formDataUpload.append('documento', file);
    
    const token = sessionStorage.getItem('token');
    
    const response = await fetch(`/api/fotos/voluntarios/${voluntarioId}/documento`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formDataUpload
    });

    if (response.ok) {
      const data = await response.json();
      
      // Actualizar el curso con el documentoId
      setFormData(prev => {
        const cursos = [...prev['Cursos aprobados']];
        cursos[index].documentoId = data.documentoId;
        cursos[index].nombreArchivo = data.nombreArchivo;
        return { ...prev, 'Cursos aprobados': cursos };
      });

      setSnackbar({
        open: true,
        message: '✅ Documento adjuntado exitosamente',
        severity: 'success'
      });
    }
  } catch (error) {
    console.error('Error subiendo documento:', error);
    setSnackbar({
      open: true,
      message: 'Error al adjuntar documento',
      severity: 'error'
    });
  } finally {
    setLoading(false);
  }
};


  // Sanciones
  const handleAddSancion = () => {
    setFormData(prev => ({
      ...prev,
      Sanciones: [...prev.Sanciones, { tipo: '', fecha: '', resumen: '' }]
    }));
  };

  const handleRemoveSancion = (index) => {
    setFormData(prev => ({
      ...prev,
      Sanciones: prev.Sanciones.filter((_, i) => i !== index)
    }));
  };

  const handleSancionChange = (index, field, value) => {
    setFormData(prev => {
      const sanciones = [...prev.Sanciones];
      sanciones[index][field] = value;
      return { ...prev, Sanciones: sanciones };
    });
  };

  // Reconocimiento Anual
  const handleAddReconocimiento = () => {
    setFormData(prev => ({
      ...prev,
      'Reconocimiento anual': [...prev['Reconocimiento anual'], { tipo: '', año: new Date().getFullYear().toString() }]
    }));
  };

  const handleRemoveReconocimiento = (index) => {
    setFormData(prev => ({
      ...prev,
      'Reconocimiento anual': prev['Reconocimiento anual'].filter((_, i) => i !== index)
    }));
  };

  const handleReconocimientoChange = (index, field, value) => {
    setFormData(prev => {
      const reconocimientos = [...prev['Reconocimiento anual']];
      reconocimientos[index][field] = value;
      return { ...prev, 'Reconocimiento anual': reconocimientos };
    });
  };

  // Foto
    const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
        setLoading(true);
        
        const formDataUpload = new FormData();
        formDataUpload.append('foto', file);

        // Para FormData no usar authFetch, usar fetch directo con token
        const token = sessionStorage.getItem('token');
        
        const response = await fetch(`/api/fotos/voluntarios/${voluntarioId}/foto`, {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${token}`
            // NO incluir Content-Type, FormData lo hace automáticamente
            },
            body: formDataUpload
        });

        if (response.ok) {
            const data = await response.json();
            
            setFormData(prev => ({
            ...prev,
            fotoId: data.fotoId
            }));

            setSnackbar({
            open: true,
            message: '✅ Foto subida exitosamente',
            severity: 'success'
            });

            console.log('✅ Foto guardada en GridFS:', data.fotoId);
        } else {
            const error = await response.json();
            setSnackbar({
            open: true,
            message: 'Error al subir foto: ' + error.error,
            severity: 'error'
            });
        }
        } catch (error) {
        console.error('Error subiendo foto:', error);
        setSnackbar({
            open: true,
            message: 'Error al subir foto',
            severity: 'error'
        });
        } finally {
        setLoading(false);
        }
    }
  };

  // Submit
  const handleSubmit = async () => {
    setLoading(true);

    try {
    // No enviar fotoId en el PATCH porque ya se guardó en GridFS
    const { fotoId, ...dataToSave } = formData;

    const response = await authFetch(`/api/voluntarios/${voluntarioId}`, {
        method: 'PATCH',
        body: JSON.stringify(dataToSave)
    });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: '✅ Hoja de vida actualizada exitosamente',
          severity: 'success'
        });

        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setSnackbar({
          open: true,
          message: 'Error al actualizar',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({
        open: true,
        message: 'Error actualizando hoja de vida',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarDocumento = async (documentoId, nombreArchivo) => {
    try {
        const token = sessionStorage.getItem('token');
        
        const response = await fetch(`/api/fotos/documento/${documentoId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
        });

        if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo || 'documento.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log('✅ Documento descargado:', nombreArchivo);
        } else {
        setSnackbar({
            open: true,
            message: 'Error al descargar documento',
            severity: 'error'
        });
        }
    } catch (error) {
        console.error('Error descargando:', error);
        setSnackbar({
        open: true,
        message: 'Error al descargar documento',
        severity: 'error'
        });
    }
};

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ bgcolor: COLORS.primary, color: '#fff', fontWeight: 700 }}>
        📄 Hoja de Vida del Voluntario
      </DialogTitle>

      {/* Tabs para organizar el contenido */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f5f5f5' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTab-root': { fontWeight: 600 },
            '& .Mui-selected': { color: COLORS.primary }
          }}
        >
          <Tab label="📋 Datos Personales" />
          <Tab label="🎓 Formación" />
          <Tab label="📊 Historial" />
          <Tab label="💬 Comentarios" />
        </Tabs>
      </Box>

      <DialogContent sx={{ minHeight: '60vh', maxHeight: '70vh', overflowY: 'auto', p: 3 }}>
        
        {/* PESTAÑA 1: Datos Personales */}
        {tabValue === 0 && (
          <Box>
            {/* Foto centrada y destacada */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 3 }}>
                📷 Foto de Perfil
              </Typography>
              {formData.fotoId ? (
                <Avatar
                  src={`/api/fotos/voluntarios/${voluntarioId}/foto`}
                  alt="Foto voluntario"
                  sx={{ 
                    width: 180, 
                    height: 180, 
                    margin: '0 auto 20px',
                    border: `4px solid ${COLORS.primary}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                />
              ) : (
                <Avatar
                  sx={{ 
                    width: 180, 
                    height: 180, 
                    margin: '0 auto 20px',
                    bgcolor: '#e0e0e0',
                    color: '#999',
                    fontSize: 60
                  }}
                >
                  👤
                </Avatar>
              )}
              <Button
                variant="contained"
                component="label"
                sx={{ backgroundColor: COLORS.primary }}
              >
                Cambiar Foto
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFotoChange}
                />
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Datos Institucionales */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#fafafa' }}>
              <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 3 }}>
                🏢 Datos Institucionales
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Comité Regional
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {voluntarioData?.['Comité regional'] || 'No asignado'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Filial
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {voluntarioData?.Filial || 'No asignado'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            {/* Datos de Salud */}
            <Paper elevation={2} sx={{ p: 3, bgcolor: '#fafafa' }}>
              <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
                🏥 Información de Salud
              </Typography>
              <TextField
                fullWidth
                label="Alergias"
                name="Alergia"
                value={formData.Alergia}
                onChange={handleChange}
                multiline
                rows={2}
                sx={{ mb: 2 }}
                placeholder="Ej: Penicilina, Polen, etc."
              />
              <TextField
                fullWidth
                label="Enfermedades"
                name="Enfermedades"
                value={formData.Enfermedades}
                onChange={handleChange}
                multiline
                rows={2}
                placeholder="Ej: Asma, Diabetes, etc."
              />
            </Paper>
          </Box>
        )}

                {/* PESTAÑA 2: Formación */}
        {tabValue === 1 && (
          <Box>
            {/* Títulos Aprobados */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#fafafa' }}>
              <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
                📜 Títulos Aprobados
              </Typography>
              {formData['Títulos aprobados'].length > 0 ? (
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: COLORS.primary }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Título</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Entregado por</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Código</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Documento</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData['Títulos aprobados'].map((titulo, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <TextField
                              size="small"
                              value={titulo.titulo || ''}
                              onChange={(e) => handleTituloChange(index, 'titulo', e.target.value)}
                              variant="standard"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={titulo.entregadoPor || ''}
                              onChange={(e) => handleTituloChange(index, 'entregadoPor', e.target.value)}
                              variant="standard"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={titulo.codigo || ''}
                              onChange={(e) => handleTituloChange(index, 'codigo', e.target.value)}
                              variant="standard"
                            />
                          </TableCell>
                          <TableCell>
                            {titulo.documentoId ? (
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDescargarDocumento(titulo.documentoId, titulo.nombreArchivo)}
                                  sx={{ color: COLORS.primary }}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                                <Typography variant="caption" sx={{ fontSize: 10 }}>
                                  {titulo.nombreArchivo}
                                </Typography>
                              </Box>
                            ) : (
                              <Button
                                variant="outlined"
                                component="label"
                                size="small"
                                startIcon={<AttachFileIcon />}
                                sx={{ fontSize: 10, p: 0.5 }}
                              >
                                Adjuntar
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  hidden
                                  onChange={(e) => handleTituloDocumentoChange(index, e.target.files[0])}
                                />
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveTitulo(index)}
                              sx={{ color: 'red' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography sx={{ color: '#999', fontStyle: 'italic', mb: 2 }}>
                  Sin títulos registrados
                </Typography>
              )}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddTitulo}
                sx={{ color: COLORS.primary }}
                variant="outlined"
              >
                Agregar Título
              </Button>
            </Paper>

            {/* Cursos Aprobados */}
            <Paper elevation={2} sx={{ p: 3, bgcolor: '#fafafa' }}>
              <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
                📚 Cursos Aprobados
              </Typography>
              {formData['Cursos aprobados'].length > 0 ? (
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: COLORS.primary }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Nombre</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Entregado por</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Código</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Documento</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData['Cursos aprobados'].map((curso, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <TextField
                              size="small"
                              value={curso.nombre || ''}
                              onChange={(e) => handleCursoChange(index, 'nombre', e.target.value)}
                              variant="standard"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={curso.entregadoPor || ''}
                              onChange={(e) => handleCursoChange(index, 'entregadoPor', e.target.value)}
                              variant="standard"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={curso.codigo || ''}
                              onChange={(e) => handleCursoChange(index, 'codigo', e.target.value)}
                              variant="standard"
                            />
                          </TableCell>
                          <TableCell>
                            {curso.documentoId ? (
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDescargarDocumento(curso.documentoId, curso.nombreArchivo)}
                                  sx={{ color: COLORS.primary }}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                                <Typography variant="caption" sx={{ fontSize: 10 }}>
                                  {curso.nombreArchivo}
                                </Typography>
                              </Box>
                            ) : (
                              <Button
                                variant="outlined"
                                component="label"
                                size="small"
                                startIcon={<AttachFileIcon />}
                                sx={{ fontSize: 10, p: 0.5 }}
                              >
                                Adjuntar
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  hidden
                                  onChange={(e) => handleCursoDocumentoChange(index, e.target.files[0])}
                                />
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveCurso(index)}
                              sx={{ color: 'red' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography sx={{ color: '#999', fontStyle: 'italic', mb: 2 }}>
                  Sin cursos registrados
                </Typography>
              )}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddCurso}
                sx={{ color: COLORS.primary }}
                variant="outlined"
              >
                Agregar Curso
              </Button>
            </Paper>
          </Box>
        )}

                {/* PESTAÑA 3: Historial */}
        {tabValue === 2 && (
          <Box>
            {/* Sanciones */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#fafafa' }}>
              <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
                ⚖️ Sanciones
              </Typography>
              {formData.Sanciones.length > 0 ? (
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: COLORS.primary }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Tipo</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Fecha</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Resumen</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.Sanciones.map((sancion, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <TextField
                              size="small"
                              value={sancion.tipo || ''}
                              onChange={(e) => handleSancionChange(index, 'tipo', e.target.value)}
                              variant="standard"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="date"
                              value={sancion.fecha || ''}
                              onChange={(e) => handleSancionChange(index, 'fecha', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              variant="standard"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={sancion.resumen || ''}
                              onChange={(e) => handleSancionChange(index, 'resumen', e.target.value)}
                              variant="standard"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveSancion(index)}
                              sx={{ color: 'red' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography sx={{ color: '#999', fontStyle: 'italic', mb: 2 }}>
                  Sin sanciones registradas
                </Typography>
              )}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddSancion}
                sx={{ color: COLORS.primary }}
                variant="outlined"
              >
                Agregar Sanción
              </Button>
            </Paper>

            {/* Reconocimiento Anual */}
            <Paper elevation={2} sx={{ p: 3, bgcolor: '#fafafa' }}>
              <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
                🏆 Reconocimiento Anual
              </Typography>
              {formData['Reconocimiento anual'].length > 0 ? (
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: COLORS.primary }}>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Tipo</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Año</TableCell>
                        <TableCell sx={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData['Reconocimiento anual'].map((rec, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <TextField
                              size="small"
                              value={rec.tipo || ''}
                              onChange={(e) => handleReconocimientoChange(index, 'tipo', e.target.value)}
                              variant="standard"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={rec.año || ''}
                              onChange={(e) => handleReconocimientoChange(index, 'año', e.target.value)}
                              variant="standard"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveReconocimiento(index)}
                              sx={{ color: 'red' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography sx={{ color: '#999', fontStyle: 'italic', mb: 2 }}>
                  Sin reconocimientos registrados
                </Typography>
              )}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddReconocimiento}
                sx={{ color: COLORS.primary }}
                variant="outlined"
              >
                Agregar Reconocimiento
              </Button>
            </Paper>
          </Box>
        )}

        {/* PESTAÑA 4: Comentarios */}
        {tabValue === 3 && (
          <Box>
            <Paper elevation={2} sx={{ p: 3, bgcolor: '#fafafa' }}>
              <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
                📝 Comentarios
              </Typography>
              <TextField
                fullWidth
                label="Comentarios"
                name="Comentarios"
                value={formData.Comentarios}
                onChange={handleChange}
                multiline
                rows={8}
                placeholder="Escribe aquí los comentarios sobre el desempeño del voluntario..."
              />
            </Paper>
          </Box>
        )}

      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
        <Button onClick={onClose} sx={{ color: '#666' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{ 
            backgroundColor: COLORS.primary,
            '&:hover': { backgroundColor: COLORS.primaryDark }
          }}
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
