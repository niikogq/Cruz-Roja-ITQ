// Middleware para verificar si el usuario está autenticado
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ 
    error: 'No autenticado',
    message: 'Debe iniciar sesión para acceder a este recurso' 
  });
};

// Middleware para verificar roles específicos
const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    if (!req.user.rol || !roles.includes(req.user.rol)) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'No tiene permisos suficientes para acceder a este recurso' 
      });
    }
    
    next();
  };
};

// Función para aplicar filtros según el rol del usuario
const aplicarFiltrosRol = (req) => {
  const user = req.user;
  const filtros = {};
  
  if (user.rol === 'admin') {
    // Admins ven todo - sin filtros
    return filtros;
  }
  
  if (user.rol === 'sede_regional') {
    // Sede regional ve solo su región
    filtros.region = user.region;
    return filtros;
  }
  
  if (user.rol === 'presidente') {
    // Presidente ve solo su filial
    filtros.region = user.region;
    filtros.filial = user.filial;
    return filtros;
  }
  
  return filtros;
};

module.exports = {
  isAuthenticated,
  hasRole,
  aplicarFiltrosRol
};
