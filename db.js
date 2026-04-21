const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', 
    database: 'fixcare_db',
    port: 8889        // <-- ¡Línea clave! Especifica el puerto de MAMP

});

connection.connect((err) => {
    if (err) {
        console.error('Error conectando a FixCare DB:', err);
    } else {
        console.log('Conectado exitosamente a fixcare_db');
    }
});

module.exports = connection;