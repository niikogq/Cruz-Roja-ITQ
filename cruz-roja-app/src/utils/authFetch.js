/**
 * authFetch - Wrapper de fetch que agrega autenticación automáticamente
 */

export async function authFetch(url, options = {}) {
  // Obtener token de sessionStorage
  const token = sessionStorage.getItem('token');
  
  // Preparar headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Agregar Authorization solo si hay token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Hacer la petición con headers actualizados
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Manejar errores de autenticación
  if (response.status === 401) {
    sessionStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('No autenticado');
  }
  
  if (response.status === 403) {
    console.warn('⚠️ Acceso denegado');
    throw new Error('Acceso denegado');
  }
  
  return response;
}
