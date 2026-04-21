// Esperamos a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('formLogin');
    const msg = document.getElementById('msg');

    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Feedback visual para el usuario
        msg.textContent = 'Verificando credenciales...';
        msg.style.color = '#ffffff'; // Color blanco para que resalte sobre el azul

        // Capturamos los datos del nuevo HTML
        // IMPORTANTE: Los IDs deben coincidir con tu HTML (inputEmail e inputPassword)
        const userValue = document.getElementById('inputEmail').value.trim();
        const passValue = document.getElementById('inputPassword').value.trim();

        const body = {
            usuario: userValue,
            password: passValue
        };

        try {
            const resp = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await resp.json();

            if (!resp.ok) {
                // Si hubo un error (401 o 400), mostramos el mensaje del servidor
                msg.textContent = data.error || 'Error de acceso';
                msg.style.color = '#ff4d4d'; // Rojo suave
                return;
            }

            // --- LOGIN EXITOSO ---
            // Guardamos todo en el localStorage para usarlo en otras páginas
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', data.usuario);
            localStorage.setItem('rol', String(data.rol).toLowerCase());

            msg.textContent = `¡Bienvenido(a) ${data.usuario}!`;
            msg.style.color = '#00d183'; // Verde FixCare

            // Redirigimos al Dashboard después de 1 segundo
            setTimeout(() => {
                window.location.href = 'dash.html';
            }, 1200);

        } catch (error) {
            console.error('Error en Fetch:', error);
            msg.textContent = 'No se pudo conectar con el servidor';
            msg.style.color = '#ff4d4d';
        }
    });
});