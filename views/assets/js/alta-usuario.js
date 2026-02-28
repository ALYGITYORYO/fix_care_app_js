// ========== assets/js/alta-usuario.js ==========
// Script específico para la página de alta de usuarios


$(document).ready(function() {

    // Función para cargar usuarios
    async function cargarUsuarios() {
        try {
            const response = await fetch('/api/usuarios');
            const usuarios = await response.json();
            console.log('Usuarios cargados:', usuarios);

            // Crear DataSource con los usuarios recibidos
            crearGridUsuarios(usuarios);

        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            crearGridUsuarios([]);
        }
    }

    // Cargar organizaciones para el formulario
    async function cargarOrganizaciones() {
        try {
            const respuesta = await fetch('/api/organizaciones');
            const orgs = await respuesta.json();
            const select = document.getElementById('organizacion');
            select.innerHTML = '<option value="">Seleccione...</option>';
            orgs.forEach(o => {
                const opt = document.createElement('option');
                opt.value = o.id;
                opt.textContent = o.nombre;
                select.appendChild(opt);
            });

            const selectEdit = document.getElementById('editar_organizacion');
            if (selectEdit) {
                selectEdit.innerHTML = '<option value="">Seleccione...</option>';
                orgs.forEach(o => {
                    const opt = document.createElement('option');
                    opt.value = o.id;
                    opt.textContent = o.nombre;
                    selectEdit.appendChild(opt);
                });
            }

            console.log('✅ Organizaciones cargadas');
        } catch (err) {
            console.error('❌ Error cargando organizaciones', err);
        }
    }

    // Función para crear el grid con los usuarios
    function crearGridUsuarios(usuarios) {
    if ($("#grid").data("kendoGrid")) {
        $("#grid").data("kendoGrid").destroy();
        $("#grid").empty();
    }

    var usuariosDataSource = new kendo.data.DataSource({
        data: usuarios,
        pageSize: 10,
        schema: {
            model: {
                id: "id",
                fields: {
                    id: {
                        type: "number",
                        editable: false
                    },
                    rol: {
                        type: "string"
                    },
                    nombre: {
                        type: "string"
                    },
                    apepat: {
                        type: "string"
                    },
                    apemat: {
                        type: "string"
                    },
                    correo: {
                        type: "string"
                    },
                    cel: {
                        type: "string"
                    },
                    user: {
                        type: "string"
                    },
                    img: {
                        type: "string"
                    },
                    usuario_creado: {
                        type: "date"
                    },
                    usuario_actualizado: {
                        type: "date"
                    }
                }
            }
        }
    });

    // Crear el grid con columnas que se autoajustan
    $("#grid").kendoGrid({
        dataSource: usuariosDataSource,
        columnMenu: true,
        height: 600,
        scrollable: true,
        pageable: {
            refresh: true,
            pageSizes: [10, 20, 50, "Todos"],
            buttonCount: 5
        },
        sortable: true,
        filterable: true,
        resizable: true,
        reorderable: true,
        toolbar: ["excel", "pdf", "search"],
        columns: [{
                field: "nombre_completo",
                title: "Nombre",
                width: "200px",
                template: function(dataItem) {
                    return '<div>' +
                        '<strong>' + dataItem.nombre + ' ' + dataItem.apepat + ' ' + dataItem.apemat + '</strong>' +
                        '<div class="text-muted small">@' + dataItem.user + '</div>' +
                        '</div>';
                },
                filterable: {
                    multi: true,
                    search: true
                }
            },
            {
                field: "correo",
                title: "Correo",
                width: "220px",
                template: function(dataItem) {
                    return '<a href="mailto:' +
                        dataItem.correo +
                        '" class="text-primary text-truncate d-block">' +
                        dataItem.correo + '</a>';
                },
                filterable: {
                    multi: true,
                    search: true
                }
            },
            {
                field: "cel",
                title: "Teléfono",
                width: "130px",
                template: function(dataItem) {
                    return dataItem.cel ||
                        '<span class="text-muted">No registrado</span>';
                }
            },
            {
                field: "rol",
                title: "Rol",
                width: "100px",
                template: function(dataItem) {
                    var badgeClass = {
                            'admin': 'danger',
                            'editor': 'warning',
                            'usuario': 'primary',
                            'invitado': 'secondary'
                        } [dataItem.rol] ||
                        'secondary';

                    return '<span class="badge bg-' +
                        badgeClass + '">' +
                        dataItem.rol + '</span>';
                },
                filterable: {
                    multi: true
                }
            },
            {
                field: "usuario_actualizado",
                title: "Último Ingreso",
                width: "150px",
                format: "{0:dd/MM/yyyy HH:mm}",
                template: function(dataItem) {
                    if (dataItem
                        .usuario_actualizado) {
                        var fecha = new Date(
                            dataItem
                            .usuario_actualizado
                        );
                        var ahora = new Date();
                        var diferencia = ahora -
                            fecha;
                        var horas = Math.floor(
                            diferencia / (1000 *
                                60 * 60));

                        var texto = kendo.toString(
                            fecha,
                            "dd/MM/yyyy HH:mm");
                        var tooltip = "";

                        if (horas < 1) {
                            tooltip =
                                "Hace menos de 1 hora";
                        } else if (horas < 24) {
                            tooltip = "Hace " +
                                horas + " horas";
                        } else {
                            var dias = Math.floor(
                                horas / 24);
                            tooltip = "Hace " +
                                dias + " días";
                        }

                        return '<span title="' +
                            tooltip +
                            '" class="text-nowrap">' +
                            texto + '</span>';
                    }
                    return '<span class="text-muted">Nunca</span>';
                },
                filterable: {
                    ui: "datetimepicker"
                }
            },
            {
                field: "estatus",
                title: "Estatus",
                width: "110px",
                template: function(dataItem) {
                    if (!dataItem
                        .usuario_actualizado) {
                        return '<span class="badge bg-secondary">Inactivo</span>';
                    }

                    var fecha = new Date(dataItem
                        .usuario_actualizado);
                    var ahora = new Date();
                    var diferencia = ahora - fecha;
                    var horas = Math.floor(
                        diferencia / (1000 *
                            60 * 60));

                    if (horas < 1) {
                        return '<span class="badge bg-success">En línea</span>';
                    } else if (horas < 24) {
                        return '<span class="badge bg-info">Activo hoy</span>';
                    } else if (horas < 168) {
                        return '<span class="badge bg-warning">Reciente</span>';
                    } else {
                        return '<span class="badge bg-secondary">Inactivo</span>';
                    }
                },
                filterable: {
                    multi: true
                }
            },
            {
                title: "Acciones",
                width: "140px",
                template: function(dataItem) {
                    return '<div class="d-flex justify-content-center gap-1">' +
                        '<button class="btn btn-sm btn-outline-primary btn-editar" data-id="' +
                        dataItem.id +
                        '" title="Editar">' +
                        '<i class="fas fa-edit"></i>' +
                        '</button>' +
                        '<button class="btn btn-sm btn-outline-info btn-ver" data-id="' +
                        dataItem.id +
                        '" title="Ver">' +
                        '<i class="fas fa-eye"></i>' +
                        '</button>' +
                        '<button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="' +
                        dataItem.id +
                        '" title="Eliminar">' +
                        '<i class="fas fa-trash"></i>' +
                        '</button>' +
                        '</div>';
                },
                attributes: {
                    "class": "text-center"
                },
                filterable: false,
                sortable: false
            }
        ],
        dataBound: function(e) {
            // Agregar eventos a los botones
            $(".btn-editar").off('click').click(
                function() {
                    var id = $(this).data("id");
                    var grid = $("#grid").data(
                        "kendoGrid");
                    var data = grid.dataSource
                        .data();

                    // Buscar usuario por ID
                    var usuario = data.find(
                        function(item) {
                            return item.id ==
                                id;
                        });

                    if (usuario) {
                        // Aquí iría la función cargarDatosUsuario
                        cargarDatosUsuarioModal(
                            usuario);
                    }
                });

            $(".btn-ver").click(function() {
                var id = $(this).data("id");
                verUsuario(id);
            });

            $(".btn-eliminar").click(function() {
                var id = $(this).data("id");
                eliminarUsuario(id);
            });

            // Actualizar contador
            var total = this.dataSource.total();
            $("#contadorUsuarios").text(total +
                " usuarios");

            // Ajustar automáticamente el ancho de las columnas
            this.resize();
        },
        resize: function(e) {
            // Ajustar columnas al cambiar tamaño
            var grid = e.sender;
            grid.resize();
        }
    });
    }

    // Funciones de acción
    function editarUsuario(id) {
        console.log("Editar usuario ID:", id);
        // Implementar edición
    }

    function verUsuario(id) {
        console.log("Ver usuario ID:", id);
        // Implementar visualización
    }

    function eliminarUsuario(id) {
        if (confirm("¿Está seguro de eliminar este usuario?")) {
            console.log("Eliminar usuario ID:", id);
            // Implementar eliminación
        }
    }

    // Recargar usuarios
    $("#btnRecargarUsuarios").click(function() {
        cargarUsuarios();
    });

    // Ajustar grid al cambiar tamaño de ventana
    $(window).resize(function() {
        var grid = $("#grid").data("kendoGrid");
        if (grid) {
            grid.resize();
        }
    });

    // Función global para cargar datos del usuario en el modal de edición
    function cargarDatosUsuarioModal(usuario) {
        console.log('Cargando datos del usuario:', usuario);

        // 1. Llenar información básica
        $('#editar_id').val(usuario.id);
        $('#editar_nombre').val(usuario.nombre || '');
        $('#editar_apepat').val(usuario.apepat || '');
        $('#editar_apemat').val(usuario.apemat || '');
        $('#editar_usuario').val(usuario.user || '');
        $('#editar_correo').val(usuario.correo || '');
        $('#editar_celular').val(usuario.cel || '');
        $('#editar_rol').val(usuario.rol || 'usuario');
        $('#editar_organizacion').val(usuario.id_organizacion || '');

        // Manejar contraseñas
        $('#toggleCambiarClave').prop('checked', false);
        $('#contenedorClave').hide();
        $('#editar_clave1').val('');
        $('#editar_clave2').val('');
        $('#editar_clave1').prop('required', false);
        $('#editar_clave2').prop('required', false);

        // 5. Cargar menús del usuario
        cargarMenusUsuarioEdicion(usuario.menu);

        // 6. Actualizar título del modal con el nombre del usuario
        $('#modalEditarUsuarioLabel').html(
            '<i class="fas fa-user-edit me-2"></i>Editar Usuario: ' +
            usuario.nombre + ' ' + usuario.apepat);

        // 7. Mostrar el modal
        $('#modalEditarUsuario').modal('show');

        // 8. Validación del formulario
        var forms = document.querySelectorAll('.FormularioEditarAjax');
        Array.prototype.slice.call(forms).forEach(function(form) {
            form.classList.remove('was-validated');
        });
    }

    // Función para cargar menús en el modal de edición
    function cargarMenusUsuarioEdicion(menuJson) {
    try {
    console.log('Cargando menús del usuario:', menuJson);

    // Resetear ListBoxes
    var listboxDisponibleEditar = $("#listboxDisponibleEditar")
        .data("kendoListBox");
    var listboxAsignadoEditar = $("#listboxAsignadoEditar")
        .data("kendoListBox");

    if (listboxDisponibleEditar && listboxAsignadoEditar) {
        // Limpiar ListBox asignado
        listboxAsignadoEditar.dataSource.data([]);

        // Restaurar todos los menús en disponible
        var menuData = [{
                id: 1,
                ruta: "/dashboard",
                nombre: "Dashboard",
                icono: "fas fa-home"
            },
            {
                id: 2,
                ruta: "/usuarios",
                nombre: "Usuarios",
                icono: "fas fa-users"
            },
            {
                id: 3,
                ruta: "/reportes",
                nombre: "Reportes",
                icono: "fas fa-chart-bar"
            },
            {
                id: 4,
                ruta: "/configuracion",
                nombre: "Configuración",
                icono: "fas fa-cog"
            },
            {
                id: 5,
                ruta: "/perfil",
                nombre: "Perfil",
                icono: "fas fa-user-circle"
            },
            {
                id: 6,
                ruta: "/clientos",
                nombre: "Clientes",
                icono: "fas fa-address-book"
            },
            {
                id: 7,
                ruta: "/productos",
                nombre: "Productos",
                icono: "fas fa-box"
            }
        ];

    listboxDisponibleEditar.dataSource.data(menuData);

    // Si el usuario tiene menús asignados
    if (menuJson && menuJson !== '' && menuJson !==
        'null') {
        var menusUsuario = [];

        // Parsear el JSON de menús
        try {
            if (typeof menuJson === 'string') {
                menusUsuario = JSON.parse(menuJson);
            } else {
                menusUsuario = menuJson;
            }
        } catch (e) {
            console.error('Error al parsear JSON de menús:',
                e);
            // Intentar limpiar el JSON si tiene problemas
            try {
                var cleanedJson = menuJson.replace(/\\/g,
                    '');
                menusUsuario = JSON.parse(cleanedJson);
            } catch (e2) {
                console.error('Error al limpiar JSON:', e2);
                menusUsuario = [];
            }
        }

                    console.log('Menús parseados:', menusUsuario);

                    if (Array.isArray(menusUsuario) && menusUsuario
                        .length > 0) {
                        // Para cada menú del usuario
                        menusUsuario.forEach(function(menuUsuario) {
                            // Buscar en los menús disponibles
                            var menuEncontrado = menuData.find(
                                function(menuItem) {
                                    return menuItem.ruta ===
                                        menuUsuario.ruta ||
                                        menuItem.nombre ===
                                        menuUsuario
                                        .nombre ||
                                        (menuUsuario.ruta &&
                                            menuItem.ruta
                                            .includes(
                                                menuUsuario
                                                .ruta)) ||
                                        (menuUsuario
                                            .nombre &&
                                            menuItem.nombre
                                            .includes(
                                                menuUsuario
                                                .nombre));
                                });

                            if (menuEncontrado) {
                                // Agregar al ListBox asignado
                                listboxAsignadoEditar.add(
                                    menuEncontrado);

                                // Remover del ListBox disponible
                                var items =
                                    listboxDisponibleEditar
                                    .items();
                                for (var i = 0; i < items
                                    .length; i++) {
                                    var dataItem =
                                        listboxDisponibleEditar
                                        .dataItem(items[i]);
                                    if (dataItem && dataItem
                                        .id === menuEncontrado
                                        .id) {
                                        listboxDisponibleEditar
                                            .remove(items[i]);
                                        break;
                                    }
                                }
                            } else {
                                // Si no existe en nuestros datos, crear uno nuevo
                                var nuevoMenu = {
                                    id: menuData.length + 1,
                                    ruta: menuUsuario
                                        .ruta || '',
                                    nombre: menuUsuario
                                        .nombre || '',
                                    icono: menuUsuario
                                        .icono ||
                                        'fas fa-question-circle'
                                };
                                listboxAsignadoEditar.add(
                                    nuevoMenu);
                            }
                        });
                    }
                }

                // Actualizar campo oculto
                actualizarCampoMenuEditar();
            }
        } catch (error) {
            console.error('Error al cargar menús:', error);
        }
    }

    // Función para actualizar campo oculto de menús en edición
    function actualizarCampoMenuEditar() {
        try {
            var listboxAsignadoEditar = $("#listboxAsignadoEditar")
                .data("kendoListBox");
            if (listboxAsignadoEditar) {
                var menus = listboxAsignadoEditar.dataItems();
                var menusArray = [];

                for (var i = 0; i < menus.length; i++) {
                    menusArray.push({
                        ruta: menus[i].ruta || "",
                        nombre: menus[i].nombre || "",
                        icono: menus[i].icono || ""
                    });
                }

                var jsonString = JSON.stringify(menusArray);
                $('#usuario_menu_editar').val(jsonString);
                console.log('Menús actualizados:', jsonString);
            }
        } catch (error) {
            console.error('Error al actualizar campo menús:', error);
        }
    }

    // Función para inicializar eventos del modal de edición
    function inicializarModalEdicion() {
        // Toggle para cambiar contraseña
        $('#toggleCambiarClave').off('change').change(function() {
            if ($(this).is(':checked')) {
                $('#contenedorClave').slideDown();
                $('#editar_clave1').prop('required', true);
                $('#editar_clave2').prop('required', true);
            } else {
                $('#contenedorClave').slideUp();
                $('#editar_clave1').prop('required', false);
                $('#editar_clave2').prop('required', false);
                $('#editar_clave1').val('');
                $('#editar_clave2').val('');
            }
        });

        // Limpiar formulario
        $('#btnLimpiarEdicion').off('click').click(function() {
            limpiarFormularioEdicion();
        });

        // Inicializar ListBoxes si no están inicializados
        if (!$("#listboxDisponibleEditar").data("kendoListBox")) {
            var listboxDisponibleEditar = $("#listboxDisponibleEditar")
                .kendoListBox({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: [{
                            id: 1,
                            ruta: "/dashboard",
                            nombre: "Dashboard",
                            icono: "fas fa-home"
                        },
                        {
                            id: 2,
                            ruta: "/usuarios",
                            nombre: "Usuarios",
                            icono: "fas fa-users"
                        },
                        {
                            id: 3,
                            ruta: "/reportes",
                            nombre: "Reportes",
                            icono: "fas fa-chart-bar"
                        },
                        {
                            id: 4,
                            ruta: "/configuracion",
                            nombre: "Configuración",
                            icono: "fas fa-cog"
                        },
                        {
                            id: 5,
                            ruta: "/perfil",
                            nombre: "Perfil",
                            icono: "fas fa-user-circle"
                        },
                        {
                            id: 6,
                            ruta: "/clientos",
                            nombre: "Clientes",
                            icono: "fas fa-address-book"
                        },
                        {
                            id: 7,
                            ruta: "/productos",
                            nombre: "Productos",
                            icono: "fas fa-box"
                        }
                    ],
                    connectWith: "listboxAsignadoEditar",
                    template: '<div class="menu-item">' +
                        '<i class="#= icono # me-2"></i>' +
                        '<span>#= nombre #</span>' +
                        '<small class="text-muted d-block">#= ruta #</small>' +
                        '</div>'
                }).data("kendoListBox");

            var listboxAsignadoEditar = $("#listboxAsignadoEditar")
                .kendoListBox({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: [],
                    template: '<div class="menu-item">' +
                        '<i class="#= icono # me-2"></i>' +
                        '<span>#= nombre #</span>' +
                        '<small class="text-muted d-block">#= ruta #</small>' +
                        '</div>'
                }).data("kendoListBox");

            // Configurar eventos de los ListBoxes
            listboxDisponibleEditar.bind("add",
                actualizarCampoMenuEditar);
            listboxDisponibleEditar.bind("remove",
                actualizarCampoMenuEditar);
            listboxAsignadoEditar.bind("add",
            actualizarCampoMenuEditar);
            listboxAsignadoEditar.bind("remove",
                actualizarCampoMenuEditar);
        }
    }

    // Función para limpiar formulario de edición
    function limpiarFormularioEdicion() {
        var usuarioId = $('#editar_id').val();
        var usuarioActual = $('#editar_usuario').val();

        // Resetear formulario
        $('.FormularioEditarAjax')[0].reset();

        // Restaurar ID y usuario (no se pueden cambiar)
        $('#editar_id').val(usuarioId || '');
        $('#editar_usuario').val(usuarioActual || '');

        // Restaurar rol si estaba seleccionado
        if (usuarioId) {
            $('#editar_rol').val($('#editar_rol').val() || 'usuario');
        }

        // Resetear ListBoxes
        var listboxAsignadoEditar = $("#listboxAsignadoEditar").data(
            "kendoListBox");
        var listboxDisponibleEditar = $("#listboxDisponibleEditar")
            .data("kendoListBox");

        if (listboxAsignadoEditar && listboxDisponibleEditar) {
            listboxAsignadoEditar.dataSource.data([]);
            listboxDisponibleEditar.dataSource.data([{
                    id: 1,
                    ruta: "/dashboard",
                    nombre: "Dashboard",
                    icono: "fas fa-home"
                },
                {
                    id: 2,
                    ruta: "/usuarios",
                    nombre: "Usuarios",
                    icono: "fas fa-users"
                },
                {
                    id: 3,
                    ruta: "/reportes",
                    nombre: "Reportes",
                    icono: "fas fa-chart-bar"
                },
                {
                    id: 4,
                    ruta: "/configuracion",
                    nombre: "Configuración",
                    icono: "fas fa-cog"
                },
                {
                    id: 5,
                    ruta: "/perfil",
                    nombre: "Perfil",
                    icono: "fas fa-user-circle"
                },
                {
                    id: 6,
                    ruta: "/clientos",
                    nombre: "Clientes",
                    icono: "fas fa-address-book"
                },
                {
                    id: 7,
                    ruta: "/productos",
                    nombre: "Productos",
                    icono: "fas fa-box"
                }
            ]);
        }

        // Resetear toggle de contraseña
        $('#toggleCambiarClave').prop('checked', false);
        $('#contenedorClave').hide();

        // Limpiar validación
        var forms = document.querySelectorAll('.FormularioEditarAjax');
        Array.prototype.slice.call(forms).forEach(function(form) {
            form.classList.remove('was-validated');
        });

        console.log('Formulario de edición limpiado');
    }

    // Inicializar cuando el DOM esté listo
    $(document).ready(function() {
        inicializarModalEdicion();
        // Cargar usuarios al iniciar
        cargarUsuarios();
    });
});


