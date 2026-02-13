const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../auth/authMiddleware');

// GET - Obtener filiales con totales de voluntarios (PROTEGIDO)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const db = req.app.locals.db;

    const filialesAgregadas = await db.collection('Datos filial').aggregate([
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
    ]).toArray();

    res.json(filialesAgregadas);
  } catch (error) {
    console.error('Error en /api/filialesTotals:', error);
    res.status(500).json({ error: 'Error obteniendo filiales con totales' });
  }
});

module.exports = router;
