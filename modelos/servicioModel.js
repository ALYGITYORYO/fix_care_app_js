// modelo para la tabla servicios
const conexion = require('../bd/conexion');

const ServicioModel = {
    getAll: (callback) => {
        const query = `SELECT idServicios AS id, nombre FROM servicios ORDER BY nombre`;
        conexion.query(query, callback);
    }
};

module.exports = ServicioModel;