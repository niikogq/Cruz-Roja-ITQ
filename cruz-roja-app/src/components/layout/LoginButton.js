import React from 'react';
import { Button } from '@mui/material';
import FcGoogle from 'react-icons/fc';

export const LoginButton = () => (
  <Button
    variant="contained"
    startIcon={<FcGoogle />}
    size="large"
    sx={{
      backgroundColor: '#4285f4',
      '&:hover': { backgroundColor: '#3367d6' },
      boxShadow: '0 4px 12px rgba(66, 133, 244, 0.4)',
      color: 'white',
      textTransform: 'none',
      fontWeight: 600
    }}
    onClick={() => {
      window.location.href = 'http://localhost:3001/api/auth/saml/login';
    }}
  >
    Iniciar Sesión con Google Workspace
  </Button>
);
