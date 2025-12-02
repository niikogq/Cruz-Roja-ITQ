import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaUserFriends, FaUniversity, FaCommentAlt, FaFileAlt } from 'react-icons/fa';
import logo from '../../assets/logo-cruz-roja.png';

//FaSitemap import react-icons/fa

const menu = [
  { path: '/', label: 'Inicio', icon: <FaHome /> },
  { path: '/voluntarios', label: 'Voluntarios', icon: <FaUserFriends /> },
  { path: '/filiales', label: 'Datos filial', icon: <FaUniversity /> },
  { path: '/sugerencias', label: 'Sugerencias', icon: <FaCommentAlt /> },
  { path: '/validacion-formularios', label: 'Información Sede', icon: <FaFileAlt /> },
 // { path: '/filiales-jerarquia', label: 'Jerarquía Filiales', icon: <FaSitemap /> }
 // { path: '/donaciones', label: 'Donaciones', icon: <FaDonate /> },
 // { path: '/emergencias', label: 'Emergencias', icon: <FaExclamationTriangle /> },
 // { path: '/reportes', label: 'Reportes', icon: <FaFileAlt /> },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <nav style={{
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
      flexDirection: 'column'
    }}>
      {/* Logo de la Cruz Roja */}
      <div style={{
        padding: '32px 24px',
        textAlign: 'center',
        borderBottom: '2px solid #e8e8e8',
        background: '#fff'
      }}>
        <img 
          src={logo} 
          alt="Cruz Roja Chilena" 
          style={{
            width: '100%',
            maxWidth: 180,
            height: 'auto',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>

      {/* Menú de navegación */}
      <ul style={{ 
        listStyle: 'none', 
        padding: '16px 12px',
        margin: 0,
        flex: 1
      }}>
        {menu.map(item => {
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
                  transform: isActive ? 'translateX(4px)' : 'translateX(0)'
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
                <span style={{ 
                  marginRight: 12, 
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Sidebar;
