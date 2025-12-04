import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUserFriends, FaUniversity, FaCommentAlt, FaFileAlt } from 'react-icons/fa';
import logo from '../../assets/logo-cruz-roja.png';

import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Menú original
const menu = [
  { path: '/', label: 'Inicio', icon: <FaHome /> },
  { path: '/voluntarios', label: 'Voluntarios', icon: <FaUserFriends /> },
  { path: '/filiales', label: 'Datos filial', icon: <FaUniversity /> },
  { path: '/sugerencias', label: 'Sugerencias', icon: <FaCommentAlt /> },
  { path: '/validacion-formularios', label: 'Información Sede', icon: <FaFileAlt /> },
];

// SOLO el contenido visual del sidebar (logo + lista)
const SidebarContent = ({ location }) => (
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
      {menu.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <li key={item.path} style={{ marginBottom: 6 }}>
            <Link
              to={item.path}
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

const Sidebar = () => {
  const location = useLocation();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md')); // >= md sidebar fijo
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => setOpen((prev) => !prev);

  return (
    <>
      {/* Botón hamburguesa SOLO en móvil/tablet. 
          Ponlo aquí o muévelo a tu header si prefieres. */}
      {!isDesktop && (
        <IconButton
          color="inherit"
          onClick={toggleDrawer}
          sx={{ position: 'fixed', top: 12, left: 12, zIndex: 1300 }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Sidebar fijo en escritorio (mismo estilo original) */}
      {isDesktop && (
        <nav
          style={{
            width: 240,
            background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
            height: '100vh',
            paddingTop: 0,
            boxShadow: '4px 0 20px rgba(0,0,0,0.08)',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1000,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <SidebarContent location={location} />
        </nav>
      )}

      {/* Sidebar desplegable en móvil/tablet */}
      {!isDesktop && (
        <Drawer
          anchor="left"
          open={open}
          onClose={toggleDrawer}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 240,
              boxShadow: '4px 0 20px rgba(0,0,0,0.08)',
            },
          }}
        >
          <SidebarContent location={location} />
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
