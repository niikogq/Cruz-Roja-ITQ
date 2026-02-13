import React, { useState } from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, Divider, CircularProgress, Alert, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { COLORS } from '../../utils/constants';
import { authFetch } from '../../utils/authFetch';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';


export const HojaDeVidaModal = ({ 
  open, 
  onClose, 
  voluntarioId,
  voluntarioData 
}) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: COLORS.primary, color: '#fff', fontWeight: 700 }}>
        📄 Hoja de Vida del Voluntario
      </DialogTitle>

      <DialogContent sx={{ mt: 2, maxHeight: '70vh', overflowY: 'auto' }}>
        
        {/* Foto */}
        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
          📷 Foto
        </Typography>
        <Box sx={{ mb: 4, p: 2, border: `1px solid ${COLORS.primary}`, borderRadius: 1 }}>
          {formData.fotoId ? (
            <Box sx={{ mb: 2 }}>
                <img 
                src={`/api/fotos/voluntarios/${voluntarioId}/foto`}
                alt="Foto voluntario" 
                style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: 8 }} 
                />
            </Box>
            ) : (
            <Box sx={{ mb: 2, color: '#999' }}>
                Sin foto de perfil
            </Box>
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

        {/* Datos Institucionales */}
        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
          🏢 Datos Institucionales
        </Typography>
        <TextField
          fullWidth
          label="Comité Regional"
          name="Comité regional"
          value={formData['Comité regional']}
          onChange={handleChange}
          sx={{ mb: 4 }}
        />

        <Divider sx={{ my: 2 }} />

        {/* Datos Personales - Salud */}
        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
          🏥 Datos Personales - Salud
        </Typography>
        <TextField
          fullWidth
          label="Alergia"
          name="Alergia"
          value={formData.Alergia}
          onChange={handleChange}
          multiline
          rows={2}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Enfermedades"
          name="Enfermedades"
          value={formData.Enfermedades}
          onChange={handleChange}
          multiline
          rows={2}
          sx={{ mb: 4 }}
        />

        <Divider sx={{ my: 2 }} />

        {/* Títulos Aprobados */}
        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
          📜 Títulos Aprobados
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: COLORS.primary }}>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Título</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Entregado por</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Código</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Documento</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {formData['Títulos aprobados'].map((titulo, index) => (
                    <TableRow key={index}>
                    <TableCell>
                        <TextField
                        size="small"
                        value={titulo.titulo || ''}
                        onChange={(e) => handleTituloChange(index, 'titulo', e.target.value)}
                        />
                    </TableCell>
                    <TableCell>
                        <TextField
                        size="small"
                        value={titulo.entregadoPor || ''}
                        onChange={(e) => handleTituloChange(index, 'entregadoPor', e.target.value)}
                        />
                    </TableCell>
                    <TableCell>
                        <TextField
                        size="small"
                        value={titulo.codigo || ''}
                        onChange={(e) => handleTituloChange(index, 'codigo', e.target.value)}
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
                                <DownloadIcon />
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
                        <DeleteIcon />
                        </IconButton>
                    </TableCell>
                    </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddTitulo}
          sx={{ mb: 4, color: COLORS.primary }}
        >
          Agregar Título
        </Button>

        <Divider sx={{ my: 2 }} />

        {/* Cursos Aprobados */}
        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
          📚 Cursos Aprobados
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: COLORS.primary }}>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Nombre</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Entregado por</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Código</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Documento</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {formData['Cursos aprobados'].map((curso, index) => (
                    <TableRow key={index}>
                    <TableCell>
                        <TextField
                        size="small"
                        value={curso.nombre || ''}
                        onChange={(e) => handleCursoChange(index, 'nombre', e.target.value)}
                        />
                    </TableCell>
                    <TableCell>
                        <TextField
                        size="small"
                        value={curso.entregadoPor || ''}
                        onChange={(e) => handleCursoChange(index, 'entregadoPor', e.target.value)}
                        />
                    </TableCell>
                    <TableCell>
                        <TextField
                        size="small"
                        value={curso.codigo || ''}
                        onChange={(e) => handleCursoChange(index, 'codigo', e.target.value)}
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
                                    <DownloadIcon />
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
                        <DeleteIcon />
                        </IconButton>
                    </TableCell>
                    </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddCurso}
          sx={{ mb: 4, color: COLORS.primary }}
        >
          Agregar Curso
        </Button>

        <Divider sx={{ my: 2 }} />

        {/* Sanciones */}
        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
          ⚖️ Sanciones
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: COLORS.primary }}>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Fecha</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Resumen</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.Sanciones.map((sancion, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      size="small"
                      value={sancion.tipo || ''}
                      onChange={(e) => handleSancionChange(index, 'tipo', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="date"
                      value={sancion.fecha || ''}
                      onChange={(e) => handleSancionChange(index, 'fecha', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={sancion.resumen || ''}
                      onChange={(e) => handleSancionChange(index, 'resumen', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveSancion(index)}
                      sx={{ color: 'red' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddSancion}
          sx={{ mb: 4, color: COLORS.primary }}
        >
          Agregar Sanción
        </Button>

        <Divider sx={{ my: 2 }} />

        {/* Reconocimiento Anual */}
        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
          🏆 Reconocimiento Anual
        </Typography>
        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: COLORS.primary }}>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Año</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData['Reconocimiento anual'].map((rec, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <TextField
                      size="small"
                      value={rec.tipo || ''}
                      onChange={(e) => handleReconocimientoChange(index, 'tipo', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={rec.año || ''}
                      onChange={(e) => handleReconocimientoChange(index, 'año', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveReconocimiento(index)}
                      sx={{ color: 'red' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddReconocimiento}
          sx={{ mb: 4, color: COLORS.primary }}
        >
          Agregar Reconocimiento
        </Button>

        <Divider sx={{ my: 2 }} />

        {/* Comentarios */}
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
          rows={4}
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
