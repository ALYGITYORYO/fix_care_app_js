// control/usuarioController.js
const UsuarioModel = require('../modelos/usuarioModel');
const bcrypt = require('bcryptjs');

const usuarioController = {
    // Obtener todos los usuarios (para el grid)
    getUsuarios: (req, res) => {
        UsuarioModel.getAll((err, results) => {
            if (err) {
                console.error('Error:', err);
                return res.status(500).json({ error: 'Error al cargar usuarios' });
            }
            res.json(results);
        });
    },

    // Obtener usuario por ID
    getUsuario: (req, res) => {
        const id = req.params.id;
        UsuarioModel.getById(id, (err, results) => {
            if (err || results.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.json(results[0]);
        });
    },

    // Crear usuario
    createUsuario: (req, res) => {
        const usuario = {
            nombre: req.body.usuario_nombre,
            apepat: req.body.apepat,
            apemat: req.body.usuario_apemat,
            correo: req.body.usuario_email,
            cel: req.body.usuario_cel,
            user: req.body.usuario_usuario,
            password: req.body.usuario_clave_1,
            rol: req.body.usuario_rol,
            menu: req.body.usuario_menu,
            img: req.body.usuario_foto, // expects URL or filename
            id_organizacion: req.body.usuario_organizacion
        };

        UsuarioModel.create(usuario, (err, result) => {
            if (err) {
                console.error('Error:', err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ 
                        error: 'El usuario o correo ya existe' 
                    });
                }
                return res.status(500).json({ error: 'Error al crear usuario' });
            }
            res.json({ 
                success: true, 
                message: 'Usuario creado correctamente',
                id: result.insertId 
            });
        });
    },

    // Actualizar usuario
    updateUsuario: (req, res) => {
        const id = req.body.usuario_id;
        const usuario = {
            nombre: req.body.usuario_nombre,
            apepat: req.body.apepat,
            apemat: req.body.usuario_apemat,
            correo: req.body.usuario_email,
            cel: req.body.usuario_cel,
            rol: req.body.usuario_rol,
            menu: req.body.usuario_menu,
            img: req.body.usuario_foto,
            id_organizacion: req.body.usuario_organizacion
        };

        // Si hay nueva contraseña
        if (req.body.usuario_clave_1) {
            usuario.password = req.body.usuario_clave_1;
        }

        UsuarioModel.update(id, usuario, (err, result) => {
            if (err) {
                console.error('Error:', err);
                return res.status(500).json({ error: 'Error al actualizar usuario' });
            }
            res.json({ 
                success: true, 
                message: 'Usuario actualizado correctamente' 
            });
        });
    },

    // Eliminar usuario
    deleteUsuario: (req, res) => {
        const id = req.params.id;

        UsuarioModel.delete(id, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar usuario' });
            }
            res.json({ success: true, message: 'Usuario eliminado correctamente' });
        });
    }
};

module.exports = usuarioController;