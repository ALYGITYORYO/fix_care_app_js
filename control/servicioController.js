// control/servicioController.js
const ServicioModel = require('../modelos/servicioModel');

const servicioController = {
    getServicios: (req, res) => {
        ServicioModel.getAll((err, results) => {
            if (err) {
                console.error('Error obteniendo servicios:', err);
                return res.status(500).json({ error: 'Error al cargar servicios' });
            }
            res.json(results);
        });
    }
};

module.exports = servicioController;