const mysql = require('mysql2');

// Crear la conexión
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'fix_care', 
    port: 3306
});

module.exports = conexion;