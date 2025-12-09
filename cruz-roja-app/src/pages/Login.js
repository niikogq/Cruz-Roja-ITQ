import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import '../Login.css';
import logoCruzRoja from '../assets/logo-cruz-roja.png'; // ajusta el nombre si es distinto

function Login() {
  const handleSuccess = async (credentialResponse) => {
  try {
    const response = await fetch('http://localhost:3001/auth/google', { // ← Hardcodear
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: credentialResponse.credential })
    });

      const data = await response.json();
      
      if (data.success) {
        sessionStorage.setItem('token', data.token);
        window.location.href = '/';
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
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <div className="login-logo">
            <img
              src={logoCruzRoja}
              alt="Cruz Roja Chilena"
              className="logo-image"
            />
            <span className="logo-text"></span>
          </div>
          <h2>Portal Administrador Cruz Roja</h2>
          <p>
            Accede con tu cuenta <strong>@cruzroja.cl</strong> para administrar
            información de voluntarios, filiales y reportes internos.
          </p>
        </div>

        <div className="login-right">
          <h3>Iniciar sesión</h3>
          <p className="login-subtitle">
            Usa tu cuenta de Google con correo <strong>@cruzroja.cl</strong>.
          </p>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            text="continue_with"
            shape="pill"
            theme="outline"
            size="large"
          />
          <p className="login-help">
            ¿Tienes problemas para acceder? Contacta con Administracion de Cruz Roja
          </p>
        </div>
      </div>

      <div className="login-footer">
        © {new Date().getFullYear()} Cruz Roja Chilena · Portal Administrador
      </div>
    </div>
  );
}

export default Login;
