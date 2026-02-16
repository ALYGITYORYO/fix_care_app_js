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
        res.send('Dashboard - Aquí irá el contenido principal');
    },

    // Método para obtener datos (ejemplo)
    getDatos: (req, res) => {
        res.json({ 
            mensaje: 'Controlador funcionando correctamente',
            estado: 'conectado',
            fecha: new Date()
        });
    }
};

module.exports = mainController;