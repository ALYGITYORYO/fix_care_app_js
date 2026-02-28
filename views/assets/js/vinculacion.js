// assets/js/vinculacion.js

$(document).ready(function() {
    cargarAdmins();
    cargarTecnicos();
    cargarOrgs();

    $('#formVincularEnc').on('submit', function(e) {
        e.preventDefault();
        vincularEncargado();
    });

    $('#formVincularTec').on('submit', function(e) {
        e.preventDefault();
        vincularTecnico();
    });
});

async function cargarAdmins() {
    try {
        const resp = await fetch('/api/usuarios');
        const usuarios = await resp.json();
        const admins = usuarios.filter(u => u.rol === 'admin');
        const select = $('#encargoAdmin');
        select.html('<option value="">Seleccionar...</option>');
        admins.forEach(a => {
            select.append(`<option value="${a.id}">${a.nombre} ${a.apepat}</option>`);
        });
    } catch (err) {
        console.error('Error cargando admins:', err);
    }
}

async function cargarTecnicos() {
    try {
        const resp = await fetch('/api/usuarios');
        const usuarios = await resp.json();
        const tecnicos = usuarios.filter(u => u.rol === 'tecnico');
        const select = $('#tecId');
        select.html('<option value="">Seleccionar...</option>');
        tecnicos.forEach(t => {
            select.append(`<option value="${t.id}">${t.nombre} ${t.apepat}</option>`);
        });
    } catch (err) {
        console.error('Error cargando técnicos:', err);
    }
}

async function cargarOrgs() {
    try {
        const resp = await fetch('/api/organizaciones');
        const orgs = await resp.json();
        const sel1 = $('#encargoOrg');
        const sel2 = $('#tecOrg');
        sel1.html('<option value="">Seleccionar...</option>');
        sel2.html('<option value="">Seleccionar...</option>');
        orgs.forEach(o => {
            sel1.append(`<option value="${o.id}">${o.nombre}</option>`);
            sel2.append(`<option value="${o.id}">${o.nombre}</option>`);
        });
    } catch (err) {
        console.error('Error cargando organizaciones:', err);
    }
}

async function vincularEncargado() {
    const adminId = $('#encargoAdmin').val();
    const orgId = $('#encargoOrg').val();
    if (!adminId || !orgId) {
        alert('Seleccione administrador y organización');
        return;
    }
    try {
        const resp = await fetch('/api/vincular/encargado', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminId, orgId })
        });
        if (resp.ok) {
            alert('Encargado vinculado');
            $('#formVincularEnc')[0].reset();
        } else {
            const err = await resp.json();
            alert('Error: ' + (err.error || ''));
        }
    } catch (err) {
        console.error(err);
        alert('Error');
    }
}

async function vincularTecnico() {
    const tecnicoId = $('#tecId').val();
    const orgId = $('#tecOrg').val();
    if (!tecnicoId || !orgId) {
        alert('Seleccione técnico y organización');
        return;
    }
    try {
        const resp = await fetch('/api/vincular/tecnico', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tecnicoId, orgId })
        });
        if (resp.ok) {
            alert('Técnico vinculado');
            $('#formVincularTec')[0].reset();
        } else {
            const err = await resp.json();
            alert('Error: ' + (err.error || ''));
        }
    } catch (err) {
        console.error(err);
        alert('Error');
    }
}