// ========== assets/js/app.js ==========
// Este archivo carga todos los includes como en PHP

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Cargando includes...');
    
    // Cargar todos los includes
    loadInclude('head', 'inc/head.html');
    loadInclude('header', 'inc/header.html');
    loadInclude('sidebar', 'inc/sidebar.html');
    loadInclude('breadcrumb', 'inc/breadcrumb.html');
    loadInclude('footer', 'inc/footer.html');
    loadInclude('scripts', 'inc/scripts.html');
});

function loadInclude(elementId, filePath) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`❌ No se encontró el elemento con id: ${elementId}`);
        return;
    }
    
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error cargando ${filePath}`);
            }
            return response.text();
        })
        .then(html => {
            element.innerHTML = html;
            console.log(`✅ Include cargado: ${elementId}`);
            
            // Después de cargar todos, configurar la página
            if (elementId === 'scripts') {
                setTimeout(configurePage, 100);
            }
        })
        .catch(error => {
            console.error('❌ Error:', error);
        });
}

function configurePage() {
    // Establecer el título de la página
    const pageName = getPageName();
    document.title = `Fix Care - ${pageName}`;
    
    // Marcar el menú activo
    markActiveMenu();
    
    // Configurar breadcrumb
    configureBreadcrumb();
}

function getPageName() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    const names = {
        'index.html': 'Dashboard',
        'alta-usuario.html': 'Alta Usuario',
        'alta-ticket.html': 'Alta Ticket',
        'alta-organizacion.html': 'Alta Organización',
        'vinculacion.html': 'Vinculación'
    };
    
    return names[page] || 'Fix Care App';
}

function markActiveMenu() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    // Remover clase active de todos los menús
    document.querySelectorAll('.sidebar-menu li').forEach(li => {
        li.classList.remove('active');
    });
    
    // Activar el menú correspondiente
    if (page === 'index.html') {
        document.getElementById('menu-dashboard')?.classList.add('active');
    } else if (page === 'alta-usuario.html') {
        document.getElementById('menu-alta-usuario')?.classList.add('active');
    } else if (page === 'alta-ticket.html') {
        document.getElementById('menu-alta-ticket')?.classList.add('active');
    } else if (page === 'alta-organizacion.html') {
        document.getElementById('menu-alta-organizacion')?.classList.add('active');
    } else if (page === 'vinculacion.html') {
        document.getElementById('menu-vinculacion')?.classList.add('active');
    }
}

function configureBreadcrumb() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    const breadcrumb = document.getElementById('breadcrumb-container');
    
    if (!breadcrumb) return;
    
    let html = '<li class="breadcrumb-item"><i class="bi bi-house lh-1"></i> <a href="index.html">Home</a></li>';
    
    if (page === 'index.html') {
        html += '<li class="breadcrumb-item active">Dashboard</li>';
    } else if (page === 'alta-usuario.html') {
        html += '<li class="breadcrumb-item">Usuarios</li>';
        html += '<li class="breadcrumb-item active">Alta Usuario</li>';
    } else if (page === 'alta-ticket.html') {
        html += '<li class="breadcrumb-item">Tickets</li>';
        html += '<li class="breadcrumb-item active">Alta Ticket</li>';
    } else if (page === 'alta-organizacion.html') {
        html += '<li class="breadcrumb-item">Organizaciones</li>';
        html += '<li class="breadcrumb-item active">Alta Organización</li>';
    } else if (page === 'vinculacion.html') {
        html += '<li class="breadcrumb-item active">Vinculación</li>';
    }
    
    breadcrumb.innerHTML = html;
}