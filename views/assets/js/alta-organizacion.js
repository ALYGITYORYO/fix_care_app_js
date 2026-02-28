// assets/js/alta-organizacion.js

$(document).ready(function() {
    cargarOrganizaciones();

    $('#formOrg').on('submit', async function(e) {
        e.preventDefault();
        const nombre = $('#orgNombre').val().trim();
        const tipo = $('#orgTipo').val();
        const logo = $('#orgLogo').val().trim();
        if (!nombre || !tipo) {
            alert('Debe completar nombre y tipo');
            return;
        }
        try {
            const resp = await fetch('/api/organizaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, tipo, logo })
            });
            if (resp.ok) {
                $('#modalAltaOrg').modal('hide');
                cargarOrganizaciones();
                $('#formOrg')[0].reset();
            } else {
                const err = await resp.json();
                alert('Error: ' + (err.error || '')); 
            }
        } catch (err) {
            console.error(err);
            alert('Error comunicando con el servidor');
        }
    });
});

async function cargarOrganizaciones() {
    try {
        const resp = await fetch('/api/organizaciones');
        const datos = await resp.json();
        if ($('#gridOrg').data('kendoGrid')) {
            $('#gridOrg').data('kendoGrid').destroy();
            $('#gridOrg').empty();
        }
        $('#gridOrg').kendoGrid({
            dataSource: {
                data: datos,
                pageSize: 10
            },
            pageable: true,
            sortable: true,
            columns: [
                { field: 'id', title: '#', width: '50px' },
                { field: 'nombre', title: 'Nombre' },
                { field: 'tipo', title: 'Tipo' }
            ]
        });
    } catch (err) {
        console.error('Error cargando organizaciones:', err);
    }
}