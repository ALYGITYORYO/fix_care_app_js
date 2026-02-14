// control/routes.js (este es el router)
const express = require('express');
const router = express.Router();
const mainController = require('./mainController'); // Importamos el controlador real
const usuarioController = require('./usuarioController'); // Importamos el controlador de usuarios
// Ruta para la página principal
router.get('/', mainController.getIndex);
router.get('/', mainController.getUser);


// ============ API DE USUARIOS ============
// Obtener todos los usuarios (para el grid)
router.get('/api/usuarios', usuarioController.getUsuarios);

// Obtener un usuario por ID
router.get('/api/usuarios/:id', usuarioController.getUsuario);

// Crear usuario (POST)
router.post('/api/usuarios', usuarioController.createUsuario);

// Actualizar usuario (PUT)
router.put('/api/usuarios/:id', usuarioController.updateUsuario);

// Eliminar usuario (DELETE)
router.delete('/api/usuarios/:id', usuarioController.deleteUsuario);

// Servir fotos de usuarios
router.get('/api/fotos/:filename', usuarioController.servePhoto);

// Ruta para el dashboard (la usaremos después)
router.get('/dashboard', mainController.getDashboard);

// Ruta para verificar que todo funciona (API)
router.get('/api/status', mainController.getDatos);

module.exports = router;