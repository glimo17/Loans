const dotenv = require('dotenv');

dotenv.config();

const parseBool = (value, fallback) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return String(value).toLowerCase() === 'true';
};

const parseSqlConnectionString = (connectionString) => {
  if (!connectionString) {
    return {};
  }

  return connectionString
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const [rawKey, ...rest] = part.split('=');
      if (!rawKey || !rest.length) {
        return acc;
      }

      const key = rawKey.trim().toLowerCase();
      const value = rest.join('=').trim();
      acc[key] = value;
      return acc;
    }, {});
};

const parsedConnectionString = parseSqlConnectionString(process.env.DB_CONNECTION_STRING);

const serverFromEnv = process.env.DB_SERVER || parsedConnectionString.server || 'localhost\\SQLEXPRESS';
const serverParts = serverFromEnv.split('\\');
const serverHost = serverParts[0] || 'localhost';
const instanceName = process.env.DB_INSTANCE || parsedConnectionString.instancename || serverParts[1];
const trustedFromConnStr = parsedConnectionString['trusted_connection'];
const explicitPort = process.env.DB_PORT || parsedConnectionString.port;
const resolvedPort = explicitPort
  ? Number(explicitPort)
  : instanceName
    ? undefined
    : 1433;

const config = {
  port: Number(process.env.PORT || 5000),
  db: {
    user: process.env.DB_USER || parsedConnectionString.user || parsedConnectionString['user id'] || 'Geis',
    password: process.env.DB_PASSWORD || parsedConnectionString.password || '123',
    server: serverHost,
    database: process.env.DB_NAME || parsedConnectionString.database || 'Geis',
    port: resolvedPort,
    options: {
      encrypt: parseBool(process.env.DB_ENCRYPT, false),
      trustServerCertificate: parseBool(process.env.DB_TRUST_SERVER_CERT, true),
      instanceName
    },
    useTrustedConnection: parseBool(process.env.DB_TRUSTED_CONNECTION || trustedFromConnStr, false)
  }
};

module.exports = config;
