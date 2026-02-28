//Controller de ticket
const ticketModel = require('../modelos/ticketModel');
const multer = require('multer'); // Instalar: npm install multer
const path = require('path');
const fs = require('fs');

//configurar multer para subir imagenes sobre el ticket generado
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../views/assets/fotosTickets');
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

//Controlodor para los tickets
const ticketController = {
    // Obtener todos los tickets
    getTickets: (req, res) => {
        ticketModel.getAll((err, results) => {
            if (err) {
                console.error('Error al obtener tickets:', err);
                return res.status(500).json({ error: 'Error al obtener tickets' });
            }
            res.json(results);
        });
    },
    // Crear un nuevo ticket
    createTicket: (req, res) => {
        // Mapear nombres de parámetros que vienen desde el frontend
        const { usuarioId, servicioId, area, problematica } = req.body;
        
        // Validar datos
        if (!usuarioId || !servicioId || !area || !problematica) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }
        
        const newTicket = {
            idUsuario: usuarioId,
            idServicio: servicioId,
            area: area,
            problematica: problematica
        };
        
        ticketModel.create(newTicket, (err, results) => {
            if (err) {
                console.error('Error al crear ticket:', err);
                return res.status(500).json({ error: 'Error al crear ticket', details: err.message });
            }
            res.status(201).json({ 
                message: 'Ticket creado exitosamente', 
                ticket: results 
            });
        });
    },
    // Actualizar un ticket 
    updateTicket: (req, res) => {
        const { id } = req.params;
        const { idServicio, area, problematica, estado } = req.body;
        
        const ticketUpdate = { 
            idServicio: idServicio, 
            area: area, 
            problematica: problematica, 
            estado: estado,
            img: ''
        };
        
        ticketModel.update(id, ticketUpdate, (err, results) => {
            if (err) {
                console.error('Error al actualizar ticket:', err);
                return res.status(500).json({ error: 'Error al actualizar ticket' });
            }
            res.json({ message: 'Ticket actualizado exitosamente', ticket: results });
        });
    },
    // Obtener estadísticas de tickets
    getEstadisticas: (req, res) => {
        ticketModel.getAll((err, tickets) => {
            if (err) {
                console.error('Error al obtener estadísticas:', err);
                return res.status(500).json({ error: 'Error al obtener estadísticas' });
            }
            
            // Contar tickets por estado
            const stats = {
                abiertos: 0,
                proceso: 0,
                pendientes: 0,
                completos: 0
            };
            
            tickets.forEach(ticket => {
                if (ticket.estado === 'Abierto') stats.abiertos++;
                else if (ticket.estado === 'En Proceso') stats.proceso++;
                else if (ticket.estado === 'Pendiente') stats.pendientes++;
                else if (ticket.estado === 'Completo') stats.completos++;
            });
            
            res.json(stats);
        });
    },
    // Subir imagen de un ticket
    uploadTicketImage: upload.single('imagen') // Middleware para subir imagen
};

module.exports = ticketController;module.exports = ticketController;