$(document).ready(function() {
    // Validación del formulario Bootstrap
    var menusJSON = [];

    // Modal para agregar menú
    $('#btnAgregarMenu').click(function() {
        $('#modalAgregarMenu').modal('show');
    });

    // Inicializar ListBoxes
    var notification = $("#appendto").kendoNotification({
        autoHideAfter: 4000,
        animation: {
            open: {
                effects: "fade:in"
            },
            close: {
                effects: "none"
            }
        }
    }).data("kendoNotification");

    // Datos de ejemplo para menús
    var menuData = [{
            id: 1,
            ruta: "dashboard",
            nombre: "Dashboard",
            icono: "fas fa-home"
        },
        {
            id: 2,
            ruta: "userNew",
            nombre: "Usuarios",
            icono: "fas fa-users"
        },
        {
            id: 3,
            ruta: "logOut",
            nombre: "Cerrar Sesión",
            icono: "fas fa-sign-out-alt"
        }
    ];

    var listboxDisponible = $("#listboxDisponible").kendoListBox({
        dataTextField: "nombre",
        dataValueField: "id",
        dataSource: menuData,
        connectWith: "listboxAsignado",
        template: '<div class="menu-item">' +
            '<i class="#= icono # me-2"></i>' +
            '<span>#= nombre #</span>' +
            '<small class="text-muted d-block">#= ruta #</small>' +
            '</div>',
        draggable: {
            placeholder: customPlaceholder
        },
        toolbar: {
            position: "right",
            tools: ["transferTo", "transferFrom", "transferAllFrom", "remove"]
        }

    }).data("kendoListBox");

    var listboxAsignado = $("#listboxAsignado").kendoListBox({
        dataTextField: "nombre",
        dataValueField: "id",
        dataSource: [],
        template: '<div class="menu-item">' +
            '<i class="#= icono # me-2"></i>' +
            '<span>#= nombre #</span>' +
            '<small class="text-muted d-block">#= ruta #</small>' +
            '</div>',
        draggable: {
            placeholder: customPlaceholder
        },
        add: onAdd,
        remove: onRemove,

    }).data("kendoListBox");

    // Botones de control del ListBox

    function onAdd(e) {

        var selectedListBox = $("#listboxAsignado").data("kendoListBox");
        var dataItems = selectedListBox.dataItems();

        console.log(dataItems.length);
        // Recorrer todos los elementos



        e.dataItems.forEach(function(item, index) {
            console.log(`Elemento ${index + 1}:`);
            console.log("  ID:", item.id);
            console.log("  Nombre:", item.nombre);
            console.log("  Ruta:", item.ruta);
            console.log("  Icono:", item.icono);

            // Agregar al array JSON
            menusJSON.push({
                ruta: item.ruta || "",
                nombre: item.nombre || "",
                icono: item.icono || ""
            });
        });

        $('#usuario_menu').val(JSON.stringify(menusJSON));
        console.log("JSON generado:", JSON.stringify(menusJSON, null, 2));


    }






    function onRemove(e) {
        console.log("remove : " + getWidgetName(e) + " : " + e.dataItems.length + " item(s)");
    };

    function customPlaceholder(draggedItem) {
        return draggedItem
            .clone()
            .addClass("custom-placeholder")
            .removeClass("k-ghost");
    }


    // Agregar nuevo menú
    $("#btnGuardarMenu").click(function() {
        var ruta = $("#rutaMenu").val();
        var nombre = $("#nombreMenu").val();
        var icono = $("#iconoMenu").val();

        if (ruta && nombre && icono) {
            var nuevoId = menuData.length + 1;
            var nuevoMenu = {
                id: nuevoId,
                ruta: ruta,
                nombre: nombre,
                icono: icono
            };

            menuData.push(nuevoMenu);
            listboxDisponible.dataSource.read();

            $("#rutaMenu").val('');
            $("#nombreMenu").val('');
            $("#iconoMenu").val('');

            $('#modalAgregarMenu').modal('hide');
            showAlert('Menú agregado correctamente', 'success');
        } else {
            showAlert('Complete todos los campos del menú', 'danger');
        }
    });
    // Función para actualizar campo oculto con menús seleccionados
    function actualizarCampoMenu() {
        var menus = listboxAsignado.dataItems();
        var ids = menus.map(function(item) {
            return item.id;
        });


        // También puedes mostrar la cantidad seleccionada
        var cantidad = ids.length;
        $('#contadorMenus').remove();
        if (cantidad > 0) {
            $('h5:contains("Permisos de Menú")').append(
                '<span id="contadorMenus" class="badge bg-primary ms-2">' + cantidad +
                ' seleccionados</span>');
        }
    }

    // Escuchar cambios en los ListBox
    listboxDisponible.bind("change", actualizarCampoMenu);
    listboxAsignado.bind("change", actualizarCampoMenu);
    listboxDisponible.bind("dragend", actualizarCampoMenu);
    listboxAsignado.bind("dragend", actualizarCampoMenu);

    // Función para validar y enviar formulario de creación
    function validarFormularioCrear() {
        const form = document.getElementById('formCrearUsuario');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        enviarNuevoUsuario();
    }

    // Función para validar y enviar formulario de edición
    function validarFormularioEditar() {
        const form = document.getElementById('formEditarUsuario');
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        enviarActualizacionUsuario();
    }

    // Inicializar contador de menús
    actualizarCampoMenu();

    // añadir listeners para los formularios de usuario
    document.getElementById('formCrearUsuario').addEventListener('submit', function(e) {
        e.preventDefault();
        validarFormularioCrear();
    });
    document.getElementById('formEditarUsuario').addEventListener('submit', function(e) {
        e.preventDefault();
        validarFormularioEditar();
    });

    // cargar organizaciones al preparar el modal
    cargarOrganizaciones();
});

