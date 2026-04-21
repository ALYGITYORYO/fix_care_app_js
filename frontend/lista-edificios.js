/**
 * FixCare UTM - Gestión de Infraestructura
 * Archivo: alta-edificios.js
 */

// 1. Configuración de SweetAlert2 (Estandarizado para tu diseño)
const CustomSwal = Swal.mixin({
    background: '#0b0f19',
    color: '#fff',
    confirmButtonColor: '#6366f1',
    cancelButtonColor: '#ef4444',
    customClass: {
        popup: 'rounded-4 border-indigo'
    }
});

// 2. Variables Globales
const token = localStorage.getItem('token');
const API_URL = 'http://localhost:3000/api/ubicaciones';

// 3. Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión
    if (!token) return window.location.href = 'index.html';

    // Cargar la tabla inicialmente
    cargarUbicaciones();

    // ASIGNACIÓN DE EVENTOS (Esto evita el error "is not defined")
    const btnNuevo = document.getElementById('btnNuevoEdificio');
    if (btnNuevo) {
        btnNuevo.addEventListener('click', abrirModalUbicacion);
    }
});

// --- FUNCIONES PRINCIPALES ---

// A. Cargar datos en la tabla
async function cargarUbicaciones() {
    try {
        const resp = await fetch(API_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!resp.ok) throw new Error("Error en la petición");

        const data = await resp.json();
        const tbody = document.getElementById('tbodyUbicaciones');
        
        if (!tbody) return;

        // Limpiamos y llenamos la tabla
        tbody.innerHTML = data.map(u => `
            <tr>
                <td class="ps-4 fw-bold text-indigo">#${u.id_ubicacion}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="icon-shape bg-glass me-3 text-primary">
                            <i class="fas fa-building"></i>
                        </div>
                        <span class="fw-semibold">${u.edificio}</span>
                    </div>
                </td>
                <td>
                    <span class="badge bg-soft-indigo text-indigo border">
                        ${u.piso_area}
                    </span>
                </td>
                <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-primary border-0 me-2" 
            onclick="prepararEdicion(${u.id_ubicacion}, '${u.edificio}', '${u.piso_area}')">
        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error("❌ Fallo al cargar ubicaciones:", err);
    }
}

// B. Modal para registrar nueva ubicación
async function abrirModalUbicacion() {
    const { value: formValues } = await CustomSwal.fire({
        title: 'Nueva Ubicación',
        text: 'Registra un nuevo edificio o área en la UTM',
        html: `
            <div class="text-start px-3">
                <label class="form-label small text-muted">Nombre del Edificio</label>
                <input id="swal-edificio" class="swal2-input m-0 w-100" placeholder="Ej. Edificio K">
                
                <label class="form-label small text-muted mt-3">Piso o Área Específica</label>
                <input id="swal-piso" class="swal2-input m-0 w-100" placeholder="Ej. Planta Alta / Lab de Redes">
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-save me-2"></i> Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const edif = document.getElementById('swal-edificio').value;
            const piso = document.getElementById('swal-piso').value;
            if (!edif || !piso) {
                Swal.showValidationMessage('Ambos campos son obligatorios');
                return false;
            }
            return { edificio: edif, piso_area: piso };
        }
    });

    if (formValues) {
        enviarUbicacion(formValues);
    }
}

// C. Guardar en la base de datos
async function enviarUbicacion(payload) {
    try {
        const resp = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if (resp.ok) {
            CustomSwal.fire({
                icon: 'success',
                title: '¡Registrado!',
                text: 'La ubicación se agregó correctamente.',
                timer: 1500,
                showConfirmButton: false
            });
            cargarUbicaciones(); // Recargar tabla
        } else {
            throw new Error("Fallo al insertar");
        }
    } catch (err) {
        CustomSwal.fire('Error', 'No se pudo guardar la ubicación', 'error');
    }
}

// D. Eliminar ubicación
async function eliminarUbicacion(id) {
    const result = await CustomSwal.fire({
        title: '¿Eliminar ubicación?',
        text: "Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'No, mantener'
    });

    if (result.isConfirmed) {
        try {
            const resp = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resp.ok) {
                CustomSwal.fire('Eliminado', 'La ubicación ha sido borrada.', 'success');
                cargarUbicaciones();
            }
        } catch (err) {
            CustomSwal.fire('Error', 'Fallo de conexión', 'error');
        }
    }
}