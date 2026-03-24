const express = require('express');
const router = express.Router();
const { isAuthenticated, aplicarFiltrosRol } = require('../auth/authMiddleware');

// GET - Obtener filiales con totales de voluntarios (PROTEGIDO + FILTRADO)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const db = req.app.locals.db;

    // Obtener filtros según el rol del usuario
    const filtros = aplicarFiltrosRol(req);

    // Construir el $match según el rol
    let matchStage = {};
    if (filtros.filial) {
      matchStage.Filial = filtros.filial;
    } else if (filtros.region) {
      matchStage['Sede regional'] = filtros.region;
    }

    const pipeline = [];
    
    // Agregar $match solo si hay filtros
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Agregar resto del pipeline
    pipeline.push(
      {
        $lookup: {
          from: "Datos voluntarios",
          localField: "Filial",
          foreignField: "Filial",
          as: "voluntarios"
        }
      },
      {
        $addFields: {
          "Voluntarios activos": {
            $size: {
              $filter: {
                input: "$voluntarios",
                as: "v",
                cond: { $eq: ["$$v.Calidad de voluntario", "Activo"] }
              }
            }
          },
          "Voluntarios de llamada": {
            $size: {
              $filter: {
                input: "$voluntarios",
                as: "v",
                cond: { $eq: ["$$v.Calidad de voluntario", "Llamada"] }
              }
            }
          }
        }
      },
      {
        $project: {
          voluntarios: 0
        }
      }
    );

    const filialesAgregadas = await db.collection('Datos filial').aggregate(pipeline).toArray();

    res.json(filialesAgregadas);
  } catch (error) {
    console.error('❌ Error en /api/filialesTotals:', error.message);
    res.status(500).json({ error: 'Error obteniendo filiales con totales' });
  }
});

module.exports = router;
