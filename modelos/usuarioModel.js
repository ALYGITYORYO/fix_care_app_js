// modelos/usuarioModel.js
const conexion = require('../bd/conexion');
const bcrypt = require('bcryptjs'); // Instalar: npm install bcryptjs

const UsuarioModel = {
    // Obtener todos los usuarios
    getAll: (callback) => {
        const query = `
            SELECT id, nombre, apepat, user, correo, rol, menu,
                   DATE_FORMAT(usuario_creado, '%Y-%m-%d %H:%i:%s') as usuario_creado,
                   DATE_FORMAT(usuario_actualizado, '%Y-%m-%d %H:%i:%s') as usuario_actualizado
            FROM usuario
            ORDER BY id DESC
        `;
        conexion.query(query, callback);
    },

    // Obtener usuario por ID
    getById: (id, callback) => {
        const query = 'SELECT * FROM usuario WHERE id = ?';
        conexion.query(query, [id], callback);
    },

    // Crear usuario
    create: (usuario, callback) => {
        // Encriptar contraseña
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(usuario.password, salt);
        
        const query = `
            INSERT INTO usuario 
            (nombre, apepat, apemat, correo, cel, user, password, rol, menu, img, usuario_creado, usuario_actualizado, id_organizacion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)
        `;
        
        const values = [
            usuario.nombre,
            usuario.apepat,
            usuario.apemat || null,
            usuario.correo,
            usuario.cel || null,
            usuario.user,
            hash,
            usuario.rol,
            usuario.menu || null,
            usuario.img || null,
            usuario.id_organizacion || null
        ];
        
        conexion.query(query, values, callback);
    },

    // Actualizar usuario
    update: (id, usuario, callback) => {
        let query = `
            UPDATE usuario 
            SET nombre = ?, apepat = ?, apemat = ?, correo = ?, cel = ?, rol = ?, id_organizacion = ?
        `;
        let values = [
            usuario.nombre,
            usuario.apepat,
            usuario.apemat || null,
            usuario.correo,
            usuario.cel || null,
            usuario.rol,
            usuario.id_organizacion || null
        ];

        // Si hay nueva contraseña
        if (usuario.password) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(usuario.password, salt);
            query += ', password = ?';
            values.push(hash);
        }

        // Si hay menús
        if (usuario.menu) {
            query += ', menu = ?';
            values.push(usuario.menu);
        }
        // Si hay imagen
        if (usuario.img) {
            query += ', img = ?';
            values.push(usuario.img);
        }

        query += ' WHERE id = ?';
        values.push(id);

        conexion.query(query, values, callback);
    },

    // Eliminar usuario
    delete: (id, callback) => {
        const query = 'DELETE FROM usuario WHERE id = ?';
        conexion.query(query, [id], callback);
    },

    // Verificar usuario (login)
    verifyUser: (user, callback) => {
        const query = 'SELECT * FROM usuario WHERE user = ? OR correo = ?';
        conexion.query(query, [user, user], callback);
    }
};

module.exports = UsuarioModel;