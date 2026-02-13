const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { isAuthenticated, aplicarFiltrosRol } = require('../auth/authMiddleware');

// GET - Obtener todas las filiales (PROTEGIDO + FILTRADO)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Obtener filtros según el rol del usuario
    const filtros = aplicarFiltrosRol(req);
    
    console.log('📊 Filtros aplicados en filiales para', req.user.email, ':', filtros);
    
    // Aplicar filtros a la consulta
    let query = {};
    if (filtros.filial) {
      // Presidente: solo su filial
      query.Filial = filtros.filial;
    } else if (filtros.region) {
      // Sede Regional: solo filiales de su región
      query['Sede regional'] = filtros.region;
    }
    // Admin: sin filtros (query vacío = todas)
    
    const filiales = await db.collection('Datos filial').find(query).toArray();
    
    console.log(`✅ Filiales retornadas: ${filiales.length}`);
    
    res.json(filiales);
  } catch (error) {
    console.error('Error obteniendo filiales:', error);
    res.status(500).json({ error: 'Error obteniendo filiales.' });
  }
});

// PATCH - Actualizar comentario de una filial (PROTEGIDO + VALIDADO)
router.patch('/:id', isAuthenticated, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { Comentarios } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    // Verificar que la filial existe
    const filial = await db.collection('Datos filial').findOne({ _id: new ObjectId(id) });
    
    if (!filial) {
      return res.status(404).json({ error: 'Filial no encontrada' });
    }

    // Verificar permisos: presidente solo puede editar su filial
    if (req.user.rol === 'presidente' && filial.Filial !== req.user.filial) {
      return res.status(403).json({ error: 'No tiene permisos para editar esta filial' });
    }

    // Verificar permisos: sede regional solo puede editar filiales de su región
    if (req.user.rol === 'sede_regional' && filial['Sede regional'] !== req.user.region) {
      return res.status(403).json({ error: 'No tiene permisos para editar filiales de otra región' });
    }

    const result = await db.collection('Datos filial').updateOne(
      { _id: new ObjectId(id) },
      { $set: { Comentarios } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Filial no encontrada' });
    }
    
    console.log('✅ Comentario actualizado por', req.user.email, 'en filial:', filial.Filial);
    
    res.json({ mensaje: 'Comentario actualizado' });
  } catch (error) {
    console.error('Error en PATCH /api/filiales/:id:', error);
    res.status(500).json({ error: 'Error actualizando filial: ' + error.message });
  }
});

module.exports = router;
