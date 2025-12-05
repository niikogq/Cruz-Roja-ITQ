import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

const HEADER_HEIGHT = 60;

export const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f8f9fa',
      }}
    >
      {/* Sidebar desplegable / persistente */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenedor principal */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header onToggleSidebar={handleToggleSidebar} />

        <main
          style={{
            padding: window.innerWidth < 600 ? 16 : 32,
            marginTop: HEADER_HEIGHT + 16,
            minHeight: `calc(100vh - ${HEADER_HEIGHT + 16}px)`
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
