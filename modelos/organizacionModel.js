// modelo para la tabla organizaciones
const conexion = require('../bd/conexion');

const OrganizacionModel = {
    getAll: (callback) => {
        const query = `SELECT id, nombre, tipo, logo FROM organizaciones ORDER BY nombre`;
        conexion.query(query, callback);
    },
    getById: (id, callback) => {
        const query = `SELECT * FROM organizaciones WHERE id = ?`;
        conexion.query(query, [id], callback);
    },
    create: (org, callback) => {
        const query = `INSERT INTO organizaciones (nombre, tipo, logo) VALUES (?, ?, ?)`;
        const params = [org.nombre, org.tipo, org.logo || null];
        conexion.query(query, params, callback);
    },
    update: (id, org, callback) => {
        const query = `UPDATE organizaciones SET nombre = ?, tipo = ?, logo = ? WHERE id = ?`;
        const params = [org.nombre, org.tipo, org.logo || null, id];
        conexion.query(query, params, callback);
    },
    delete: (id, callback) => {
        const query = `DELETE FROM organizaciones WHERE id = ?`;
        conexion.query(query, [id], callback);
    }
};

module.exports = OrganizacionModel;