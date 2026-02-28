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

// ============ ENDPOINTS DE REFERENCIAS ============
// Servicios (desde BD)
const servicioController = require('./servicioController');
router.get('/api/servicios', servicioController.getServicios);

// Organizaciones (CRUD)
const organizacionController = require('./organizacionController');
router.get('/api/organizaciones', organizacionController.getOrganizaciones);
router.get('/api/organizaciones/:id', organizacionController.getOrganizacion);
router.post('/api/organizaciones', organizacionController.createOrganizacion);
router.put('/api/organizaciones/:id', organizacionController.updateOrganizacion);
router.delete('/api/organizaciones/:id', organizacionController.deleteOrganizacion);

// RELACIONES entre usuarios y organizaciones
const relacionController = require('./relacionController');
router.post('/api/vincular/encargado', relacionController.vincularEncargado);
router.post('/api/vincular/tecnico', relacionController.vincularTecnico);

// ============ FIN ENDPOINTS REFERENCIAS ==============

module.exports = router;