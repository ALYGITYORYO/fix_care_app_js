document.addEventListener('DOMContentLoaded', () => {
    const rol = (localStorage.getItem('rol') || '').toLowerCase();

    // Verificar si hay token y rol
    const token = localStorage.getItem('token');
    if (!token || !rol) {
        console.warn('No hay sesión activa, redirigiendo...');
        window.location.href = 'index.html';
        return;
    }

    // Ocultar elementos solo para admin si el usuario no es admin
    if (rol !== 'admin') {
        const adminOnlyElements = document.querySelectorAll('.admin-only');
        adminOnlyElements.forEach(el => {
            el.style.display = 'none';
        });
    }

    // Verificar acceso a páginas restringidas
    const currentPage = window.location.pathname.split('/').pop();
    const adminPages = ['usuarios.html', 'crear-usuario.html', 'editar-usuario.html'];
    if (adminPages.includes(currentPage) && rol !== 'admin') {
        alert('Acceso denegado: esta página requiere permisos de administrador');
        window.location.href = 'dash.html';
        return;
    }
});