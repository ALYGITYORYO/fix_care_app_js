// assets/js/login.js
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const alertContainer = document.getElementById('alertContainer');

    // Desactivar validación previa de token para acceso libre temporal
    const token = localStorage.getItem('token');
    if (token) {
        console.log('Token existente ignorado (autenticación desactivada).');
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        login();
    });

    function setCookie(name, value, days = 1) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function login() {
        const user = document.getElementById('user').value.trim();
        const password = document.getElementById('password').value;

        if (!user || !password) {
            showAlert('Por favor completa todos los campos', 'danger');
            return;
        }

        // Mostrar loading
        loginBtn.disabled = true;
        loginBtn.querySelector('.spinner-border').classList.remove('d-none');
        loginBtn.textContent = 'Iniciando sesión...';

        // Enviar petición de login
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Guardar token en localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Guardar token en cookie
                setCookie('auth_token', data.token, 1);

                showAlert('Login exitoso. Redirigiendo...', 'success');

                // Redirigir al dashboard después de 1 segundo
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                showAlert(data.error || 'Error en el login', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('Error de conexión. Inténtalo de nuevo.', 'danger');
        })
        .finally(() => {
            // Ocultar loading
            loginBtn.disabled = false;
            loginBtn.querySelector('.spinner-border').classList.add('d-none');
            loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm d-none" role="status"></span> Iniciar Sesión';
        });
    }

    function verifyToken(token) {
        fetch('/api/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Token válido, redirigir al dashboard
                window.location.href = '/dashboard';
            } else {
                // Token inválido, limpiar
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setCookie('auth_token', '', -1); // Eliminar cookie
            }
        })
        .catch(error => {
            console.error('Error verificando token:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCookie('auth_token', '', -1);
        });
    }

    function showAlert(message, type) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        // Auto-ocultar después de 5 segundos
        setTimeout(() => {
            const alert = alertContainer.querySelector('.alert');
            if (alert) {
                alert.classList.remove('show');
                setTimeout(() => alert.remove(), 150);
            }
        }, 5000);
    }
});