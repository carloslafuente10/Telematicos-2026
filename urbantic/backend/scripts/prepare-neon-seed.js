const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcrypt');

const seedDirectory = path.resolve(__dirname, '../../database/init');
const original = fs.readFileSync(path.join(seedDirectory, '01_schema.sql'), 'utf8');
const demoPassword = crypto.randomBytes(24).toString('base64url');
const demoHash = bcrypt.hashSync(demoPassword, 12);
const existingHash = '$2b$10$Av2hvAl07GugAX.Z0OQeJe8JhttjL7JNMR63n5IO4MiXtRKFOoPqW';

if (original.split(existingHash).length - 1 !== 3) {
  throw new Error('El SQL de usuarios cambio; revisa el hash antes de preparar Neon.');
}

const users = [
  'administrador@urbantic.test',
  'tecnico@urbantic.test',
  'ciudadano@urbantic.test'
];

const sql = original.replaceAll(existingHash, demoHash) + '\n' +
  `UPDATE users SET password_hash = '${demoHash}' WHERE email IN (${users.map((email) => `'${email}'`).join(', ')});\n`;

fs.writeFileSync(path.join(seedDirectory, 'neon_seed.local.sql'), sql, { flag: 'w', mode: 0o600 });
fs.writeFileSync(path.join(seedDirectory, 'neon_password.local.txt'),
  `Cuentas demo: ${users.join(', ')}\nContrasena compartida: ${demoPassword}\n`,
  { flag: 'w', mode: 0o600 });

console.log('SQL y contrasena local preparados en database/init/.');
