const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const db = require('./db'); // Tu conexión a MySQL
const { sendTicketCreatedEmail, sendTicketAssignedEmail, sendTicketStatusUpdateEmail } = require('./mailService');
const multer = require('multer');
const PdfPrinter = require('pdfmake');
const app = express();
const PORT = 3000;
const JWT_SECRET = 'fixcare_utm_secret_2026';


// --- 1. CONFIGURACIÓN DE ALMACENAMIENTO (FOTOS) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Asegúrate de que esta carpeta exista
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Configuración de fuentes
// IMPORTANTE: Verifica que estas rutas existan en tu carpeta node_modules
const fonts = {
    Roboto: {
        normal: path.join(__dirname,'fonts', 'Roboto-Regular.ttf'),
        bold: path.join(__dirname, 'fonts', 'Roboto-Medium.ttf'),
        italics: path.join(__dirname, 'fonts', 'Roboto-Italic.ttf'),
        bolditalics: path.join(__dirname, 'fonts', 'Roboto-MediumItalic.ttf')
    }
};

// --- EL TRUCO PARA LA VERSIÓN 0.3.7 ---
// Si 'PdfPrinter' te da error de "not a constructor", usamos esta validación:
let printer;
try {
    printer = new PdfPrinter(fonts);
} catch (e) {
    // Algunas versiones de pdfmake requieren acceder a .default
    printer = new PdfPrinter.default(fonts);
}

// --- 2. MIDDLEWARES ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, 'frontend')));

// Middleware de Protección de Rutas
function auth(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'No autorizado' });

    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            ...decoded,
            rol: typeof decoded.rol === 'string' ? decoded.rol.toLowerCase() : decoded.rol
        };
        next();
    } catch (e) {
        res.status(401).json({ error: 'Sesión expirada' });
    }
}

// Middleware para verificar roles específicos
function requireRole(requiredRole) {
    return (req, res, next) => {
        const userRole = req.user && typeof req.user.rol === 'string' ? req.user.rol.toLowerCase() : req.user?.rol;
        if (!req.user || userRole !== requiredRole.toLowerCase()) {
            return res.status(403).json({ error: 'Acceso denegado: rol insuficiente' });
        }
        next();
    };
}






