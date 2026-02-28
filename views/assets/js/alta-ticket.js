// ========== assets/js/alta-ticket.js ==========
// Script específico para la página de alta de tickets

document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 Inicializando Alta Ticket...');
    
    // Cargar usuarios
    cargarUsuarios();
    
    // ya no se cargan edificios (tabla eliminada del esquema)
    
    // Cargar servicios
    cargarServicios();
    
    // Cargar lista de tickets
    cargarTickets();
    
    // Manejar submit del formulario
    document.getElementById('formTicket').addEventListener('submit', function(e) {
        e.preventDefault();
        crearTicket();
    });
});

// Cargar usuarios en el select
async function cargarUsuarios() {
    try {
        const response = await fetch('/api/usuarios');
        const usuarios = await response.json();
        
        const select = document.getElementById('inputUsuario');
        select.innerHTML = '<option value="">Seleccionar usuario...</option>';
        
        usuarios.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id;
            option.textContent = usuario.nombre;
            select.appendChild(option);
        });
        
        console.log('✅ Usuarios cargados');
    } catch (error) {
        console.error('❌ Error cargando usuarios:', error);
    }
}

// no se usa la función de edificios ya que el esquema no las contiene


// Cargar servicios en el select
async function cargarServicios() {
    try {
        const response = await fetch('/api/servicios');
        const servicios = await response.json();
        
        const select = document.getElementById('inputServicio');
        select.innerHTML = '<option value="">Seleccionar servicio...</option>';
        
        servicios.forEach(servicio => {
            const option = document.createElement('option');
            option.value = servicio.id;
            option.textContent = servicio.nombre;
            select.appendChild(option);
        });
        
        console.log('✅ Servicios cargados');
    } catch (error) {
        console.error('❌ Error cargando servicios:', error);
    }
}

// Crear nuevo ticket
async function crearTicket() {
    const form = document.getElementById('formTicket');
    const formData = new FormData(form);
    
    const datos = {
        usuarioId: document.getElementById('inputUsuario').value,

        problematica: document.getElementById('inputProblematica').value
    };
    
    try {
        const response = await fetch('/api/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Ticket creado:', result);
            
            // Limpiar formulario
            form.reset();
            
            // Recargar tickets
            cargarTickets();
            
            // Mostrar notificación de éxito
            alert('✅ Ticket creado exitosamente');
        } else {
            throw new Error('Error al crear ticket');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        alert('❌ Error al crear el ticket');
    }
}

// Cargar lista de tickets
async function cargarTickets() {
    try {
        document.getElementById('loadingSpinner').style.display = 'block';
        document.getElementById('listaTickets').innerHTML = '';
        
        const response = await fetch('/api/tickets');
        const tickets = await response.json();
        
        document.getElementById('loadingSpinner').style.display = 'none';
        
        if (!tickets || tickets.length === 0) {
            document.getElementById('sinTickets').style.display = 'block';
            return;
        }
        
        document.getElementById('sinTickets').style.display = 'none';
        const listaDiv = document.getElementById('listaTickets');
        
        tickets.forEach(ticket => {
            const ticketHtml = `
                <div class="card mb-2 ticket-item" data-estado="${ticket.estado}">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <h6 class="mb-1">
                                    <strong>#${ticket.idTicket}</strong> - ${ticket.tipo_servicio || 'Sin tipo'}
                                </h6>
                                <p class="mb-1 small text-muted">
                                    Solicitante: <strong>${ticket.usuario_solicitante || 'N/A'}</strong>
                                </p>
                                <p class="mb-0 small">${ticket.descripcion_problema || 'Sin descripción'}</p>
                            </div>
                            <div class="col-md-4 text-end">
                                <span class="badge bg-${getEstadoColor(ticket.estado)}">${ticket.estado}</span>
                                <small class="d-block text-muted mt-1">${formatearFecha(ticket.fecha)}</small>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            listaDiv.innerHTML += ticketHtml;
        });
        
        console.log('✅ Tickets cargados');
    } catch (error) {
        console.error('❌ Error cargando tickets:', error);
        document.getElementById('loadingSpinner').style.display = 'none';
    }
}

// Buscar tickets
function buscarTickets(termino) {
    const items = document.querySelectorAll('.ticket-item');
    
    items.forEach(item => {
        if (item.textContent.toLowerCase().includes(termino.toLowerCase())) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Filtrar por estado
function filtrarPorEstado(estado) {
    const items = document.querySelectorAll('.ticket-item');
    
    items.forEach(item => {
        if (estado === 'todos' || item.dataset.estado === estado) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Obtener color según estado
function getEstadoColor(estado) {
    const colores = {
        'Abierto': 'info',
        'En Proceso': 'warning',
        'Pendiente': 'secondary',
        'Completo': 'success'
    };
    return colores[estado] || 'secondary';
}

// Formatear fecha
function formatearFecha(fecha) {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}
