// modelo para relaciones entre usuarios y organizaciones
const conexion = require('../bd/conexion');

const RelacionModel = {
    addEncargado: (adminId, orgId, callback) => {
        const query = `INSERT INTO relacion_encargado (id_admin, id_organizacion) VALUES (?, ?)`;
        conexion.query(query, [adminId, orgId], callback);
    },
    addTecnico: (tecnicoId, orgId, callback) => {
        const query = `INSERT INTO tecnico_organizaciones (id_tecnico, id_organizaciones) VALUES (?, ?)`;
        conexion.query(query, [tecnicoId, orgId], callback);
    }
};

module.exports = RelacionModel;