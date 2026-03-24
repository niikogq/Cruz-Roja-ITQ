const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { isAuthenticated } = require('../auth/authMiddleware');

// GET - Obtener todos los voluntarios
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { aplicarFiltrosRol } = require('../auth/authMiddleware');
    
    // Obtener filtros según el rol del usuario
    const filtros = aplicarFiltrosRol(req);
    
    // Aplicar filtros a la consulta
    let query = {};
    if (filtros.filial) {
      query.Filial = filtros.filial;
    } else if (filtros.region) {
      const filiales = await db.collection('Datos filial').find({ 
        'Sede regional': filtros.region 
      }).toArray();
      
      const nombreFiliales = filiales.map(f => f.Filial);
      query.Filial = { $in: nombreFiliales };
    }
    
    const voluntarios = await db.collection('Datos voluntarios').find(query).toArray();
    
    res.json(voluntarios);
  } catch (error) {
    console.error('❌ Error obteniendo voluntarios:', error.message);
    res.status(500).json({ error: 'Error obteniendo los voluntarios.' });
  }
});

// PATCH - Actualizar un voluntario (PROTEGIDO + VALIDADO)
router.patch('/:id', isAuthenticated, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    
    // Lista blanca de campos permitidos
    const camposPermitidos = [
      'Nombre', 'Apellido', 'RUT', 'Edad', 'Género', 'Dirección',
      'Comuna', 'Teléfono', 'Telefono', 'Email', 'Correo', 'Direccion', 
      'Filial', 'Sede', 'Region', 'Calidad de voluntario', 'Cargo',
      'Estado civil', 'Nivel de escolaridad',
      'Fecha nacimiento', 'Fecha de ingreso', 'Antigüedad', 'Comentarios', 
      'Foto', 'Comité regional', 'Alergia', 'Enfermedades', 
      'Títulos aprobados', 'Cursos aprobados', 'Sanciones',
      'Reconocimiento anual', 'Contacto de emergencia', 
      'Teléfono contacto emergencia', 'Relación contacto emergencia'
    ];
    
    // Filtrar solo campos permitidos
    const updateFields = {};
    for (const campo of camposPermitidos) {
      if (req.body.hasOwnProperty(campo)) {
        updateFields[campo] = req.body[campo];
      }
    }
    
    // Validar que haya al menos un campo para actualizar
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No se enviaron campos válidos para actualizar' });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const result = await db.collection('Datos voluntarios').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Voluntario no encontrado' });
    }
    
    res.json({ mensaje: 'Actualización exitosa', camposActualizados: Object.keys(updateFields) });
  } catch (error) {
    console.error('❌ Error en PATCH /api/voluntarios/:id:', error.message);
    res.status(500).json({ error: 'Error actualizando voluntario: ' + error.message });
  }
});

// Función helper para convertir fecha de string a Excel date
function convertirFechaExcel(fechaStr) {
  if (!fechaStr) return null;
  
  if (typeof fechaStr === 'string') {
    const partes = fechaStr.split('-');
    if (partes.length !== 3) return null;
    
    const fecha = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
    return Math.floor((fecha.getTime() / (1000 * 60 * 60 * 24)) + 25569);
  }
  
  return null;
}

