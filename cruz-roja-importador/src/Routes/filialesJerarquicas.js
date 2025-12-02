const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://ngalloquinchen_db_user:cs9zcjsQEayMMCIm@cruzroja.twuyd12.mongodb.net/?appName=cruzroja';
const DB_NAME = 'cruz_roja_app';

router.get('/', async (req, res) => {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    const voluntarios = await db.collection('Datos voluntarios').find({}).toArray();
    
    // Agrupar SIMPLEMENTE por Filial (sin sedes complejas)
    const filialesMap = {};
    
    voluntarios.forEach(v => {
      if (v.Filial) {
        const filial = v.Filial;
        if (!filialesMap[filial]) {
          filialesMap[filial] = {
            nombre: filial,
            totalVoluntarios: 0,
            activos: 0,
            llamada: 0,
            hombres: 0,
            mujeres: 0
          };
        }
        filialesMap[filial].totalVoluntarios++;
        
        const calidad = v['Calidad de voluntario'];
        const genero = v.Género || v['Género'];
        
        if (calidad === 'Activo') filialesMap[filial].activos++;
        if (calidad === 'Llamada') filialesMap[filial].llamada++;
        if (genero === 'M') filialesMap[filial].hombres++;
        if (genero === 'F') filialesMap[filial].mujeres++;
      }
    });
    
    const filiales = Object.values(filialesMap)
      .filter(f => f.totalVoluntarios > 0)
      .sort((a, b) => b.totalVoluntarios - a.totalVoluntarios);
    
    // Crear estructura simple: una "sede" con todas las filiales
    const jerarquia = [{
      sede: 'TODAS LAS REGIONES',
      totalVoluntarios: filiales.reduce((acc, f) => acc + f.totalVoluntarios, 0),
      filiales
    }];
    
    res.json(jerarquia);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error generando jerarquía' });
  } finally {
    await client.close();
  }
});

module.exports = router;
