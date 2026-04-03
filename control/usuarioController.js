// control/usuarioController.js
const UsuarioModel = require('../modelos/usuarioModel');
const bcrypt = require('bcryptjs');
const authMiddleware = require('../middleware/auth');

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
            nombre: (req.body.usuario_nombre || '').trim(),
            apepat: (req.body.apepat || '').trim(),
            apemat: (req.body.usuario_apemat || '').trim(),
            correo: (req.body.usuario_email || '').trim(),
            cel: (req.body.usuario_cel || '').trim(),
            user: (req.body.usuario_usuario || '').trim(),
            password: (req.body.usuario_clave_1 || '').trim(),
            rol: (req.body.usuario_rol || 'usuario').trim(),
            menu: req.body.usuario_menu || '[]',
            img: req.body.usuario_foto || '', // expects URL or filename
            id_organizacion: req.body.usuario_organizacion || 0
        };

        // Validaciones mínimas para columnas NOT NULL
        if (!usuario.nombre || !usuario.apepat || !usuario.correo || !usuario.user || !usuario.password || !usuario.rol) {
            return res.status(400).json({ error: 'Faltan campos requeridos para crear usuario' });
        }

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
    },

    // Login de usuario
    login: (req, res) => {
        const { user, password } = req.body;

        if (!user || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
        }

        UsuarioModel.verifyUser(user, (err, results) => {
            if (err) {
                console.error('Error en login:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
            }

            const usuario = results[0];

            // Si la contraseña almacenada es plain (no bcrypt), permitimos login y la migramos a hash
            const isBcryptHash = /^\$2[aby]\$/.test(usuario.password);
            let passwordMatches = false;

            if (isBcryptHash) {
                passwordMatches = bcrypt.compareSync(password, usuario.password);
            } else {
                // contraseña plana en DB (migración / compatibilidad)
                passwordMatches = usuario.password === password;
            }

            if (!passwordMatches) {
                return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
            }

            // Si estaba en texto plano, actualizar a hash en DB
            if (!isBcryptHash) {
                UsuarioModel.updatePassword(usuario.id, password, (err) => {
                    if (err) {
                        console.warn('No se pudo migrar password a hash para id', usuario.id, err);
                    }
                });
            }

            // Generar token JWT
            try {
                const token = authMiddleware.generateToken(usuario);

                res.json({
                    success: true,
                    message: 'Login exitoso',
                    token: token,
                    user: {
                        id: usuario.id,
                        nombre: usuario.nombre,
                        user: usuario.user,
                        rol: usuario.rol,
                        menu: usuario.menu
                    }
                });
            } catch (error) {
                console.error('Error generando token:', error);
                return res.status(500).json({ error: 'Error generando token de autenticación' });
            }
        });
    },

    // Verificar token (para frontend)
    verifyToken: (req, res) => {
        // El middleware ya verificó el token, solo devolver los datos del usuario
        res.json({
            success: true,
            user: req.user
        });
    }
};

module.exports = usuarioController;