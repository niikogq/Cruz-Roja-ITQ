import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

const HEADER_HEIGHT = 56;

const routeTitles = {
  '/': 'Dashboard',
  '/voluntarios': 'Gestión de Voluntarios',
  '/filiales': 'Datos de Filiales',
  '/sugerencias': 'Sugerencias',
  '/donaciones': 'Donaciones',
  '/emergencias': 'Emergencias',
  '/reportes': 'Reportes'
};

const Header = ({ onToggleSidebar }) => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentTitle = routeTitles[location.pathname] || 'Cruz Roja Chilena';

  const formattedDate = currentTime.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
  const formattedTime = currentTime.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(135deg, #9c1821 0%, #c54646 100%)',
        color: '#fff',
        height: HEADER_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        zIndex: 1200,      // menor que el Drawer (que usaremos en 1300)
        padding: '0 24px',
        gap: 16
      }}
    >
      {/* Menú + logo + título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <IconButton
          color="inherit"
          onClick={onToggleSidebar}
          size="small"
          sx={{ color: '#fff' }}
        >
          <MenuIcon />
        </IconButton>

        <h1
          style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {currentTitle}
        </h1>
      </div>

      {/* Fecha/Hora y Usuario */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
        <div
          style={{
            fontSize: '0.82rem',
            opacity: 0.95,
            textAlign: 'right',
            lineHeight: 1.3,
            whiteSpace: 'nowrap'
          }}
        >
          <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
            {formattedDate}
          </div>
          <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>
            {formattedTime}
          </div>
        </div>

        <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.3)' }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: 8,
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          onClick={() => alert('Perfil de usuario (próximamente)')}
        >
          <FaUserCircle style={{ fontSize: 30 }} />
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Admin</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Administrador</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