// --- RUTA PARA GENERAR PDF DE TICKETS ---
app.get('/api/reportes/tickets-pdf', auth, (req, res) => {
    // 1. CARGA DE IMÁGENES (Asegúrate de que estas rutas existan)
    let logoUTM = "";
    let logoFixCare = "";
    try {
        const rutaUTM = path.join(__dirname, 'frontend', 'img', 'logo-utm.png');
        const rutaFix = path.join(__dirname, 'frontend', 'img', 'logo3.png');

        if (fs.existsSync(rutaUTM)) {
            logoUTM = `data:image/png;base64,${fs.readFileSync(rutaUTM).toString('base64')}`;
        }
        if (fs.existsSync(rutaFix)) {
            logoFixCare = `data:image/png;base64,${fs.readFileSync(rutaFix).toString('base64')}`;
        }
    } catch (e) {
        console.error("Error cargando logos:", e.message);
    }

    // 2. CONSULTA SQL (Traemos más datos para que se vea completo)
    const sql = `
        SELECT t.id_ticket, t.descripcion, t.prioridad, t.estatus, t.fecha_creacion,
               ub.edificio, ub.piso_area
        FROM tickets t
        JOIN ubicaciones ub ON t.id_ubicacion = ub.id_ubicacion
        ORDER BY t.fecha_creacion DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);

// 3. DEFINICIÓN DEL DOCUMENTO (Versión Institucional con Marca de Agua)
const docDefinition = {
    // --- ESTA ES LA MARCA DE AGUA (FONDO) ---
    background: function(currentPage, pageCount) {
        return [
            {
                image: logoUTM, // Usamos el logo que ya cargamos
                width: 400,
                opacity: 0.04, // Opacidad mínima para elegancia pura
                absolutePosition: { x: 100, y: 250 }, // Centrado en la hoja A4
            }
        ];
    },

    content: [
        // --- ENCABEZADO CON TABLA INVISIBLE ---
        {
            style: 'headerTable',
            table: {
                widths: [80, '*', 80],
                body: [
                    [
                        logoUTM ? { image: logoUTM, width: 65, alignment: 'left' } : { text: '' },
                        {
                            stack: [
                                { text: 'UNIVERSIDAD TECNOLÓGICA DE MORELIA', style: 'universityName' },
                                { text: 'REPORTE GENERAL DE MANTENIMIENTO', style: 'mainHeader' },
                                { text: 'FIXCARE • GESTIÓN DE INCIDENCIAS', style: 'tagline' }
                            ],
                            alignment: 'center',
                            margin: [0, 5, 0, 0]
                        },
                        logoFixCare ? { image: logoFixCare, width: 55, alignment: 'right' } : { text: '' }
                    ]
                ]
            },
            layout: 'noBorders'
        },

        {
            canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 2, lineColor: '#6366f1' }],
            margin: [0, 5, 0, 15]
        },

        {
            columns: [
                { text: 'Copia Controlada - Departamento de TICS', style: 'confidential' },
                { 
                    text: `Morelia, Mich. a ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}`, 
                    alignment: 'right', 
                    style: 'dateText' 
                }
            ],
            margin: [0, 0, 0, 20]
        },

        // --- TABLA DE DATOS ---
        {
            table: {
                headerRows: 1,
                widths: [35, '*', 'auto', 55, 65],
                body: [
                    [
                        { text: 'ID', style: 'tableHeader' },
                        { text: 'Descripción del Incidente', style: 'tableHeader' },
                        { text: 'Ubicación', style: 'tableHeader' },
                        { text: 'Prioridad', style: 'tableHeader' },
                        { text: 'Estatus', style: 'tableHeader' }
                    ],
                    ...results.map(t => [
                        { text: `#${t.id_ticket}`, alignment: 'center', margin: [0, 5], style: 'rowText' },
                        { text: t.descripcion, fontSize: 9, margin: [0, 5], style: 'rowText' },
                        { text: `${t.edificio}\n${t.piso_area}`, fontSize: 8, margin: [0, 5], style: 'rowText' },
                        { 
                            text: t.prioridad, 
                            style: 'prioBadge', 
                            color: t.prioridad === 'Urgente' || t.prioridad === 'Alta' ? '#ef4444' : '#1e293b',
                            margin: [0, 5] 
                        },
                        { 
                            text: t.estatus.toUpperCase(), 
                            style: 'statusText', 
                            color: t.estatus === 'Resuelto' ? '#10b981' : '#334155',
                            margin: [0, 5] 
                        }
                    ])
                ]
            },
            layout: {
                fillColor: (rowIndex) => (rowIndex % 2 === 0 && rowIndex !== 0) ? '#f8fafc' : null,
                hLineColor: () => '#e2e8f0',
                vLineWidth: () => 0,
                paddingLeft: () => 8,
                paddingRight: () => 8
            }
        }
    ],

    footer: function(currentPage, pageCount) {
        return {
            columns: [
                { text: 'FixCare Management System • Morelia, Mich.', style: 'footerText', margin: [40, 0] },
                { text: `Hoja ${currentPage} de ${pageCount}`, alignment: 'right', style: 'footerText', margin: [0, 0, 40] }
            ]
        };
    },

    styles: {
        universityName: { fontSize: 9, color: '#475569', characterSpacing: 1.5, bold: true },
        mainHeader: { fontSize: 16, bold: true, color: '#1e293b', margin: [0, 2, 0, 2] },
        tagline: { fontSize: 10, bold: true, color: '#6366f1' },
        dateText: { fontSize: 9, color: '#64748b', italics: true },
        confidential: { fontSize: 8, color: '#ef4444', bold: true, italics: true },
        tableHeader: {
            bold: true, fontSize: 10, color: 'white', fillColor: '#6366f1', alignment: 'center', margin: [0, 6, 0, 6]
        },
        rowText: { color: '#334155' },
        prioBadge: { fontSize: 8, bold: true, alignment: 'center' },
        statusText: { fontSize: 8, bold: true, alignment: 'center' },
        footerText: { fontSize: 8, color: '#94a3b8' }
    },
    defaultStyle: { font: 'Roboto' }
};

        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Reporte_FixCare_UTM.pdf');
        pdfDoc.pipe(res);
        pdfDoc.end();
    });
});


