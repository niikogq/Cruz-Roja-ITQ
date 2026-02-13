const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { isAuthenticated } = require('../auth/authMiddleware');

// GET - Obtener todas las filiales (PROTEGIDO)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const filiales = await db.collection('Datos filial').find({}).toArray();
    res.json(filiales);
  } catch (error) {
    console.error('Error obteniendo filiales:', error);
    res.status(500).json({ error: 'Error obteniendo filiales.' });
  }
});

// PATCH - Actualizar comentario de una filial (PROTEGIDO)
router.patch('/:id', isAuthenticated, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const { Comentarios } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const result = await db.collection('Datos filial').updateOne(
      { _id: new ObjectId(id) },
      { $set: { Comentarios } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Filial no encontrada' });
    }
    
    res.json({ mensaje: 'Comentario actualizado' });
  } catch (error) {
    console.error('Error en PATCH /api/filiales/:id:', error);
    res.status(500).json({ error: 'Error actualizando filial: ' + error.message });
  }
});

module.exports = router;
