const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Mapeo de nombres de Google Workspace a nombres en BD
const MAPEO_REGIONES = {
  'Comité Regional Magallanes': 'Magallanes y la Antártica',
  'Región Metropolitana': 'Metropolitana',
  'Comité Regional Valparaiso': 'Valparaíso',
  'Comité Regional de O\'Higgins': 'Bernardo O\'Higgins',
  'Comité Regional del Maule': 'Maule',
  'Comité Regional Bio Bio': 'Biobío y Ñuble',
  'Comité Regional Araucanía': 'Araucanía',
  'Comité Regional de los Rios': 'Los Ríos',
  'Comité Regional De Los Lagos y Aysen': 'Los Lagos y Aysén',
  'Comité Regional Tarapacá, Arica y Parinacota': 'Arica Parinacota Tarapacá',
  'Comité Regional Antofagasta': 'Antofagasta',
  'Comité Regional Atacama - Coquimbo': 'Atacama-Coquimbo'
};

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

    return response.data.orgUnitPath;
  } catch (error) {
    console.error('❌ Error obteniendo orgUnitPath para', userEmail, ':', error.message);
    throw error;
  }
}

function determinarRol(orgUnitPath) {
  // Admin en la raíz
  if (orgUnitPath === '/') {
    return {
      rol: 'admin',
      region: null,
      filial: null
    };
  }

  const partes = orgUnitPath.split('/').filter(p => p);

  // Verificar que empiece con "Comites Regionales"
  if (partes.length < 2 || partes[0] !== 'Comites Regionales') {
    console.warn('⚠️ OrgUnitPath no pertenece a Comites Regionales:', orgUnitPath);
    return null;
  }

  // Sede Regional - Nivel 2
  if (partes.length === 2) {
    const regionGoogleWorkspace = partes[1];
    const regionBD = MAPEO_REGIONES[regionGoogleWorkspace] || regionGoogleWorkspace;
    
    return {
      rol: 'sede_regional',
      region: regionBD,
      filial: null
    };
  }

  // Presidente - Nivel 3
  if (partes.length === 3) {
    const regionGoogleWorkspace = partes[1];
    const regionBD = MAPEO_REGIONES[regionGoogleWorkspace] || regionGoogleWorkspace;
    
    return {
      rol: 'presidente',
      region: regionBD,
      filial: partes[2]
    };
  }

  console.warn('⚠️ No se pudo determinar rol para orgUnitPath:', orgUnitPath);
  return null;
}

module.exports = { getUserOrgUnitPath, determinarRol };