// funciones para enviar datos al API
async function enviarNuevoUsuario() {
    const data = {
        usuario_nombre: document.getElementById('nombre').value,
        apepat: document.getElementById('apellido1').value,
        usuario_apemat: document.getElementById('apellido2').value,
        usuario_email: document.getElementById('correo').value,
        usuario_cel: document.getElementById('celular').value,
        usuario_usuario: document.getElementById('usuario').value,
        usuario_clave_1: document.getElementById('clave1').value,
        usuario_rol: document.getElementById('rol').value,
        usuario_menu: document.getElementById('usuario_menu').value,
        usuario_organizacion: document.getElementById('organizacion').value,
        usuario_foto: document.getElementById('fotoPerfil')?.value || ''
    };
    try {
        const resp = await fetch('/api/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (resp.ok) {
            alert('Usuario creado correctamente');
            $('#altaUsuarios').modal('hide');
            cargarUsuarios();
            document.getElementById('formCrearUsuario').reset();
        } else {
            const err = await resp.json();
            alert('Error: ' + (err.error || '')); 
        }
    } catch (e) {
        console.error(e);
        alert('Error creando usuario');
    }
}

async function enviarActualizacionUsuario() {
    const id = document.getElementById('editar_id').value;
    const data = {
        usuario_nombre: document.getElementById('editar_nombre').value,
        apepat: document.getElementById('editar_apepat').value,
        usuario_apemat: document.getElementById('editar_apemat').value,
        usuario_email: document.getElementById('editar_correo').value,
        usuario_cel: document.getElementById('editar_celular').value,
        usuario_rol: document.getElementById('editar_rol').value,
        usuario_menu: document.getElementById('usuario_menu_editar').value,
        usuario_organizacion: document.getElementById('editar_organizacion').value,
        usuario_foto: document.getElementById('editar_fotoPerfil')?.value || ''
    };
    const clave = document.getElementById('editar_clave1').value;
    if (clave) data.usuario_clave_1 = clave;
    try {
        const resp = await fetch('/api/usuarios/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (resp.ok) {
            alert('Usuario actualizado');
            $('#editarUsuarios').modal('hide');
            cargarUsuarios();
        } else {
            const err = await resp.json();
            alert('Error: ' + (err.error || ''));
        }
    } catch (e) {
        console.error(e);
        alert('Error actualizando usuario');
    }
}

