document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const rol = (localStorage.getItem('rol') || '').toLowerCase();
    
    // Verificar rol
    if (rol !== 'admin') {
        alert('Acceso denegado: solo administradores pueden gestionar usuarios');
        window.location.href = 'dash.html';
        return;
    }
    
    // Verificamos si el token existe
    if (!token) {
        console.warn("⚠️ No se encontró token, redirigiendo...");
        window.location.href = 'index.html';
        return;
    }

    const cargarUsuarios = async () => {
        try {
            console.log("📡 Intentando obtener usuarios...");
            const res = await fetch('/api/usuarios', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("❌ Error del servidor:", errorData);
                if (res.status === 401) alert("Sesión expirada o no autorizada");
                return;
            }

            const usuarios = await res.json();
            const tabla = document.getElementById('tablaUsuarios');
            
            if (!tabla) return;
            tabla.innerHTML = '';

            if (usuarios.length === 0) {
                tabla.innerHTML = '<tr><td colspan="6" class="text-center">No hay usuarios registrados</td></tr>';
                return;
            }

            usuarios.forEach(u => {
                const foto = (u.img_perfil && u.img_perfil !== 'null') 
                    ? `/uploads/${u.img_perfil}` 
                    : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

                const statusBadge = u.estatus === 1 
                    ? '<span class="badge bg-success">Activo</span>' 
                    : '<span class="badge bg-danger">Inactivo</span>';
                
                // Configuración del botón de estatus
                const btnStatusClass = u.estatus === 1 ? 'btn-outline-danger' : 'btn-outline-success';
                const btnStatusText = u.estatus === 1 ? 'Desactivar' : 'Activar';
                const btnStatusIcon = u.estatus === 1 ? 'fa-user-slash' : 'fa-user-check';
                const nuevoEstatus = u.estatus === 1 ? 0 : 1;

                tabla.innerHTML += `
                    <tr>
                        <td>
                            <img src="${foto}" width="40" height="40" class="rounded-circle shadow-sm" 
                                 onerror="this.onerror=null; this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png';">
                        </td>
                        <td>${u.nombre || 'N/A'} ${u.apellido_paterno || ''}</td>
                        <td>
                            <div class="small fw-bold">${u.username}</div>
                            <div class="text-muted small">${u.nombre_rol || 'Sin rol'}</div>
                        </td>
                        <td class="small">${u.nombre_carrera || 'Sin carrera'}</td>
                        <td>${statusBadge}</td>
                        <td>
                            <div class="btn-group" role="group">
                                <a href="editar-usuario.html?id=${u.id_usuario}" class="btn btn-sm btn-outline-primary" title="Editar Usuario">
                                    <i class="fas fa-edit"></i>
                                </a>

                                <button class="btn btn-sm ${btnStatusClass}" 
                                        onclick="cambiarEstatus(${u.id_usuario}, ${nuevoEstatus})" 
                                        title="${btnStatusText}">
                                    <i class="fas ${btnStatusIcon}"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        } catch (err) { 
            console.error("❌ Error en la petición fetch:", err); 
        }
    };

    window.cambiarEstatus = async (id, estatus) => {
        const accion = estatus === 1 ? 'activar' : 'desactivar';
        if (!confirm(`¿Seguro que deseas ${accion} a este usuario?`)) return;
        
        try {
            const res = await fetch(`/api/usuarios/${id}/estatus`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ nuevoEstatus: estatus })
            });
            
            if (res.ok) {
                cargarUsuarios(); 
            } else {
                alert("Error al actualizar el estatus");
            }
        } catch (error) {
            console.error("Error al cambiar estatus:", error);
        }
    };

    cargarUsuarios();
});