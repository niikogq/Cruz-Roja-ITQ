const cron = require('node-cron');

// Función para actualizar edades y antigüedad
async function actualizarEdadesYAntiguedad(db) {
  try {
    console.log('⏰ Iniciando actualización automática de edades...');
    
    const voluntarios = await db.collection('Datos voluntarios').find({}).toArray();
    let actualizados = 0;

    for (const voluntario of voluntarios) {
      const updates = {};
      let needsUpdate = false;

      // Calcular edad si tiene fecha de nacimiento
      if (voluntario['Fecha nacimiento']) {
        const fechaNac = excelDateToJSDate(voluntario['Fecha nacimiento']);
        const edad = calcularEdad(fechaNac);
        
        if (edad !== voluntario.Edad) {
          updates.Edad = edad;
          needsUpdate = true;
        }
      }

      // Calcular antigüedad si tiene fecha de ingreso
      if (voluntario['Fecha de ingreso']) {
        const fechaIng = excelDateToJSDate(voluntario['Fecha de ingreso']);
        const antiguedad = calcularAntiguedad(fechaIng);
        
        if (antiguedad !== voluntario.Antigüedad) {
          updates.Antigüedad = antiguedad;
          needsUpdate = true;
        }
      }

      // Actualizar solo si cambió algo
      if (needsUpdate) {
        await db.collection('Datos voluntarios').updateOne(
          { _id: voluntario._id },
          { $set: updates }
        );
        actualizados++;
      }
    }

    console.log(`✅ Actualización automática completada: ${actualizados} voluntarios actualizados`);
    return { actualizados, total: voluntarios.length };

  } catch (error) {
    console.error('❌ Error en actualización automática:', error);
    throw error;
  }
}

// Funciones helper
function excelDateToJSDate(serial) {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = (utc_days + 1) * 86400;
  return new Date(utc_value * 1000);
}

function calcularEdad(fechaNacimiento) {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mes = hoy.getMonth() - fechaNacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
    edad--;
  }
  
  return Math.max(0, edad);
}

function calcularAntiguedad(fechaIngreso) {
  const hoy = new Date();
  let años = hoy.getFullYear() - fechaIngreso.getFullYear();
  const mes = hoy.getMonth() - fechaIngreso.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaIngreso.getDate())) {
    años--;
  }
  
  return Math.max(0, años);
}

// Iniciar cron job
function iniciarCronJobs(db) {
  // Ejecutar todos los días a las 00:00 (medianoche)
  cron.schedule('0 0 * * *', async () => {
    console.log('🕐 Ejecutando cron job: Actualización de edades');
    try {
      await actualizarEdadesYAntiguedad(db);
    } catch (error) {
      console.error('Error en cron job:', error);
    }
  });

  console.log('✅ Cron job configurado: Actualización diaria de edades a las 00:00');
}

module.exports = { iniciarCronJobs, actualizarEdadesYAntiguedad };