$(document).ready(function() {
    // Datos de menús disponibles (mismos que en el modal de alta)
    var menuData = [{
            id: 1,
            ruta: "/dashboard",
            nombre: "Dashboard",
            icono: "fas fa-home"
        },
        {
            id: 2,
            ruta: "/usuarios",
            nombre: "Usuarios",
            icono: "fas fa-users"
        },
        {
            id: 3,
            ruta: "/reportes",
            nombre: "Reportes",
            icono: "fas fa-chart-bar"
        },
        {
            id: 4,
            ruta: "/configuracion",
            nombre: "Configuración",
            icono: "fas fa-cog"
        },
        {
            id: 5,
            ruta: "/perfil",
            nombre: "Perfil",
            icono: "fas fa-user-circle"
        },
        {
            id: 6,
            ruta: "/clientes",
            nombre: "Clientes",
            icono: "fas fa-address-book"
        },
        {
            id: 7,
            ruta: "/productos",
            nombre: "Productos",
            icono: "fas fa-box"
        }
    ];

    // Inicializar ListBoxes para edición
    var listboxDisponibleEditar = $("#listboxDisponibleEditar").kendoListBox({
        dataTextField: "nombre",
        dataValueField: "id",
        dataSource: menuData,
        connectWith: "listboxAsignadoEditar",
        template: '<div class="menu-item">' +
            '<i class="#= icono # me-2"></i>' +
            '<span>#= nombre #</span>' +
            '<small class="text-muted d-block">#= ruta #</small>' +
            '</div>'
    }).data("kendoListBox");

    var listboxAsignadoEditar = $("#listboxAsignadoEditar").kendoListBox({
        dataTextField: "nombre",
        dataValueField: "id",
        dataSource: [],
        template: '<div class="menu-item">' +
            '<i class="#= icono # me-2"></i>' +
            '<span>#= nombre #</span>' +
            '<small class="text-muted d-block">#= ruta #</small>' +
            '</div>'
    }).data("kendoListBox");

    // Toggle para cambiar contraseña
    $('#toggleCambiarClave').change(function() {
        if ($(this).is(':checked')) {
            $('#contenedorClave').slideDown();
            $('#editar_clave1').prop('required', true);
            $('#editar_clave2').prop('required', true);
        } else {
            $('#contenedorClave').slideUp();
            $('#editar_clave1').prop('required', false);
            $('#editar_clave2').prop('required', false);
            $('#editar_clave1').val('');
            $('#editar_clave2').val('');
        }
    });

    // Función para cargar datos del usuario en el modal
    function cargarDatosUsuario(usuario) {
        // Información básica
        $('#editar_id').val(usuario.id);
        $('#editar_nombre').val(usuario.nombre);
        $('#editar_apepat').val(usuario.apepat);
        $('#editar_apemat').val(usuario.apemat);
        $('#editar_usuario').val(usuario.user);
        $('#editar_correo').val(usuario.correo);
        $('#editar_celular').val(usuario.cel || '');
        $('#editar_rol').val(usuario.rol);

        // Cargar menús del usuario
        cargarMenusUsuario(usuario.menu);

        // Resetear campos de contraseña
        $('#toggleCambiarClave').prop('checked', false);
        $('#contenedorClave').hide();
        $('#editar_clave1').val('');
        $('#editar_clave2').val('');

        // Mostrar modal
        $('#modalEditarUsuario').modal('show');
    }

    // Función para cargar los menús del usuario
    function cargarMenusUsuario(menuJson) {
        try {
            // Limpiar ListBox asignado
            listboxAsignadoEditar.dataSource.data([]);

            if (menuJson) {
                var menus = JSON.parse(menuJson);

                // Filtrar menús que existen en nuestra lista
                var menusFiltrados = menuData.filter(function(menuItem) {
                    return menus.some(function(userMenu) {
                        return userMenu.ruta === menuItem.ruta ||
                            userMenu.nombre === menuItem.nombre;
                    });
                });

                // Agregar al ListBox asignado
                listboxAsignadoEditar.add(menusFiltrados);

                // Remover de disponible
                menusFiltrados.forEach(function(menu) {
                    var itemToRemove = listboxDisponibleEditar.items().filter(function(
                        idx) {
                        var dataItem = listboxDisponibleEditar.dataItem(idx);
                        return dataItem.id === menu.id;
                    });
                    if (itemToRemove.length > 0) {
                        listboxDisponibleEditar.remove(itemToRemove);
                    }
                });

                // Actualizar campo oculto
                actualizarCampoMenuEditar();
            }
        } catch (error) {
            console.error('Error al parsear menús:', error);
        }
    }

    // Actualizar campo oculto de menús en edición
    function actualizarCampoMenuEditar() {
        var menus = listboxAsignadoEditar.dataItems();
        var menusArray = menus.map(function(item) {
            return {
                ruta: item.ruta || "",
                nombre: item.nombre || "",
                icono: item.icono || ""
            };
        });
        $('#usuario_menu_editar').val(JSON.stringify(menusArray));
    }

    // Eventos para actualizar menús en edición
    listboxDisponibleEditar.bind("add", actualizarCampoMenuEditar);
    listboxDisponibleEditar.bind("remove", actualizarCampoMenuEditar);
    listboxAsignadoEditar.bind("add", actualizarCampoMenuEditar);
    listboxAsignadoEditar.bind("remove", actualizarCampoMenuEditar);

    // Función para limpiar formulario de edición
    window.limpiarFormularioEdicion = function() {
        var usuarioId = $('#editar_id').val();
        var usuarioActual = $('#editar_usuario').val();

        // Mantener ID y usuario (no se pueden cambiar)
        var tempId = usuarioId;
        var tempUsuario = usuarioActual;

        // Resetear formulario
        $('.FormularioEditarAjax')[0].reset();

        // Restaurar ID y usuario
        $('#editar_id').val(tempId);
        $('#editar_usuario').val(tempUsuario);

        // Resetear ListBoxes
        listboxAsignadoEditar.dataSource.data([]);
        listboxDisponibleEditar.dataSource.data(menuData);

        // Resetear toggle de contraseña
        $('#toggleCambiarClave').prop('checked', false);
        $('#contenedorClave').hide();
    };

    // En el dataBound del grid, modificar el evento del botón editar
    function configurarBotonEditarEnGrid() {
        $(".btn-editar").off('click').click(function() {
            var id = $(this).data("id");
            var grid = $("#grid").data("kendoGrid");
            var data = grid.dataSource.data();

            // Buscar usuario por ID
            var usuario = data.find(function(item) {
                return item.id == id;
            });

            if (usuario) {
                cargarDatosUsuario(usuario);
            } else {
                alert("No se encontró el usuario");
            }
        });
    }

    
});