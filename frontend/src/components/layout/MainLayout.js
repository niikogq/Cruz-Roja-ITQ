import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export const MainLayout = ({ children }) => {
  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: '#f8f9fa' 
    }}>
      <Sidebar />
      <div style={{ 
        marginLeft: 240, 
        width: '100%' 
      }}>
        <Header />
        <main style={{
          padding: 32,
          marginTop: 76,
          minHeight: 'calc(100vh - 76px)'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};
