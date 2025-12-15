const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Cargar credenciales usando path.resolve
const serviceAccountPath = path.resolve(__dirname, '../../service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

async function getUserOrgUnitPath(userEmail) {
  try {
    const auth = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/admin.directory.user.readonly'],
      subject: process.env.ADMIN_EMAIL
    });

    const directory = google.admin({ version: 'directory_v1', auth });

    const response = await directory.users.get({
      userKey: userEmail
    });

    console.log(`✅ OrgUnitPath para ${userEmail}: ${response.data.orgUnitPath}`);
    return response.data.orgUnitPath;
  } catch (error) {
    console.error('❌ Error obteniendo orgUnitPath:', error.message);
    throw error;
  }
}

function determinarRol(orgUnitPath) {
  console.log(`🔍 Determinando rol para orgUnitPath: ${orgUnitPath}`);
  
  // Admin en la raíz
  if (orgUnitPath === '/') {
    console.log('✅ Rol asignado: ADMIN');
    return {
      rol: 'admin',
      region: null,
      filial: null
    };
  }

  const partes = orgUnitPath.split('/').filter(p => p);

  // Sede Regional - Nivel 2
  if (partes.length === 2 && partes[0] === 'Comités Regionales') {
    console.log(`✅ Rol asignado: SEDE_REGIONAL - Región: ${partes[1]}`);
    return {
      rol: 'sede_regional',
      region: partes[1],
      filial: null
    };
  }

  // Presidente - Nivel 3
  if (partes.length === 3 && partes[0] === 'Comités Regionales') {
    console.log(`✅ Rol asignado: PRESIDENTE - Región: ${partes[1]}, Filial: ${partes[2]}`);
    return {
      rol: 'presidente',
      region: partes[1],
      filial: partes[2]
    };
  }

  console.log('⚠️ No se pudo determinar rol para este orgUnitPath');
  return null;
}

module.exports = { getUserOrgUnitPath, determinarRol };
