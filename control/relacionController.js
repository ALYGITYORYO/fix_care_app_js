// control/relacionController.js
const RelacionModel = require('../modelos/relacionModel');

const relacionController = {
    vincularEncargado: (req, res) => {
        const { adminId, orgId } = req.body;
        if (!adminId || !orgId) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }
        RelacionModel.addEncargado(adminId, orgId, (err, result) => {
            if (err) {
                console.error('Error creando relación encargado:', err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            res.json({ success: true, id: result.insertId });
        });
    },
    vincularTecnico: (req, res) => {
        const { tecnicoId, orgId } = req.body;
        if (!tecnicoId || !orgId) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }
        RelacionModel.addTecnico(tecnicoId, orgId, (err, result) => {
            if (err) {
                console.error('Error creando relación técnico:', err);
                return res.status(500).json({ error: 'Error en el servidor' });
            }
            res.json({ success: true, id: result.insertId });
        });
    }
};

module.exports = relacionController;