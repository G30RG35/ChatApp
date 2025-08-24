// archivo: db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'sa',
  password: 'S1stemas',
  database: 'ChatApp'
});

connection.connect(err => {
  if (err) {
    console.error('Error de conexión:', err);
    return;
  }
  console.log('Conectado a MySQL ✅');
});

module.exports = connection;
