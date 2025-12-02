import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Card, CardContent, Chip, Accordion, AccordionSummary, 
  AccordionDetails, Divider, CircularProgress 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function FilialesJerarquia() {
  const [jerarquia, setJerarquia] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/api/filialesJerarquicas')
      .then(res => res.json())
      .then(data => {
        setJerarquia(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: '#9c1821' }} />
      </Box>
    );
  }

  const totalVoluntarios = jerarquia.reduce((acc, sede) => acc + sede.totalVoluntarios, 0);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant="h3" sx={{ mb: 4, color: '#9c1821', textAlign: 'center' }}>
        📊 Jerarquía Completa - {totalVoluntarios.toLocaleString()} Voluntarios
      </Typography>

      <Box sx={{ display: 'grid', gap: 3 }}>
        {jerarquia.map((sede, sedeIdx) => (
          <Accordion key={sedeIdx} defaultExpanded sx={{ boxShadow: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: '#9c1821' }} />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
                <Typography variant="h5" sx={{ color: '#9c1821', fontWeight: 700, flex: 1 }}>
                  📍 {sede.sede}
                </Typography>
                <Chip 
                  label={`${sede.totalVoluntarios.toLocaleString()} voluntarios`} 
                  color="primary" 
                  variant="filled"
                  size="medium"
                />
              </Box>
            </AccordionSummary>
            
            <AccordionDetails sx={{ p: 0 }}>
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}>
                  {sede.filiales.map((filial, filialIdx) => {
                    const porcentajeActivos = filial.totalVoluntarios > 0 
                      ? Math.round((filial.activos / filial.totalVoluntarios) * 100)
                      : 0;

                    return (
                      <Card 
                        key={filialIdx} 
                        sx={{ 
                          cursor: 'pointer', 
                          transition: 'all 0.3s',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: 6
                          }
                        }}
                        onClick={() => navigate(`/filial/${encodeURIComponent(filial.nombre)}`)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#9c1821' }}>
                              {filial.nombre}
                            </Typography>
                            <Chip 
                              icon={<VisibilityIcon />} 
                              label={filial.totalVoluntarios.toLocaleString()}
                              color="primary" 
                              size="small"
                            />
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                            <Chip 
                              label={`Activos: ${filial.activos}`} 
                              color="success" 
                              variant="outlined" 
                              size="small"
                            />
                            <Chip 
                              label={`Llamada: ${filial.llamada}`} 
                              color="warning" 
                              variant="outlined" 
                              size="small"
                            />
                            <Chip 
                              label={`${porcentajeActivos}% activos`} 
                              color="primary" 
                              size="small"
                            />
                            <Chip 
                              label={`H: ${filial.hombres} | M: ${filial.mujeres}`} 
                              color="secondary" 
                              variant="outlined" 
                              size="small"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
}