// Función helper para calcular edad
function calcularEdad(fechaNacimientoStr) {
  if (!fechaNacimientoStr) {
    return 0;
  }
  
  const partes = fechaNacimientoStr.split('-');
  if (partes.length !== 3) {
    console.warn('⚠️ Formato de fecha inválido en calcularEdad:', fechaNacimientoStr);
    return 0;
  }
  
  const año = parseInt(partes[0]);
  const mes = parseInt(partes[1]);
  const dia = parseInt(partes[2]);
  
  if (isNaN(año) || isNaN(mes) || isNaN(dia)) {
    console.warn('⚠️ Valores de fecha no válidos:', { año, mes, dia });
    return 0;
  }
  
  const fechaNacimiento = new Date(año, mes - 1, dia);
  const hoy = new Date();
  
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mesActual = hoy.getMonth() - fechaNacimiento.getMonth();
  
  if (mesActual < 0 || (mesActual === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
    edad--;
  }
  
  return Math.max(0, edad);
}

// POST - Crear nuevo voluntario
router.post('/crear', isAuthenticated, async (req, res) => {
  try {
    const db = req.app.locals.db;

    // Calcular edad ANTES de convertir la fecha
    const edad = calcularEdad(req.body['Fecha nacimiento']);

    // Datos que viene del frontend
    const nuevoVoluntario = {
      // Datos personales
      RUT: req.body.RUT,
      'Nombres voluntario': req.body['Nombres voluntario'],
      'Apellidos voluntarios': req.body['Apellidos voluntarios'],
      'Fecha nacimiento': convertirFechaExcel(req.body['Fecha nacimiento']),
      Nacionalidad: req.body.Nacionalidad,
      'Grupo sanguíneo': req.body['Grupo sanguíneo'],
      'Estado civil': req.body['Estado civil'],
      Género: req.body.Género,
      Telefono: req.body.Telefono,
      Direccion: req.body.Direccion,
      Correo: req.body.Correo,
      'Nivel de escolaridad': req.body['Nivel de escolaridad'],
      
      // Datos de la Cruz Roja
      'Comité regional': req.body['Comité regional'],
      Filial: req.body.Filial,
      'Calidad de voluntario': req.body['Calidad de voluntario'],
      Cargo: req.body.Cargo || 'Voluntario',
      
      // Contacto de emergencia
      'Contacto de emergencia': req.body['Contacto de emergencia'],
      'Teléfono contacto emergencia': req.body['Teléfono contacto emergencia'],
      'Relación contacto emergencia': req.body['Relación contacto emergencia'],
      
      // Metadata
      fechaCreacion: new Date(),
      creadoPor: req.user.email
    };

    // Calcular Fecha de Ingreso (hoy en formato Excel)
    const hoy = new Date();
    nuevoVoluntario['Fecha de ingreso'] = convertirFechaExcel(hoy.toISOString().split('T')[0]);

    // Asignar Edad
    nuevoVoluntario.Edad = edad;
    nuevoVoluntario['Edad de ingreso a CRC'] = edad;
    nuevoVoluntario.Antigüedad = 0;

    // Campos por defecto
    nuevoVoluntario['Instructores de PPAA Básico'] = 0;
    nuevoVoluntario['Instructores de PPAA Avanzado'] = 0;
    nuevoVoluntario['Instructores doctrina'] = 0;

    // Validaciones
    if (!nuevoVoluntario.RUT) {
      return res.status(400).json({ error: 'RUT es requerido' });
    }
    if (!nuevoVoluntario['Nombres voluntario']) {
      return res.status(400).json({ error: 'Nombres es requerido' });
    }
    if (!nuevoVoluntario['Apellidos voluntarios']) {
      return res.status(400).json({ error: 'Apellidos es requerido' });
    }
    if (!nuevoVoluntario.Filial) {
      return res.status(400).json({ error: 'Filial es requerida' });
    }
    if (!nuevoVoluntario.Género) {
      return res.status(400).json({ error: 'Género es requerido' });
    }

    // Verificar que no exista un voluntario con el mismo RUT
    const voluntarioExistente = await db.collection('Datos voluntarios').findOne({ 
      RUT: nuevoVoluntario.RUT 
    });

    if (voluntarioExistente) {
      return res.status(409).json({ error: 'Ya existe un voluntario con este RUT' });
    }

    // Guardar en BD
    const resultado = await db.collection('Datos voluntarios').insertOne(nuevoVoluntario);

    console.log('✅ Voluntario creado:', nuevoVoluntario['Nombres voluntario'], nuevoVoluntario.RUT, 'por', req.user.email);

    res.status(201).json({
      mensaje: 'Voluntario creado exitosamente',
      voluntarioId: resultado.insertedId,
      voluntario: nuevoVoluntario
    });

  } catch (error) {
    console.error('❌ Error creando voluntario:', error.message);
    res.status(500).json({ 
      error: 'Error creando voluntario',
      message: error.message 
    });
  }
});

// DELETE - Eliminar un voluntario
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Obtener el voluntario antes de eliminarlo
    const voluntario = await db.collection('Datos voluntarios').findOne({ _id: new ObjectId(id) });

    if (!voluntario) {
      return res.status(404).json({ error: 'Voluntario no encontrado' });
    }

    // Validar permisos según rol
    if (req.user.rol === 'presidente') {
      if (voluntario.Filial !== req.user.filial) {
        return res.status(403).json({ 
          error: 'No tiene permisos para eliminar voluntarios de otra filial' 
        });
      }
    }

    if (req.user.rol === 'sede_regional') {
      const filiales = await db.collection('Datos filial').find({ 
        'Sede regional': req.user.region 
      }).toArray();
      
      const nombreFiliales = filiales.map(f => f.Filial);
      
      if (!nombreFiliales.includes(voluntario.Filial)) {
        return res.status(403).json({ 
          error: 'No tiene permisos para eliminar voluntarios de otra región' 
        });
      }
    }

    // Eliminar de la BD
    const result = await db.collection('Datos voluntarios').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Voluntario no encontrado' });
    }

    console.log('✅ Voluntario eliminado:', voluntario['Nombres voluntario'], voluntario.RUT, 'por', req.user.email);

    res.json({ 
      mensaje: 'Voluntario eliminado exitosamente',
      voluntario: {
        nombre: voluntario['Nombres voluntario'],
        rut: voluntario.RUT
      }
    });

  } catch (error) {
    console.error('❌ Error eliminando voluntario:', error.message);
    res.status(500).json({ 
      error: 'Error eliminando voluntario',
      message: error.message 
    });
  }
});

module.exports = router;
