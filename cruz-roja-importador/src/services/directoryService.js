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

  console.log('📊 Partes del path:', partes);

  // Verificar que empiece con "Comites Regionales"
  if (partes.length < 2 || partes[0] !== 'Comites Regionales') {
    console.log('⚠️ No pertenece a Comites Regionales');
    return null;
  }

  // Sede Regional - Nivel 2
  if (partes.length === 2) {
    const regionGoogleWorkspace = partes[1];
    const regionBD = MAPEO_REGIONES[regionGoogleWorkspace] || regionGoogleWorkspace;
    
    console.log(`✅ Rol asignado: SEDE_REGIONAL - Región GW: ${regionGoogleWorkspace}, Región BD: ${regionBD}`);
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
    
    console.log(`✅ Rol asignado: PRESIDENTE - Región GW: ${regionGoogleWorkspace}, Región BD: ${regionBD}, Filial: ${partes[2]}`);
    return {
      rol: 'presidente',
      region: regionBD,
      filial: partes[2]
    };
  }

  console.log('⚠️ No se pudo determinar rol para este orgUnitPath');
  return null;
}

module.exports = { getUserOrgUnitPath, determinarRol };