// --- RUTA DE DIAGNÓSTICO PARA TÉCNICOS ---
app.get('/api/usuarios/tecnicos', auth, (req, res) => {
    console.log("📡 Petición recibida en /api/usuarios/tecnicos"); // Esto debe salir en tu terminal negra
    
    // IMPORTANTE: Verifica si el ID de técnico en tu tabla 'roles' es 3
    const sql = 'SELECT id_usuario, nombre FROM usuarios WHERE id_rol = 3';
    
    db.query(sql, (err, rows) => {
        if (err) {
            console.error("Error de base de datos:", err);
            return res.status(500).json({ error: err.message });
        }
        
        console.log(`Se encontraron ${rows.length} técnicos en la DB`);
        res.json(rows); 
    });
});

// AGREGA ESTO A TU server.js SI NO LO TIENES
// Middleware para verificar si es admin o el propio usuario
function requireAdminOrSelf(req, res, next) {
    if (req.user.rol === 'admin' || req.user.id == req.params.id) {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado' });
    }
}

app.get('/api/usuarios/:id', auth, requireAdminOrSelf, (req, res) => {
    const { id } = req.params;
    // IMPORTANTE: Asegúrate de que el nombre de la columna sea id_usuario
    const sql = 'SELECT * FROM usuarios WHERE id_usuario = ?';
    
    db.query(sql, [id], (err, rows) => {
        if (err) {
            console.error("Error SQL:", err);
            return res.status(500).json({ error: err.message });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(rows[0]); // Enviamos solo el primer resultado
    });
});

// B. Actualizar los datos (POST o PUT)
app.post('/api/usuarios/update/:id', auth, requireRole('admin'), upload.single('foto'), (req, res) => {
    const { id } = req.params;
    const { nombre, apellido_paterno, apellido_materno, correo, celular, id_carrera, id_rol, username, password } = req.body;
    
    let sql = `UPDATE usuarios SET 
               nombre=?, apellido_paterno=?, apellido_materno=?, correo=?, 
               celular=?, id_carrera=?, id_rol=?, username=?`;
    let params = [nombre, apellido_paterno, apellido_materno, correo, celular, id_carrera, id_rol, username];

    // Si el usuario escribió una nueva contraseña, la actualizamos
    if (password && password.trim() !== "") {
        sql += `, password=?`;
        params.push(password);
    }

    // Si subió una foto nueva, actualizamos el nombre del archivo
    if (req.file) {
        sql += `, img_perfil=?`;
        params.push(req.file.filename);
    }

    sql += ` WHERE id_usuario=?`;
    params.push(id);

    db.query(sql, params, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ mensaje: 'Usuario actualizado correctamente' });
    });
});


// --- 3. RUTAS DE VISTA ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// --- 4. API DE AUTENTICACIÓN ---
app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;
    const sql = `
        SELECT u.id_usuario, u.username, u.password, r.nombre_rol 
        FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.username = ? AND u.estatus = 1
    `;

    db.query(sql, [usuario], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error interno' });
        if (rows.length === 0 || rows[0].password !== password) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = rows[0];
        const token = jwt.sign(
            { id: user.id_usuario, usuario: user.username, rol: user.nombre_rol },
            JWT_SECRET, { expiresIn: '3h' }
        );

        res.json({ token, usuario: user.username, rol: user.nombre_rol });
    });
});

// --- RUTA PARA OBTENER MI PERFIL (CON JOIN) ---
app.get('/api/perfil', auth, (req, res) => {
    const id_usuario = req.user.id;

    // Usamos alias (u, r, c) para que el código sea más limpio
    const sql = `
        SELECT 
            u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, 
            u.username, u.img_perfil, u.celular, 
            r.nombre_rol AS rol, 
            c.nombre_carrera AS carrera
        FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol
        LEFT JOIN carreras c ON u.id_carrera = c.id_carrera
        WHERE u.id_usuario = ?
    `;

    db.query(sql, [id_usuario], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
        
        // Ahora enviamos 'rol' y 'carrera' como texto, no como ID
        res.json(results[0]);
    });
});

