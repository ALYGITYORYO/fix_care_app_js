// middleware/auth.js
let jwt;
try {
    jwt = require('jsonwebtoken');
} catch (error) {
    console.error('jsonwebtoken no está instalado. Instala con: npm install jsonwebtoken');
    jwt = null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_jwt'; // Cambia esto en producción

const authMiddleware = {
    // Verificar token JWT
    verifyToken: (req, res, next) => {
        if (!jwt) {
            return res.status(500).json({ error: 'JWT no disponible. Instala jsonwebtoken.' });
        }

        // Intentar obtener token del header Authorization o de las cookies
        let token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token && req.cookies) {
            token = req.cookies.auth_token;
        }

        if (!token) {
            return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ error: 'Token inválido.' });
        }
    },

    // Generar token JWT
    generateToken: (user) => {
        if (!jwt) {
            throw new Error('JWT no disponible. Instala jsonwebtoken.');
        }

        return jwt.sign(
            {
                id: user.id,
                user: user.user,
                rol: user.rol,
                nombre: user.nombre
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
    }
};

module.exports = authMiddleware;