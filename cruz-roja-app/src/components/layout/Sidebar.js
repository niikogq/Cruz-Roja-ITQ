import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUserFriends, FaUniversity, FaCommentAlt, FaFileAlt, FaPhone } from 'react-icons/fa';
import logo from '../../assets/logo-cruz-roja.png';

import Drawer from '@mui/material/Drawer';

// Menú con roles
const menu = [
  { path: '/', label: 'Inicio', icon: <FaHome />, roles: ['admin', 'sede_regional', 'presidente'] },
  { path: '/voluntarios', label: 'Voluntarios', icon: <FaUserFriends />, roles: ['admin', 'sede_regional', 'presidente'] },
  { path: '/filiales', label: 'Datos filial', icon: <FaUniversity />, roles: ['admin', 'sede_regional'] },
  { path: '/sugerencias', label: 'Sugerencias', icon: <FaCommentAlt />, roles: ['admin', 'sede_regional', 'presidente'] },
  { path: '/validacion-formularios', label: 'Información Sede', icon: <FaFileAlt />, roles: ['admin'] },
  { path: '/contacto', label: 'Contacto', icon: <FaPhone />, roles: ['admin', 'sede_regional', 'presidente'] },
];

// SOLO el contenido visual del sidebar (logo + lista)
const SidebarContent = ({ location, onItemClick }) => {
  // Obtener rol del usuario
  const getUserRole = () => {
    try {
      const userStr = sessionStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      return user?.rol || 'admin';
    } catch (error) {
      console.error('Error obteniendo rol:', error);
      return 'admin';
    }
  };

  const userRole = getUserRole();

  // Filtrar menú según rol
  const filteredMenu = menu.filter(item => item.roles.includes(userRole));

  return (
    <div
      style={{
        width: 240,
        background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
        height: '100%',
        paddingTop: 0,
        boxShadow: '4px 0 20px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo de la Cruz Roja */}
      <div
        style={{
          padding: '32px 24px',
          textAlign: 'center',
          borderBottom: '2px solid #e8e8e8',
          background: '#fff',
        }}
      >
        <img
          src={logo}
          alt="Cruz Roja Chilena"
          style={{
            width: '100%',
            maxWidth: 180,
            height: 'auto',
            transition: 'transform 0.3s ease',
            cursor: 'pointer',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </div>

      {/* Menú de navegación */}
      <ul
        style={{
          listStyle: 'none',
          padding: '16px 12px',
          margin: 0,
          flex: 1,
        }}
      >
        {filteredMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path} style={{ marginBottom: 6 }}>
              <Link
                to={item.path}
                onClick={onItemClick}
                style={{
                  textDecoration: 'none',
                  color: isActive ? '#fff' : '#9c1821',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderRadius: 10,
                  background: isActive
                    ? 'linear-gradient(135deg, #9c1821 0%, #c54646 100%)'
                    : 'transparent',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: 15,
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? '0 4px 12px rgba(156, 24, 33, 0.3)' : 'none',
                  transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(156, 24, 33, 0.08)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }
                }}
              >
                <span
                  style={{
                    marginRight: 12,
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      ModalProps={{ keepMounted: true }}
      sx={{
        zIndex: 1300,
        '& .MuiDrawer-paper': {
          width: 240,
          boxShadow: '4px 0 20px rgba(0,0,0,0.08)',
        },
      }}
    >
      <SidebarContent
        location={location}
        onItemClick={onClose}
        onClose={onClose}
      />
    </Drawer>
  );
};

export default Sidebar;
