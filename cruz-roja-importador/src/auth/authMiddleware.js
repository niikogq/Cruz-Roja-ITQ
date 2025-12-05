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

// Middleware para verificar roles (implementar después)
const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    
    if (!req.user.rol || !roles.includes(req.user.rol)) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'No tiene permisos suficientes' 
      });
    }
    
    next();
  };
};

module.exports = {
  isAuthenticated,
  hasRole
};
