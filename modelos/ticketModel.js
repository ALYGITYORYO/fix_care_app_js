//modelo para los tickets
const conexion = require('../bd/conexion');

const TicketModel = {
    // Obtener todos los tickets
    getAll: (callback) => {
        const query = `
        SELECT 
            t.idTicket,
            t.fecha,
            CONCAT(u.nombre, ' ', u.apepat) AS usuario_solicitante,
            u.correo AS correo_usuario,
            e.nombre AS edificio,
            s.nombre AS tipo_servicio,
            t.area,
            t.problematica AS descripcion_problema,
            t.estado,
            t.img
        FROM ticket t
        INNER JOIN usuario u ON t.idUsuario = u.id
        INNER JOIN edificio e ON t.idEdificio = e.idEdificio
        INNER JOIN servicios s ON t.idServicio = s.idServicios
        ORDER BY t.fecha DESC`;
        conexion.query(query, callback);},

        //obtener ticket por estado
        getByEstado: (estado, callback) => {
        const query = `
            SELECT 
            t.idTicket,
            t.fecha,
            CONCAT(u.nombre, ' ', u.apepat) AS usuario_solicitante,
            e.nombre AS edificio,
            s.nombre AS tipo_servicio,
            t.area,
            t.problematica AS descripcion_problema,
            t.estado
            FROM ticket t
            INNER JOIN usuario u ON t.idUsuario = u.id
            INNER JOIN edificio e ON t.idEdificio = e.idEdificio
            INNER JOIN servicios s ON t.idServicio = s.idServicios
            WHERE t.estado = ?
            ORDER BY t.fecha DESC`;
        conexion.query(query, [estado], callback);},

        //crear ticket
        create: (ticket, callback) => {
        const query = `
            INSERT INTO ticket (idUsuario, idEdificio, fecha, idServicio, area, problematica, estado, img)
            VALUES (?, ?, NOW(), ?, ?, ?, 'Abierto', '')`;
        const params = [ticket.idUsuario, ticket.idEdificio, ticket.idServicio, ticket.area, ticket.problematica];
        conexion.query(query, params, callback);},

        //actualizar ticket
        update: (id, ticket, callback) => {
        const query = `
            UPDATE ticket 
            SET 
                idEdificio = ?,
                idServicio = ?,
                area = ?,
                problematica = ?,
                estado = ?,
                img = ?
            WHERE idTicket = ?;`;
        const params = [ticket.idEdificio, ticket.idServicio, ticket.area, ticket.problematica, ticket.estado, ticket.img, id];
        conexion.query(query, params, callback);}
};

module.exports = TicketModel;