const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://ngalloquinchen_db_user:cs9zcjsQEayMMCIm@cruzroja.twuyd12.mongodb.net/?appName=cruzroja';
const DB_NAME = 'cruz_roja_app';

router.post('/', async (req, res) => {
  const client = new MongoClient(MONGODB_URI, { useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    const voluntarios = await db.collection('Datos voluntarios').find({}).toArray();
    const hoy = new Date();
    let actualizados = 0;

    const updates = [];
    
    for (const v of voluntarios) {
      const updateDoc = {};
      
      // Calcular Edad desde Fecha nacimiento (formato Excel)
      if (v['Fecha nacimiento']) {
        const fechaNacimiento = excelDateToJSDate(v['Fecha nacimiento']);
        if (!isNaN(fechaNacimiento.getTime())) {
          const edad = Math.floor((hoy - fechaNacimiento) / (365.25 * 24 * 60 * 60 * 1000));
          updateDoc.Edad = Math.max(0, edad); // Evitar edades negativas
        }
      }
      
      // Calcular Antigüedad desde Fecha de ingreso
      if (v['Fecha de ingreso']) {
        const fechaIngreso = excelDateToJSDate(v['Fecha de ingreso']);
        if (!isNaN(fechaIngreso.getTime())) {
          const antiguedad = Math.floor((hoy - fechaIngreso) / (365.25 * 24 * 60 * 60 * 1000));
          updateDoc['Antigüedad'] = Math.max(0, antiguedad);
        }
      }
      
      // Si hay algo que actualizar
      if (Object.keys(updateDoc).length > 0) {
        updates.push({
          updateOne: {
            filter: { _id: new ObjectId(v._id) },
            update: { $set: updateDoc }
          }
        });
        actualizados++;
      }
    }

    let resultado = { mensaje: 'No se encontraron fechas para actualizar', modificados: 0 };
    
    if (updates.length > 0) {
      const bulkResult = await db.collection('Datos voluntarios').bulkWrite(updates, { ordered: false });
      resultado = { 
        mensaje: `✅ Actualizadas ${actualizados} edades/antigüedades de ${voluntarios.length} voluntarios`,
        modificados: bulkResult.modifiedCount,
        totalProcesados: voluntarios.length
      };
    }
    
    res.json(resultado);
  } catch (error) {
    console.error('Error actualizando edades:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    await client.close();
  }
});

// Función para convertir fecha Excel
function excelDateToJSDate(serial) {
  try {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    
    const fractional_day = serial - Math.floor(serial);
    const total_seconds = Math.floor(86400 * fractional_day);
    
    const seconds = total_seconds % 60;
    let temp = total_seconds - seconds;
    const hours = Math.floor(temp / (60 * 60));
    temp = temp - (hours * 60 * 60);
    const minutes = Math.floor(temp / 60);
    
    date_info.setHours(hours);
    date_info.setMinutes(minutes);
    date_info.setSeconds(seconds);
    
    return date_info;
  } catch (e) {
    return null;
  }
}

module.exports = router;
