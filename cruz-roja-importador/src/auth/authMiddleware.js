const { ObjectId } = require('mongodb');

/**
 * Middleware para verificar si el usuario está autenticado
 * Soporta tanto sesiones de Passport como tokens Bearer (JWT/ID de MongoDB)
 */
const isAuthenticated = (req, res, next) => {
  // Primero intentar validar sesión de Passport
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // Si no hay sesión, intentar validar token Bearer
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'No autenticado',
      message: 'Debe iniciar sesión para acceder a este recurso' 
    });
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Validar que el token sea un ObjectId válido
  if (!ObjectId.isValid(token)) {
    return res.status(401).json({
      error: 'Token inválido',
      message: 'El token proporcionado no es válido'
    });
  }

  // Verificar que el usuario existe en la BD
  const db = req.app.locals.db;
  
  db.collection('usuarios').findOne({ _id: new ObjectId(token) })
    .then(usuario => {
      if (!usuario) {
        return res.status(401).json({
          error: 'Usuario no encontrado',
          message: 'El token no corresponde a ningún usuario'
        });
      }

      // Agregar usuario al request para uso posterior
      req.user = {
        id: usuario._id.toString(),
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
        region: usuario.region,
        filial: usuario.filial
      };

      next();
    })
    .catch(error => {
      console.error('❌ Error validando token:', error.message);
      return res.status(500).json({
        error: 'Error interno',
        message: 'Error al validar autenticación'
      });
    });
};

/**
 * Middleware para verificar roles específicos
 */
const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'No tiene permisos para acceder a este recurso' 
      });
    }
    
    if (!roles.includes(req.user.rol)) {
      console.warn('❌ Acceso denegado - Rol:', req.user.rol, '- Requiere:', roles.join(', '));
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: `Se requiere uno de estos roles: ${roles.join(', ')}`
      });
    }
    
    next();
  };
};

/**
 * Función para aplicar filtros según el rol del usuario
 */
const aplicarFiltrosRol = (req) => {
  const user = req.user;
  const filtros = {};
  
  if (user.rol === 'admin') {
    return filtros;
  }
  
  if (user.rol === 'sede_regional') {
    filtros.region = user.region;
    return filtros;
  }
  
  if (user.rol === 'presidente') {
    filtros.region = user.region;
    filtros.filial = user.filial;
    return filtros;
  }
  
  console.warn('⚠️ Rol desconocido:', user.rol);
  return filtros;
};

module.exports = {
  isAuthenticated,
  hasRole,
  aplicarFiltrosRol
};