// --- RUTA PARA ACTUALIZAR MI PERFIL ---
app.put('/api/perfil', auth, (req, res) => {
    const id_usuario = req.user.id;
    let { nombre, paterno, materno, correo, celular, password, img_perfil } = req.body;
    let nombreArchivoFinal = img_perfil;

    // 1. LÓGICA PARA LA FOTO: ¿Es una foto nueva en Base64?
    if (img_perfil && img_perfil.startsWith('data:image')) {
        // Extraemos la extensión y el contenido puro
        const extension = img_perfil.split(';')[0].split('/')[1]; // png, jpg, etc.
        const base64Data = img_perfil.replace(/^data:image\/\w+;base64,/, "");
        
        // Creamos un nombre único para el archivo
        nombreArchivoFinal = `${Date.now()}_perfil.${extension}`;
        const rutaGuardar = path.join(__dirname, 'uploads', nombreArchivoFinal);

        // Guardamos el archivo físicamente en la carpeta uploads
        fs.writeFileSync(rutaGuardar, base64Data, 'base64');
    } 
    // 2. Si es la foto vieja, limpiamos la URL para guardar solo el nombre
    else if (img_perfil && img_perfil.includes('/uploads/')) {
        nombreArchivoFinal = img_perfil.split('/uploads/')[1];
    }

    // 3. ACTUALIZAR EN BASE DE DATOS
    let sql = "UPDATE usuarios SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, correo = ?, celular = ?, img_perfil = ?";
    let params = [nombre, paterno, materno, correo, celular, nombreArchivoFinal];

    if (password && password.trim() !== "") {
        sql += ", password = ?";
        params.push(password); 
    }

    sql += " WHERE id_usuario = ?";
    params.push(id_usuario);

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("Error SQL:", err.sqlMessage);
            return res.status(500).json({ error: err.sqlMessage });
        }
        res.json({ message: "Perfil actualizado con éxito", foto: nombreArchivoFinal });
    });
});

