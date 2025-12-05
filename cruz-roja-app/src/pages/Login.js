import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import '../Login.css';

function Login() {
  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: credentialResponse.credential
        })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        window.location.href = '/';  // ← CAMBIO: De '/dashboard' a '/'
      } else {
        alert('Error: ' + (data.message || 'No autorizado'));
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Error de conexión con el servidor');
    }
  };

  const handleError = () => {
    console.log('Error al iniciar sesión con Google');
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text="signin_with"
        shape="rectangular"
        theme="outline"
        size="large"
      />
    </div>
  );
}

export default Login;
