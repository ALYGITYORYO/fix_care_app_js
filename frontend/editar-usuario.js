document.addEventListener('DOMContentLoaded', async () => {
     // 1. Configuración de SweetAlert Dark
        const CustomSwal = Swal.mixin({
            background: '#0b0f19',
            color: '#fff',
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#ef4444',
            customClass: { popup: 'rounded-4' }
        });
    const token = localStorage.getItem('token');
    const rol = (localStorage.getItem('rol') || '').toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    const idUsuario = urlParams.get('id');

    // Verificar rol
    if (rol !== 'admin') {
        alert('Acceso denegado: solo administradores pueden editar usuarios');
        window.location.href = 'dash.html';
        return;
    }

    // Validaciones iniciales
    if (!token) return window.location.href = 'index.html';
    if (!idUsuario) return window.location.href = 'usuarios.html';

    async function cargarDatos() {
        try {
            console.log("📡 Iniciando carga de datos para ID:", idUsuario);

            // 1. Cargamos catálogos y datos del usuario en paralelo
            const [resRoles, resCar, resUser] = await Promise.all([
                fetch('/api/roles', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/carreras', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`/api/usuarios/${idUsuario}`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            // Verificación de errores en la respuesta
            if (!resUser.ok) {
                if (resUser.status === 401) {
                    alert("Sesión expirada");
                    window.location.href = 'index.html';
                    return;
                }
                throw new Error("No se pudo obtener la información del usuario");
            }

            const roles = await resRoles.json();
            const carreras = await resCar.json();
            const u = await resUser.json();
            
            console.log("✅ Datos del usuario recibidos:", u);

            // 2. Llenar Select de Roles
            const selRol = document.getElementById('selectRol');
            selRol.innerHTML = '<option value="">Seleccione un rol...</option>';
            roles.forEach(r => {
                selRol.innerHTML += `<option value="${r.id_rol}">${r.nombre_rol}</option>`;
            });

            // 3. Llenar Select de Carreras
            const selCar = document.getElementById('selectCarrera');
            selCar.innerHTML = '<option value="">Seleccione una carrera...</option>';
            carreras.forEach(c => {
                selCar.innerHTML += `<option value="${c.id_carrera}">${c.nombre_carrera}</option>`;
            });

            // 4. RELLENAR FORMULARIO (Nombres exactos de tu base de datos)
            document.getElementById('nombre').value = u.nombre || '';
            document.getElementById('paterno').value = u.apellido_paterno || '';
            document.getElementById('materno').value = u.apellido_materno || '';
            document.getElementById('correo').value = u.correo || '';
            document.getElementById('username').value = u.username || '';
            
            // Asignar valores a los selects después de haber cargado las opciones
            selRol.value = u.id_rol;
            selCar.value = u.id_carrera;


            // ... dentro de cargarDatos, después de recibir 'u'

const imgPreview = document.getElementById('previewFoto');

// Determinamos la ruta de la foto
const rutaFoto = (u.img_perfil && u.img_perfil !== 'null') 
    ? `/uploads/${u.img_perfil}` 
    : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

// La asignamos al elemento y ponemos el seguro del bucle infinito
imgPreview.src = rutaFoto;
imgPreview.onerror = function() {
    this.onerror = null;
    this.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
};

        } catch (err) {
            console.error("❌ Fallo en cargarDatos:", err);
            alert("Error al cargar la información del perfil.");
        }
    }

    // Ejecutar la carga inicial
    await cargarDatos();

    // 5. Manejar el envío del formulario (UPDATE)
    document.getElementById('formEditarUsuario').addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        // Usamos los IDs de tus inputs
        formData.append('nombre', document.getElementById('nombre').value);
        formData.append('apellido_paterno', document.getElementById('paterno').value);
        formData.append('apellido_materno', document.getElementById('materno').value);
        formData.append('correo', document.getElementById('correo').value);
        formData.append('id_carrera', document.getElementById('selectCarrera').value);
        formData.append('id_rol', document.getElementById('selectRol').value);
        formData.append('username', document.getElementById('username').value);
        
        // Contraseña opcional
        const pass = document.getElementById('password').value;
        if (pass.trim() !== "") {
            formData.append('password', pass);
        }

        // Foto opcional
        const fotoFile = document.getElementById('inputFoto').files[0];
        if (fotoFile) {
            formData.append('foto', fotoFile);
        }

        try {
            const resp = await fetch(`/api/usuarios/update/${idUsuario}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (resp.ok) {
                // ✅ ÉXITO
                CustomSwal.fire({
                    icon: 'success',
                    title: 'Usuario Actualizado!',
                    text: 'El usuario ha sido actualizado correctamente.',
                    timer: 2500,
                    showConfirmButton: false,
                    timerProgressBar: true
                }).then(() => {
                    window.location.href = 'dash.html';
                });
            } else {
                // ❌ ERROR DE VALIDACIÓN O SERVIDOR
                CustomSwal.fire({
                    icon: 'error',
                    title: 'Hubo un problema',
                    text: 'No pudimos registrar el ticket. Inténtalo de nuevo.',
                });
            }
        } catch (err) {
            // ⚠️ ERROR DE CONEXIÓN
            console.error("Error en envío:", err);
            CustomSwal.fire('Fallo de red', 'El servidor de FixCare no responde', 'warning');
        }
    });
});

// Escuchar cuando cambie el input de archivo para mostrar la nueva foto
document.getElementById('inputFoto').addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function() {
        document.getElementById('previewFoto').src = reader.result;
    };
    if (e.target.files[0]) {
        reader.readAsDataURL(e.target.files[0]);
    }
});