import React, { useState } from 'react';
import { 
  Box, TextField, Button, Typography, Alert, CircularProgress 
} from '@mui/material';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: '123' })
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        onLogin(data.user);
      } else {
        setError(data.error || 'Error de login');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Bienvenido a Cruz Roja
      </Typography>
      
      <TextField
        fullWidth
        label="RUT o Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Button
        fullWidth
        variant="contained"
        onClick={handleLogin}
        disabled={loading}
        sx={{ mb: 2, py: 1.5 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
      </Button>
      
      <Typography variant="body2" color="text.secondary">
        Usa tu RUT (ej: 12345678-9) o email del voluntario
      </Typography>
    </Box>
  );
}
