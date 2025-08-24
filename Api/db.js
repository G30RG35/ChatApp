// archivo: db.js
const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'S1stemas',
  server: 'localhost',
  database: 'ChatApp',
  port: 1433,
  options: {
    encrypt: false, // Cambia a true si usas Azure
    trustServerCertificate: true, // Para desarrollo local
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect
  .then(() => {
    console.log('Conectado a SQL Server ✅');
  })
  .catch(err => {
    console.error('Error de conexión:', err);
  });

module.exports = {
  sql,
  pool,
  poolConnect,
};
