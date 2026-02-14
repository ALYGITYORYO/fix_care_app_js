// modelos/usuarioModel.js
const conexion = require('../bd/conexion');
const bcrypt = require('bcryptjs'); // Instalar: npm install bcryptjs

const UsuarioModel = {
    // Obtener todos los usuarios
    getAll: (callback) => {
        const query = `
            SELECT id, nombre, apepat, apemat, user, correo, cel, rol, img, menu,
                   DATE_FORMAT(usuario_creado, '%Y-%m-%d %H:%i:%s') as usuario_creado,
                   DATE_FORMAT(usuario_actualizado, '%Y-%m-%d %H:%i:%s') as usuario_actualizado
            FROM usuarios
            ORDER BY id DESC
        `;
        conexion.query(query, callback);
    },

    // Obtener usuario por ID
    getById: (id, callback) => {
        const query = 'SELECT * FROM usuarios WHERE id = ?';
        conexion.query(query, [id], callback);
    },

    // Crear usuario
    create: (usuario, callback) => {
        // Encriptar contraseña
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(usuario.clave, salt);
        
        const query = `
            INSERT INTO usuarios 
            (nombre, apepat, apemat, user, correo, clave, cel, rol, img, menu)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
            usuario.nombre,
            usuario.apepat,
            usuario.apemat,
            usuario.user,
            usuario.correo,
            hash,
            usuario.cel || null,
            usuario.rol,
            usuario.img || null,
            usuario.menu || null
        ];
        
        conexion.query(query, values, callback);
    },

    // Actualizar usuario
    update: (id, usuario, callback) => {
        let query = `
            UPDATE usuarios 
            SET nombre = ?, apepat = ?, apemat = ?, correo = ?, 
                cel = ?, rol = ?
        `;
        let values = [
            usuario.nombre,
            usuario.apepat,
            usuario.apemat,
            usuario.correo,
            usuario.cel || null,
            usuario.rol
        ];

        // Si hay nueva contraseña
        if (usuario.clave) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(usuario.clave, salt);
            query += ', clave = ?';
            values.push(hash);
        }

        // Si hay nueva imagen
        if (usuario.img) {
            query += ', img = ?';
            values.push(usuario.img);
        }

        // Si hay menús
        if (usuario.menu) {
            query += ', menu = ?';
            values.push(usuario.menu);
        }

        query += ' WHERE id = ?';
        values.push(id);

        conexion.query(query, values, callback);
    },

    // Eliminar usuario
    delete: (id, callback) => {
        const query = 'DELETE FROM usuarios WHERE id = ?';
        conexion.query(query, [id], callback);
    },

    // Verificar usuario (login)
    verifyUser: (user, callback) => {
        const query = 'SELECT * FROM usuarios WHERE user = ? OR correo = ?';
        conexion.query(query, [user, user], callback);
    }
};

module.exports = UsuarioModel;