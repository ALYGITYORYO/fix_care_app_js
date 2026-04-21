document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const rol = (localStorage.getItem('rol') || '').toLowerCase();
    const userDisplay = document.getElementById('userNameNav');
    
    // Verificar rol
    if (rol !== 'admin') {
        alert('Acceso denegado: solo administradores pueden crear usuarios');
        window.location.href = 'dash.html';
        return;
    }
    
    // 1. Validar sesión
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    if (userDisplay) userDisplay.textContent = localStorage.getItem('usuario');

    // 2. Función para cargar los datos en los selectores
// --- DENTRO DE crear-usuario.js ---

async function cargarDatos() {
    const token = localStorage.getItem('token'); // Recuperamos la llave

    try {
        const [resRoles, resCarreras] = await Promise.all([
            // Agregamos el header 'Authorization' a ambos fetch
            fetch('/api/roles', { 
                headers: { 'Authorization': `Bearer ${token}` } 
            }),
            fetch('/api/carreras', { 
                headers: { 'Authorization': `Bearer ${token}` } 
            })
        ]);

        // Verificamos si la respuesta fue exitosa antes de convertir a JSON
        if (!resRoles.ok || !resCarreras.ok) {
            throw new Error("Error de autorización o servidor");
        }

        const roles = await resRoles.json();
        const carreras = await resCarreras.json();

        const selRol = document.getElementById('selectRol');
        const selCar = document.getElementById('selectCarrera');

        // Limpiar y llenar (esto evitará el error de .forEach is not a function)
        selRol.innerHTML = '<option value="" disabled selected>Selecciona rol...</option>';
        roles.forEach(r => {
            selRol.innerHTML += `<option value="${r.id_rol}">${r.nombre_rol}</option>`;
        });

        selCar.innerHTML = '<option value="" disabled selected>Selecciona carrera...</option>';
        carreras.forEach(c => {
            selCar.innerHTML += `<option value="${c.id_carrera}">${c.nombre_carrera}</option>`;
        });

        console.log("Catálogos cargados correctamente");

    } catch (error) {
        console.error("Error al llenar selectores:", error);
    }
}

    cargarDatos();

   // 3. Guardar Usuario
const form = document.getElementById('formRegistroCompleto');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('nombre', document.getElementById('nombre').value);
        formData.append('apellido_paterno', document.getElementById('paterno').value);
        formData.append('apellido_materno', document.getElementById('materno').value);
        formData.append('correo', document.getElementById('correo').value);
        formData.append('celular', document.getElementById('celular').value);
        formData.append('id_carrera', document.getElementById('selectCarrera').value);
        formData.append('id_rol', document.getElementById('selectRol').value);
        formData.append('username', document.getElementById('username').value);
        formData.append('password', document.getElementById('password').value);

        const foto = document.getElementById('inputFoto').files[0];
        if (foto) formData.append('foto', foto);

        try {
            const res = await fetch('/api/usuarios', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                // Éxito con SweetAlert
                CustomSwal.fire({
                    icon: 'success',
                    title: '¡Usuario Creado!',
                    text: 'El nuevo personal ha sido registrado correctamente.',
                    timer: 2000,
                    showConfirmButton: false,
                    timerProgressBar: true
                }).then(() => {
                    window.location.href = 'usuarios.html'; // O dash.html
                });

            } else {
                // Error de respuesta del servidor
                CustomSwal.fire({
                    icon: 'error',
                    title: 'Error al registrar',
                    text: 'No se pudo crear el usuario. Revisa los datos.'
                });
            }
        } catch (error) {
            // Error de conexión o red
            console.error(error);
            CustomSwal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'Hubo un problema al conectar con el servidor.'
            });
        }
    });
}
});