const { ObjectId } = require('mongodb');

/**
 * Middleware para verificar si el usuario está autenticado
 * Soporta tanto sesiones de Passport como tokens Bearer (JWT/ID de MongoDB)
 */
const isAuthenticated = (req, res, next) => {
  // Primero intentar validar sesión de Passport
  if (req.isAuthenticated && req.isAuthenticated()) {
    console.log('✅ Usuario autenticado por sesión Passport:', req.user.email);
    return next();
  }

  // Si no hay sesión, intentar validar token Bearer
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('❌ No hay token Bearer ni sesión Passport');
    return res.status(401).json({ 
      error: 'No autenticado',
      message: 'Debe iniciar sesión para acceder a este recurso' 
    });
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Validar que el token sea un ObjectId válido
  if (!ObjectId.isValid(token)) {
    console.warn('❌ Token inválido (no es ObjectId):', token);
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
        console.warn('❌ Usuario no encontrado con token:', token);
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

      console.log('✅ Token Bearer validado para:', usuario.email);
      next();
    })
    .catch(error => {
      console.error('❌ Error validando token:', error);
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
      console.warn('❌ Usuario sin rol asignado');
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: 'No tiene permisos para acceder a este recurso' 
      });
    }
    
    if (!roles.includes(req.user.rol)) {
      console.warn('❌ Rol no autorizado:', req.user.rol, '- Roles requeridos:', roles);
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: `Se requiere uno de estos roles: ${roles.join(', ')}`
      });
    }
    
    console.log('✅ Acceso autorizado para rol:', req.user.rol);
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
    // Admins ven todo - sin filtros
    console.log('📊 Filtros para ADMIN: ninguno (ve todo)');
    return filtros;
  }
  
  if (user.rol === 'sede_regional') {
    // Sede regional ve solo su región
    filtros.region = user.region;
    console.log('📊 Filtros para SEDE_REGIONAL:', filtros);
    return filtros;
  }
  
  if (user.rol === 'presidente') {
    // Presidente ve solo su filial
    filtros.region = user.region;
    filtros.filial = user.filial;
    console.log('📊 Filtros para PRESIDENTE:', filtros);
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
