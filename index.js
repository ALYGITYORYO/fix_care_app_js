// ============================================
// FIX_CARE_APP_JS/index.js
// ============================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const conexion = require('./bd/conexion');

// Importar rutas
const routes = require('./control/routes');

const app = express();
const port = 3000;

// Middlewares 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir archivos estáticos (CSS, JS, imágenes, vendor)
app.use('/assets', express.static(path.join(__dirname, 'views/assets')));

// Servir archivos HTML directamente
app.use(express.static(path.join(__dirname, 'views')));

// Configurar rutas API
app.use('/', routes);

// Verificar conexión a la base de datos
conexion.connect((err) => {
    if (err) {
        console.error('❌ Error conectando a la base de datos:', err);
        return;
    }
    console.log('✅ Conectado a la base de datos MySQL');
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${port}`);
    console.log(`� Login: http://localhost:${port}/login.html`);
    console.log(`📊 Dashboard: http://localhost:${port}/dashboard`);
    console.log(`👤 Alta Usuario: http://localhost:${port}/alta-usuario.html`);
    console.log(`🎫 Alta Ticket: http://localhost:${port}/alta-ticket.html`);
    console.log(`🏢 Alta Organización: http://localhost:${port}/alta-organizacion.html`);
    console.log(`🔗 Vinculación: http://localhost:${port}/vinculacion.html`);
});