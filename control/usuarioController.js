// control/usuarioController.js
const UsuarioModel = require('../modelos/usuarioModel');
const bcrypt = require('bcryptjs');
const multer = require('multer'); // Instalar: npm install multer
const path = require('path');
const fs = require('fs');

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../views/assets/fotos');
        // Crear directorio si no existe
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'user-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mime = allowedTypes.test(file.mimetype);
        
        if (ext && mime) {
            cb(null, true);
        } else {
            cb(new Error('Solo imágenes JPG, JPEG, PNG'));
        }
    }
});

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
        // Multer procesa la imagen
        upload.single('usuario_foto')(req, res, (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            const usuario = {
                nombre: req.body.usuario_nombre,
                apepat: req.body.apepat,
                apemat: req.body.apemat,
                user: req.body.usuario_usuario,
                correo: req.body.usuario_email,
                clave: req.body.usuario_clave_1,
                cel: req.body.usuario_cel,
                rol: req.body.usuario_rol,
                menu: req.body.usuario_menu,
                img: req.file ? req.file.filename : null
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
        });
    },

    // Actualizar usuario
    updateUsuario: (req, res) => {
        upload.single('usuario_foto')(req, res, (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            const id = req.body.usuario_id;
            const usuario = {
                nombre: req.body.usuario_nombre,
                apepat: req.body.apepat,
                apemat: req.body.apemat,
                correo: req.body.usuario_email,
                cel: req.body.usuario_cel,
                rol: req.body.usuario_rol,
                menu: req.body.usuario_menu
            };

            // Si hay nueva contraseña
            if (req.body.usuario_clave_1) {
                usuario.clave = req.body.usuario_clave_1;
            }

            // Si hay nueva imagen
            if (req.file) {
                usuario.img = req.file.filename;
                
                // Eliminar imagen anterior si existe y no se va a eliminar
                if (req.body.eliminar_foto !== 'on') {
                    UsuarioModel.getById(id, (err, results) => {
                        if (!err && results[0] && results[0].img) {
                            const oldPath = path.join(__dirname, '../views/assets/fotos', results[0].img);
                            if (fs.existsSync(oldPath)) {
                                fs.unlinkSync(oldPath);
                            }
                        }
                    });
                }
            }

            // Si se marcó eliminar foto
            if (req.body.eliminar_foto === 'on') {
                usuario.img = null;
                
                // Eliminar archivo físico
                UsuarioModel.getById(id, (err, results) => {
                    if (!err && results[0] && results[0].img) {
                        const oldPath = path.join(__dirname, '../views/assets/fotos', results[0].img);
                        if (fs.existsSync(oldPath)) {
                            fs.unlinkSync(oldPath);
                        }
                    }
                });
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
        });
    },

    // Eliminar usuario
    deleteUsuario: (req, res) => {
        const id = req.params.id;
        
        // Obtener info del usuario para eliminar su foto
        UsuarioModel.getById(id, (err, results) => {
            if (!err && results[0] && results[0].img) {
                const oldPath = path.join(__dirname, '../views/assets/fotos', results[0].img);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        });

        UsuarioModel.delete(id, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error al eliminar usuario' });
            }
            res.json({ success: true, message: 'Usuario eliminado correctamente' });
        });
    },

    // Middleware para servir fotos
    servePhoto: (req, res) => {
        const filename = req.params.filename;
        const filepath = path.join(__dirname, '../views/assets/fotos', filename);
        
        if (fs.existsSync(filepath)) {
            res.sendFile(filepath);
        } else {
            res.status(404).send('Foto no encontrada');
        }
    }
};

module.exports = usuarioController;