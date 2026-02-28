// control/organizacionController.js
const OrganizacionModel = require('../modelos/organizacionModel');

const organizacionController = {
    getOrganizaciones: (req, res) => {
        OrganizacionModel.getAll((err, results) => {
            if (err) {
                console.error('Error cargando organizaciones:', err);
                return res.status(500).json({ error: 'Error al cargar organizaciones' });
            }
            res.json(results);
        });
    },
    getOrganizacion: (req, res) => {
        const id = req.params.id;
        OrganizacionModel.getById(id, (err, results) => {
            if (err || results.length === 0) {
                return res.status(404).json({ error: 'Organización no encontrada' });
            }
            res.json(results[0]);
        });
    },
    createOrganizacion: (req, res) => {
        const org = {
            nombre: req.body.nombre,
            tipo: req.body.tipo,
            logo: req.body.logo // opcional, podría ser ruta de archivo
        };
        if (!org.nombre || !org.tipo) {
            return res.status(400).json({ error: 'Faltan datos de organización' });
        }
        OrganizacionModel.create(org, (err, result) => {
            if (err) {
                console.error('Error creando organización:', err);
                return res.status(500).json({ error: 'Error al crear organización' });
            }
            res.status(201).json({ success: true, id: result.insertId });
        });
    },
    updateOrganizacion: (req, res) => {
        const id = req.params.id;
        const org = {
            nombre: req.body.nombre,
            tipo: req.body.tipo,
            logo: req.body.logo || null
        };
        OrganizacionModel.update(id, org, (err, result) => {
            if (err) {
                console.error('Error actualizando organización:', err);
                return res.status(500).json({ error: 'Error al actualizar organización' });
            }
            res.json({ success: true });
        });
    },
    deleteOrganizacion: (req, res) => {
        const id = req.params.id;
        OrganizacionModel.delete(id, (err, result) => {
            if (err) {
                console.error('Error eliminando organización:', err);
                return res.status(500).json({ error: 'Error al eliminar organización' });
            }
            res.json({ success: true });
        });
    }
};

module.exports = organizacionController;