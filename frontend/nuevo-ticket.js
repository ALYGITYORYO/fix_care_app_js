document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    
    // Configuración global para SweetAlert2 (Estilo Cyber-Elegant)
    const CustomSwal = Swal.mixin({
        background: '#0b0f19',
        color: '#fff',
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#ef4444',
        customClass: {
            popup: 'rounded-4'
        }
    });

    // 1. Llenar los Selects al cargar la página

    async function cargarCatalogos() {
    try {
        const [respServ, respUbic] = await Promise.all([
            fetch('/api/servicios', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/ubicaciones', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (respServ.status === 401 || respUbic.status === 401) {
            return CustomSwal.fire('Sesión Expirada', 'Por favor, inicia sesión de nuevo', 'warning')
                .then(() => window.location.href = 'index.html');
        }

        const servicios = await respServ.json();
        const ubicaciones = await respUbic.json();

        const selectS = document.getElementById('selectServicio');
        const selectU = document.getElementById('selectUbicacion');

        // Limpiar opciones previas
        selectS.innerHTML = '';
        selectU.innerHTML = '';

        // Agregar opciones de servicios
        servicios.forEach(s => {
            selectS.innerHTML += `<option value="${s.id_servicio}">${s.nombre_servicio}</option>`;
        });
        
        // Agregar opción "Agregar Servicio" al final del select de servicios
        selectS.innerHTML += `<option value="nuevo_servicio" style="color: #4caf50; font-weight: bold; border-top: 1px solid #ccc;">➕ Agregar nuevo servicio...</option>`;

        // Agregar opciones de ubicaciones
        ubicaciones.forEach(u => {
            selectU.innerHTML += `<option value="${u.id_ubicacion}">${u.edificio} - ${u.piso_area}</option>`;
        });
        
        // Agregar opción "Agregar Edificio" al final del select de ubicaciones
        selectU.innerHTML += `<option value="nueva_ubicacion" style="color: #ff9800; font-weight: bold; border-top: 1px solid #ccc;">🏢 Agregar nuevo edificio...</option>`;

        // Agregar event listeners para detectar cuando se selecciona una opción especial
        selectS.addEventListener('change', function() {
            if (this.value === 'nuevo_servicio') {
                abrirModalServicio();
                // Resetear el select a su valor anterior o al primero
                this.value = servicios.length > 0 ? servicios[0].id_servicio : '';
            }
        });

        selectU.addEventListener('change', function() {
            if (this.value === 'nueva_ubicacion') {
                abrirModalUbicacion();
                // Resetear el select a su valor anterior o al primero
                this.value = ubicaciones.length > 0 ? ubicaciones[0].id_ubicacion : '';
            }
        });

    } catch (error) {
        console.error("Error al cargar catálogos:", error);
        CustomSwal.fire('Error', 'No se pudieron cargar los edificios o servicios', 'error');
    }
}

    cargarCatalogos();


    // MODAL PARA REGISTRAR NUEVO SERVICIO (adaptado a tu estilo)
async function abrirModalServicio() {
    const { value: formValues } = await CustomSwal.fire({
        title: 'Registrar Nuevo Servicio',
        html:
            '<input id="swal-nombre" class="swal2-input" placeholder="Nombre del servicio">' ,
        showCancelButton: true,
        confirmButtonText: 'Guardar Servicio',
        preConfirm: () => {
            const nombre = document.getElementById('swal-nombre').value;
            
            if (!nombre ) {
                Swal.showValidationMessage('El nombre y precio son obligatorios');
                return false;
            }
            
           
            
            return { 
                nombre_servicio: nombre
            };
        }
    });

    if (formValues) {
        try {
            const resp = await fetch('/api/servicios', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formValues)
            });
            console.log("Respuesta del servidor:", resp);
            if (resp.ok) {
                const nuevoServicio = await resp.json();
                CustomSwal.fire({ 
                    icon: 'success', 
                    title: '¡Servicio Guardado!', 
                    timer: 1500, 
                    showConfirmButton: false 
                });
                // Recargar los catálogos para mostrar el nuevo servicio
                cargarCatalogos();
                
                // Opcional: Seleccionar automáticamente el nuevo servicio
                setTimeout(() => {
                    const selectS = document.getElementById('selectServicio');
                    selectS.value = nuevoServicio.id_servicio;
                }, 100);
            } else {
                const error = await resp.json();
                CustomSwal.fire('Error', error.message || 'No se pudo guardar el servicio', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            CustomSwal.fire('Error', 'No se pudo conectar con el servidor', 'error');
        }
    }
}

// MODAL PARA REGISTRAR NUEVA UBICACIÓN (adaptado a tu estilo)
async function abrirModalUbicacion() {
    const { value: formValues } = await CustomSwal.fire({
        title: 'Registrar Nueva Ubicación',
        html:
            '<input id="swal-edificio" class="swal2-input" placeholder="Nombre del edificio (Ej. Edificio A)">' +
            '<input id="swal-piso" class="swal2-input" placeholder="Área / Piso (Ej. Planta Alta / Lab 4)">',
        showCancelButton: true,
        confirmButtonText: 'Guardar Ubicación',
        preConfirm: () => {
            const edificio = document.getElementById('swal-edificio').value;
            const piso = document.getElementById('swal-piso').value;
            
            if (!edificio || !piso) {
                Swal.showValidationMessage('Ambos campos son obligatorios');
                return false;
            }
            
            return { 
                edificio: edificio,
                piso_area: piso
            };
        }
    });

    if (formValues) {
        try {
            const resp = await fetch('/api/ubicaciones', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formValues)
            });

            if (resp.ok) {
                const nuevaUbicacion = await resp.json();
                CustomSwal.fire({ 
                    icon: 'success', 
                    title: '¡Edificio Guardado!', 
                    timer: 1500, 
                    showConfirmButton: false 
                });
                // Recargar los catálogos para mostrar la nueva ubicación
                cargarCatalogos();
                
                // Opcional: Seleccionar automáticamente la nueva ubicación
                setTimeout(() => {
                    const selectU = document.getElementById('selectUbicacion');
                    selectU.value = nuevaUbicacion.id_ubicacion;
                }, 100);
            } else {
                const error = await resp.json();
                CustomSwal.fire('Error', error.message || 'No se pudo guardar la ubicación', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            CustomSwal.fire('Error', 'No se pudo conectar con el servidor', 'error');
        }
    }
}
   
    // 2. Enviar el formulario
    document.getElementById('formNuevoTicket').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const body = {
            id_servicio: document.getElementById('selectServicio').value,
            id_ubicacion: document.getElementById('selectUbicacion').value,
            prioridad: document.getElementById('selectPrioridad').value,
            descripcion: document.getElementById('inputDescripcion').value
        };

        try {
            // Mostrar un indicador de carga (opcional pero pro)
            CustomSwal.fire({
                title: 'Procesando...',
                text: 'Estamos registrando tu reporte',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            const resp = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (resp.ok) {
                // ✅ ÉXITO
                CustomSwal.fire({
                    icon: 'success',
                    title: '¡Ticket Enviado!',
                    text: 'El personal técnico revisará tu solicitud pronto.',
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