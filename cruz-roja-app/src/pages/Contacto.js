import React from 'react';
import { Box, Container, Grid, Card, CardContent, Typography, Link, Divider } from '@mui/material';
import { Phone, Email, LocationOn, Facebook, LinkedIn, YouTube, Instagram } from '@mui/icons-material';
import X from '@mui/icons-material/X';
import { COLORS } from '../utils/constants';

export default function Contacto() {
  const contactInfo = [
    {
      icon: <LocationOn sx={{ fontSize: 32, color: COLORS.primary }} />,
      label: 'Dirección',
      value: 'Avda. Santa María 0150, Providencia',
      link: null
    },
    {
      icon: <Phone sx={{ fontSize: 32, color: COLORS.primary }} />,
      label: 'Teléfono',
      value: '+56 (2) 2783 4100',
      link: 'tel:+56227834100'
    },
    {
      icon: <Email sx={{ fontSize: 32, color: COLORS.primary }} />,
      label: 'Contacto General',
      value: 'contacto@cruzroja.cl',
      link: 'mailto:contacto@cruzroja.cl'
    },
    {
      icon: <Email sx={{ fontSize: 32, color: COLORS.primary }} />,
      label: 'Administración',
      value: 'itq@cruzroja.cl',
      link: 'mailto:itq@cruzroja.cl'
    }
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      icon: <Facebook sx={{ fontSize: 40, color: '#1877F2' }} />,
      url: 'https://www.facebook.com/cruz.roja.chile/'
    },
    {
      name: 'Instagram',
      icon: <Instagram sx={{ fontSize: 40, color: '#E4405F' }} />,
      url: 'https://www.instagram.com/cruzrojachilena/?hl=es-la'
    },
    {
      name: 'LinkedIn',
      icon: <LinkedIn sx={{ fontSize: 40, color: '#0A66C2' }} />,
      url: 'https://www.linkedin.com/in/cruz-roja-chilena-6b62181b9/'
    },
    {
      name: 'YouTube',
      icon: <YouTube sx={{ fontSize: 40, color: '#FF0000' }} />,
      url: 'https://www.youtube.com/@cruzrojachilenaoficial/videos'
    },
    {
      name: 'Twitter/X',
      icon: <X sx={{ fontSize: 40, color: '#000000' }} />,
      url: 'https://x.com/cruzrojachilena?lang=es'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 0 }}>
      {/* Encabezado */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
          Contacto
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', fontSize: 18 }}>
          Ponte en contacto con la Cruz Roja Chilena
        </Typography>
      </Box>

      {/* Sección de Información de Contacto */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {contactInfo.map((item, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card
              sx={{
                height: '100%',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderRadius: 2,
                transition: 'transform 0.3s ease, boxShadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                }
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ mt: 1 }}>
                  {item.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#999', mb: 0.5 }}>
                    {item.label}
                  </Typography>
                  {item.link ? (
                    <Link
                      href={item.link}
                      sx={{
                        color: COLORS.primary,
                        textDecoration: 'none',
                        fontSize: 16,
                        fontWeight: 600,
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {item.value}
                    </Link>
                  ) : (
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#333' }}>
                      {item.value}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Sección de Redes Sociales */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ color: COLORS.primary, fontWeight: 700, mb: 4 }}>
          Síguenos en Redes Sociales
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 3,
            flexWrap: 'wrap'
          }}
        >
          {socialLinks.map((social, index) => (
            <Link
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                textDecoration: 'none',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.15)'
                }
              }}
            >
              {social.icon}
              <Typography sx={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
                {social.name}
              </Typography>
            </Link>
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Sección informativa */}
      <Box sx={{
        background: 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
        p: 4,
        borderRadius: 2,
        textAlign: 'center'
      }}>
        <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 700, mb: 2 }}>
          Misión de la Cruz Roja Chilena
        </Typography>
        <Typography sx={{ color: '#666', lineHeight: 1.8 }}>
          La Cruz Roja Chilena es una institución humanitaria fundada para prestar ayuda y asistencia
          a las personas sin discriminación, especialmente en situaciones de emergencia y desastres.
          Trabajamos con el compromiso de aliviar el sufrimiento humano y promover los valores
          humanitarios en toda la sociedad chilena.
        </Typography>
      </Box>
    </Container>
  );
}
