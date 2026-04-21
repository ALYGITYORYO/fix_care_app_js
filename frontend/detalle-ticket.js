document.addEventListener('DOMContentLoaded', async () => {
    // 1. Obtener el ID de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idTicket = urlParams.get('id');
    const token = localStorage.getItem('token');

    if (!idTicket) return window.location.href = 'dash.html';

    try {
        const resp = await fetch(`/api/tickets/${idTicket}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const ticket = await resp.json();

        // 2. Llenar la pantalla con los datos
        document.getElementById('ticketId').textContent = ticket.id_ticket;
        document.getElementById('txtServicio').textContent = ticket.nombre_servicio;
        document.getElementById('txtUbicacion').textContent = `${ticket.edificio} - ${ticket.piso_area}`;
        document.getElementById('txtPrioridad').textContent = ticket.prioridad;
        document.getElementById('txtDescripcion').textContent = ticket.descripcion;
        document.getElementById('txtNombreCreador').textContent = ticket.nombre_creador;
        document.getElementById('txtRolCreador').textContent = ticket.rol_creador;
        
        // Estatus con color
        const badge = document.getElementById('ticketEstatus');
        badge.textContent = ticket.estatus;
        badge.className = `badge ${ticket.estatus === 'Abierto' ? 'bg-danger' : 'bg-success'}`;

    } catch (error) {
        console.error('Error:', error);
    }
});