// --- 5. API DE USUARIOS Y CATÁLOGOS ---
app.get('/api/roles', auth, (req, res) => {
    db.query('SELECT * FROM roles', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/carreras', auth, (req, res) => {
    db.query('SELECT * FROM carreras', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/usuarios', auth, requireRole('admin'), upload.single('foto'), (req, res) => {
    const { 
        id_rol, id_carrera, nombre, apellido_paterno, 
        apellido_materno, correo, celular, username, password 
    } = req.body;
    const img_perfil = req.file ? req.file.filename : null;

    const sql = `INSERT INTO usuarios 
                (id_rol, id_carrera, nombre, apellido_paterno, apellido_materno, correo, celular, username, password, img_perfil, estatus) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;

    const values = [id_rol, id_carrera, nombre, apellido_paterno, apellido_materno, correo, celular, username, password, img_perfil];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al registrar usuario' });
        res.json({ mensaje: 'Usuario creado con éxito' });
    });
});

// --- 6. API DE TICKETS (CON FILTRO POR ROL) ---
app.get('/api/tickets', auth, (req, res) => {
    // Usamos 'id' y 'rol' porque así vienen en tu consola
    const { id, rol } = req.user; 
    
    let sql = `
        SELECT t.id_ticket, s.nombre_servicio AS servicio, u.edificio, t.prioridad, t.estatus, 
        DATE_FORMAT(t.fecha_creacion, '%d/%m/%Y') AS fecha
        FROM tickets t
        JOIN servicios s ON t.id_servicio = s.id_servicio
        JOIN ubicaciones u ON t.id_ubicacion = u.id_ubicacion
    `;
    
    let params = [];

    // Comparamos con los textos que vimos en tu consola: 'tecnico' y 'tutor'
    if (rol === 'tecnico') { 
        console.log("Modo técnico");
        sql += " WHERE t.id_tecnico = ?";
        params.push(id); // 'id' es el 3 que vimos en tu imagen
    } else if (rol === 'tutor') { 
        console.log("Modo tutor");
        sql += " WHERE t.id_creador = ?"; 
        params.push(id);
    } else {
        console.log("Modo administrador");
    }

    sql += " ORDER BY t.fecha_creacion DESC";

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Ruta para obtener estadísticas por tipo de servicio
app.get('/api/stats/servicios', auth, (req, res) => {
    const { id, rol } = req.user;
    let sql = `
        SELECT s.nombre_servicio AS label, COUNT(t.id_ticket) AS total 
        FROM tickets t 
        JOIN servicios s ON t.id_servicio = s.id_servicio 
    `;

    let params = [];
    if (rol === 'tecnico') {
        sql += ' WHERE t.id_tecnico = ?';
        params.push(id);
    } else if (rol === 'tutor') {
        sql += ' WHERE t.id_creador = ?';
        params.push(id);
    }

    sql += ' GROUP BY s.nombre_servicio';
    
    db.query(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Detalle de un ticket específico (CORREGIDO + ASIGNACIÓN)
app.get('/api/tickets/:id', auth, (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT 
            t.id_ticket, t.prioridad, t.descripcion, t.estatus,
            t.comentarios_tecnico, t.foto_evidencia,
            t.id_tecnico, -- Importante para saber quién está asignado actualmente
            ut.nombre AS nombre_tecnico, -- Nombre del técnico (si hay uno)
            DATE_FORMAT(t.fecha_creacion, '%d/%m/%Y %H:%i') AS fecha, 
            u.username AS nombre_creador, 
            u.img_perfil, 
            r.nombre_rol AS rol_creador,
            s.nombre_servicio, ub.edificio, ub.piso_area
        FROM tickets t
        JOIN usuarios u ON t.id_creador = u.id_usuario 
        JOIN roles r ON u.id_rol = r.id_rol
        JOIN servicios s ON t.id_servicio = s.id_servicio
        JOIN ubicaciones ub ON t.id_ubicacion = ub.id_ubicacion
        -- Usamos LEFT JOIN para que el ticket se vea aunque NO tenga técnico asignado
        LEFT JOIN usuarios ut ON t.id_tecnico = ut.id_usuario 
        WHERE t.id_ticket = ?
    `;

    db.query(sql, [id], (err, rows) => {
        if (err) {
            console.error("Error SQL en detalle:", err);
            return res.status(500).json({ error: 'Error en servidor' });
        }
        if (rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
        
        console.log("Enviando ticket con info de técnico:", rows[0]);
        res.json(rows[0]);
    });
});
// Crear nuevo ticket
app.post('/api/tickets', auth, (req, res) => {
    const { id_servicio, id_ubicacion, prioridad, descripcion } = req.body;
    const id_creador = req.user.id;
    const sql = `INSERT INTO tickets (id_creador, id_servicio, id_ubicacion, prioridad, descripcion, estatus) 
                 VALUES (?, ?, ?, ?, ?, 'Abierto')`;
    db.query(sql, [id_creador, id_servicio, id_ubicacion, prioridad, descripcion], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al crear ticket' });
        const ticketId = result.insertId;

        const ticketQuery = `
            SELECT t.id_ticket, t.descripcion, t.prioridad, t.estatus, t.fecha_creacion,
                   s.nombre_servicio AS nombre_servicio,
                   u.nombre AS nombre_usuario,
                   u.apellido_paterno,
                   u.apellido_materno,
                   u.correo AS correo_usuario,
                   ub.edificio,
                   ub.piso_area
            FROM tickets t
            JOIN servicios s ON t.id_servicio = s.id_servicio
            JOIN usuarios u ON t.id_creador = u.id_usuario
            JOIN ubicaciones ub ON t.id_ubicacion = ub.id_ubicacion
            WHERE t.id_ticket = ?
        `;

        db.query(ticketQuery, [ticketId], async (err2, rows) => {
            if (err2) {
                console.error('Error al obtener ticket para email:', err2);
                return res.json({ mensaje: 'Ticket creado con éxito', id: ticketId });
            }

            if (rows.length === 0) {
                return res.json({ mensaje: 'Ticket creado con éxito', id: ticketId });
            }

            const ticket = rows[0];
            ticket.nombre_usuario = [ticket.nombre_usuario, ticket.apellido_paterno, ticket.apellido_materno].filter(Boolean).join(' ');

            try {
                await sendTicketCreatedEmail(ticket);
            } catch (emailError) {
                console.error('Error enviando email de ticket creado:', emailError.message || emailError);
            }

            res.json({ mensaje: 'Ticket creado con éxito', id: ticketId });
        });
    });
});

// Actualizar estatus
app.patch('/api/tickets/:id/estatus', auth, (req, res) => {
    const { id } = req.params;
    const { nuevoEstatus, comentarios } = req.body;

    const selectSql = `
        SELECT t.id_ticket, t.estatus AS estatus_anterior, u.correo AS correo_usuario,
               u.nombre AS nombre_usuario, u.apellido_paterno, u.apellido_materno
        FROM tickets t
        JOIN usuarios u ON t.id_creador = u.id_usuario
        WHERE t.id_ticket = ?
    `;

    db.query(selectSql, [id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error al consultar ticket' });
        if (rows.length === 0) return res.status(404).json({ error: 'Ticket no encontrado' });

        const ticket = rows[0];
        const estatusAnterior = ticket.estatus_anterior;

        const sql = 'UPDATE tickets SET estatus = ? WHERE id_ticket = ?';
        db.query(sql, [nuevoEstatus, id], async (err2) => {
            if (err2) return res.status(500).json({ error: 'Error al actualizar el ticket' });

            res.json({ mensaje: `Ticket actualizado a: ${nuevoEstatus}` });

            if (estatusAnterior !== nuevoEstatus) {
                try {
                    await sendTicketStatusUpdateEmail({
                        correo_usuario: ticket.correo_usuario,
                        nombre_usuario: [ticket.nombre_usuario, ticket.apellido_paterno, ticket.apellido_materno].filter(Boolean).join(' '),
                        id_ticket: id,
                        estatus_anterior: estatusAnterior,
                        estatus_nuevo: nuevoEstatus,
                        comentarios: comentarios || ''
                    });
                } catch (emailError) {
                    console.error('Error enviando email de actualización de ticket:', emailError.message || emailError);
                }
            }
        });
    });
});

// Catalogos para tickets
app.get('/api/servicios', auth, (req, res) => {
    db.query('SELECT * FROM servicios', (err, rows) => res.json(rows));
});

app.post('/api/servicios', auth, (req, res) => {
    const { nombre_servicio } = req.body;
    const sql = 'INSERT INTO servicios (nombre_servicio) VALUES (?)';
    db.query(sql, [nombre_servicio], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error al crear servicio' });
        res.json({ mensaje: 'Servicio creado con éxito', id: result.insertId });
    });
});

app.get('/api/ubicaciones', auth, (req, res) => {
    db.query('SELECT * FROM ubicaciones', (err, rows) => res.json(rows));
});


// A. Obtener todos los usuarios con sus nombres de rol y carrera
app.get('/api/usuarios', auth, requireRole('admin'), (req, res) => {
    const sql = `
        SELECT 
            u.id_usuario, u.nombre, u.apellido_paterno, u.correo, 
            u.username, u.estatus, u.img_perfil,
            r.nombre_rol, c.nombre_carrera
        FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol
        JOIN carreras c ON u.id_carrera = c.id_carrera
        ORDER BY u.id_usuario DESC
    `;
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// B. Cambiar estatus (Activar/Desactivar)
app.patch('/api/usuarios/:id/estatus', auth, (req, res) => {
    const { id } = req.params;
    const { nuevoEstatus } = req.body; // Esperamos un 0 o 1

    const sql = 'UPDATE usuarios SET estatus = ? WHERE id_usuario = ?';
    db.query(sql, [nuevoEstatus, id], (err) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar estatus' });
        res.json({ mensaje: 'Estatus actualizado correctamente' });
    });
});

//RUTA PARA OBTENER EL DETALLE DE UN TICKET (INCLUYENDO LOS NUEVOS CAMPOS DE EVIDENCIA)
app.get('/api/tickets/:id', auth, (req, res) => {
    const { id } = req.params;

    // t.* trae ID, estatus, descripción Y LAS NUEVAS COLUMNAS de evidencia
    const sql = `
        SELECT t.*, 
               u.nombre AS nombre_creador, 
               r.nombre_rol AS rol_creador,
               u.img_perfil
        FROM tickets t
        JOIN usuarios u ON t.id_usuario = u.id_usuario
        JOIN roles r ON u.id_rol = r.id_rol
        WHERE t.id_ticket = ?
    `;

    db.query(sql, [id], (err, rows) => {
        if (err) {
            console.error("Error en GET ticket:", err);
            return res.status(500).json({ error: 'Error al consultar' });
        }

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No existe el ticket' });
        }

        // Enviamos el ticket completo con todas sus columnas
        res.json(rows[0]);
    });
});


app.post('/api/tickets/:id/finalizar', auth, upload.single('evidencia'), (req, res) => {
    try {
        const { id } = req.params;
        const { comentarios } = req.body;
        const foto = req.file ? req.file.filename : null;

        console.log("--- INTENTO DE CIERRE DE TICKET ---");
        console.log("ID Ticket:", id);
        console.log("Comentarios:", comentarios);
        console.log("Archivo recibido:", req.file ? "SÍ" : "NO");

        const selectSql = `
            SELECT t.id_ticket, t.estatus AS estatus_anterior, u.correo AS correo_usuario,
                   u.nombre AS nombre_usuario, u.apellido_paterno, u.apellido_materno
            FROM tickets t
            JOIN usuarios u ON t.id_creador = u.id_usuario
            WHERE t.id_ticket = ?
        `;

        db.query(selectSql, [id], (selectErr, selectRows) => {
            if (selectErr) {
                console.error('Error al consultar ticket para email:', selectErr);
                return res.status(500).json({ error: "Error en la base de datos", detalle: selectErr.message });
            }

            if (selectRows.length === 0) {
                return res.status(404).json({ error: 'Ticket no encontrado' });
            }

            const sql = `
                UPDATE tickets 
                SET estatus = 'Resuelto', 
                    comentarios_tecnico = ?, 
                    foto_evidencia = ?,
                    fecha_resolucion = NOW() 
                WHERE id_ticket = ?
            `;

            db.query(sql, [comentarios, foto, id], async (err, result) => {
                if (err) {
                    console.error("ERROR DE SQL:", err.message);
                    return res.status(500).json({ error: "Error en la base de datos", detalle: err.message });
                }
                
                console.log("✅ Ticket actualizado con éxito en la DB");
                res.json({ mensaje: 'Ticket finalizado correctamente' });

                const ticket = selectRows[0];
                ticket.nombre_usuario = [ticket.nombre_usuario, ticket.apellido_paterno, ticket.apellido_materno].filter(Boolean).join(' ');

                try {
                    await sendTicketStatusUpdateEmail({
                        correo_usuario: ticket.correo_usuario,
                        nombre_usuario: ticket.nombre_usuario,
                        id_ticket: id,
                        estatus_anterior: ticket.estatus_anterior,
                        estatus_nuevo: 'Resuelto',
                        comentarios: comentarios || ''
                    });
                } catch (emailError) {
                    console.error('Error enviando email de actualización al cerrar ticket:', emailError.message || emailError);
                }
            });
        });

    } catch (error) {
        console.error("ERROR CRÍTICO EN EL SERVIDOR:", error);
        res.status(500).json({ error: "Fallo crítico", detalle: error.message });
    }
});

// A. Obtener solo a los usuarios que son técnicos
// Ruta para obtener la lista de técnicos (usada por el Admin para asignar)
app.get('/api/usuarios/tecnicos', auth, (req, res) => {
    // Asegúrate de que el '3' coincida con el ID del rol técnico en tu DB
    const sql = 'SELECT id_usuario, nombre FROM usuarios WHERE id_rol = 3';
    
    db.query(sql, (err, rows) => {
        if (err) {
            console.error("Error al obtener técnicos:", err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.json(rows); // Esto envía el ARRAY que el frontend espera
    });
});

// --- OBTENER TODAS LAS UBICACIONES ---
app.get('/api/ubicaciones', auth, (req, res) => {
    const sql = "SELECT * FROM ubicaciones ORDER BY edificio ASC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// --- AGREGAR NUEVA UBICACIÓN ---
app.post('/api/ubicaciones', auth, (req, res) => {
    const { edificio, piso_area } = req.body;
    const sql = "INSERT INTO ubicaciones (edificio, piso_area) VALUES (?, ?)";
    
    db.query(sql, [edificio, piso_area], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Ubicación registrada con éxito", id: result.insertId });
    });
});

// --- ACTUALIZAR UNA UBICACIÓN ---
app.put('/api/ubicaciones/:id', auth, (req, res) => {
    const { id } = req.params;
    const { edificio, piso_area } = req.body;
    const sql = "UPDATE ubicaciones SET edificio = ?, piso_area = ? WHERE id_ubicacion = ?";

    db.query(sql, [edificio, piso_area, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Ubicación actualizada correctamente" });
    });
});

// Asignar un técnico a un ticket específico
app.patch('/api/tickets/:id/asignar', auth, (req, res) => {
    const { id } = req.params;
    const { id_tecnico } = req.body;

    if (!id_tecnico) {
        return res.status(400).json({ error: 'ID de técnico es requerido' });
    }

    const sql = 'UPDATE tickets SET id_tecnico = ? WHERE id_ticket = ?';
    
    db.query(sql, [id_tecnico, id], (err, result) => {
        if (err) {
            console.error("Error al asignar técnico:", err);
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ticket no encontrado' });
        }

        const detalleQuery = `
            SELECT t.id_ticket, t.descripcion, t.prioridad,
                   s.nombre_servicio AS nombre_servicio,
                   ub.edificio, ub.piso_area,
                   solicitante.nombre AS nombre_solicitante,
                   solicitante.apellido_paterno AS apellido_solicitante,
                   solicitante.apellido_materno AS apellido_solicitante_m,
                   solicitante.correo AS correo_solicitante,
                   tecnico.nombre AS nombre_tecnico,
                   tecnico.apellido_paterno AS apellido_tecnico,
                   tecnico.apellido_materno AS apellido_tecnico_m,
                   tecnico.correo AS correo_tecnico
            FROM tickets t
            JOIN usuarios solicitante ON t.id_creador = solicitante.id_usuario
            JOIN usuarios tecnico ON t.id_tecnico = tecnico.id_usuario
            JOIN servicios s ON t.id_servicio = s.id_servicio
            JOIN ubicaciones ub ON t.id_ubicacion = ub.id_ubicacion
            WHERE t.id_ticket = ?
        `;

        db.query(detalleQuery, [id], async (detalleErr, rows) => {
            if (detalleErr) {
                console.error('Error al obtener datos para email de asignación:', detalleErr);
                return res.json({ mensaje: 'Técnico asignado exitosamente' });
            }

            if (rows.length === 0) {
                return res.json({ mensaje: 'Técnico asignado exitosamente' });
            }

            const info = rows[0];
            const nombreSolicitante = [info.nombre_solicitante, info.apellido_solicitante, info.apellido_solicitante_m].filter(Boolean).join(' ');
            const nombreTecnico = [info.nombre_tecnico, info.apellido_tecnico, info.apellido_tecnico_m].filter(Boolean).join(' ');

            try {
                await sendTicketAssignedEmail({
                    correo_tecnico: info.correo_tecnico,
                    nombre_tecnico: nombreTecnico,
                    id_ticket: info.id_ticket,
                    descripcion: info.descripcion,
                    nombre_servicio: info.nombre_servicio,
                    edificio: info.edificio,
                    piso_area: info.piso_area,
                    prioridad: info.prioridad,
                    nombre_solicitante: nombreSolicitante,
                    correo_solicitante: info.correo_solicitante
                });
            } catch (emailError) {
                console.error('Error enviando email de asignación:', emailError.message || emailError);
            }

            res.json({ mensaje: 'Técnico asignado exitosamente' });
        });
    });
});
// --- 7. ARRANCAR EL SERVIDOR ---
app.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log('-------------------------------------------');
});