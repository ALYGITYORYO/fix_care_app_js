// control/routes.js (este es el router)
const express = require('express');
const router = express.Router();
const mainController = require('./mainController'); // Importamos el controlador real
const usuarioController = require('./usuarioController'); // Importamos el controlador de usuarios
const ticketController = require('./ticketController'); // Importamos el controlador de tickets
// Ruta para la página principal
router.get('/', mainController.getIndex);

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
//============== FIN API USUARIOS ==============

// ============ API DE TICKETS ============
// Obtener todos los tickets
router.get('/api/tickets', ticketController.getTickets);
// Crear un nuevo ticket
router.post('/api/tickets', ticketController.createTicket);
// Actualizar un ticket
router.put('/api/tickets/:id', ticketController.updateTicket);
// Obtener estadísticas de tickets
router.get('/estadisticas', ticketController.getEstadisticas);
// ============ FIN API TICKETS ==============

// ============ ENDPOINTS ADICIONALES PARA ALTA-TICKET ============
// Obtener edificios (datos de ejemplo o desde BD)
router.get('/api/edificios', (req, res) => {
    res.json([
        { id: 1, nombre: 'Edificio A' },
        { id: 2, nombre: 'Edificio B' },
        { id: 3, nombre: 'Edificio C' }
    ]);
});

// Obtener servicios (datos de ejemplo o desde BD)
router.get('/api/servicios', (req, res) => {
    res.json([
        { id: 1, nombre: 'Mantenimiento' },
        { id: 2, nombre: 'Reparación' },
        { id: 3, nombre: 'Limpieza' }
    ]);
});

module.exports = router;