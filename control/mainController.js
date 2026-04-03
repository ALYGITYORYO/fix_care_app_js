// control/mainController.js
const path = require('path');
const { getTickets } = require('./ticketController');

const mainController = {
    // Método para la página principal
    getIndex: (req, res) => {
        res.sendFile(path.join(__dirname, '../views/index.html'));
    },
    getUser: (req, res) => {
        res.sendFile(path.join(__dirname, '../views/alta-usuario.html'));
    },
    getTickets: (req, res) => {
        res.sendFile(path.join(__dirname, '../views/tickets.html'));
    },
    // Método para probar que el controlador funciona, en construccion ajskajska
    getDashboard: (req, res) => {
        res.sendFile(path.join(__dirname, '../views/index.html'));
    },

    // Método para obtener datos (ejemplo)
    getDatos: (req, res) => {
        res.json({ 
            mensaje: 'Controlador funcionando correctamente',
            estado: 'conectado',
            fecha: new Date()
        });
    },

    // Método para obtener estadísticas del dashboard
    getStats: (req, res) => {
        // Aquí puedes agregar consultas para obtener estadísticas reales
        // Por ahora devolvemos datos de ejemplo
        res.json({
            usuarios: 0, // Total de usuarios
            tickets: 0,  // Total de tickets
            organizaciones: 0, // Total de organizaciones
            tickets_abiertos: 0 // Tickets abiertos
        });
    }
};

module.exports = mainController;