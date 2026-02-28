const mysql = require('mysql2'); // Importar mysql2 para conexión a MySQL
//conexión a la base de datos MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'fix_care'
});
//comprobar la conexión a MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error MySQL:', err);
        return;
    }
    console.log('Conectado a MySQL');
});

module.exports = connection;