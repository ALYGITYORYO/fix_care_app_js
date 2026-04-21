// Servicio de Email - FixCare
const nodemailer = require('nodemailer');

// Configuración SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailersend.net',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || 'MS_5FkqTU@test-r9084zvxz8vgw63d.mlsender.net',
        pass: process.env.SMTP_PASS || 'mssp.Pl7MEux.v69oxl5n0orl785k.ovSYhUH'
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
    tls: {
        rejectUnauthorized: false
    }
});

const senderEmail = process.env.SENDER_EMAIL || 'no-reply@test-r9084zvxz8vgw63d.mlsender.net';
const senderName = 'FixCare - Sistema de Gestión de Incidencias';

/**
 * Enviar email de notificación cuando se crea un ticket
 * @param {Object} ticket - Objeto con datos del ticket y usuario
 * @param {string} ticket.correo_usuario - Email del usuario que creó el ticket
 * @param {string} ticket.nombre_usuario - Nombre completo del usuario
 * @param {number} ticket.id_ticket - ID del ticket creado
 * @param {string} ticket.descripcion - Descripción del ticket
 * @param {string} ticket.nombre_servicio - Tipo de servicio/incidencia
 * @param {string} ticket.edificio - Edificio de la ubicación
 * @param {string} ticket.piso_area - Piso o área del edificio
 * @param {string} ticket.prioridad - Prioridad (Baja, Media, Alta, Urgente)
 * @param {string} ticket.fecha_creacion - Fecha de creación
 */
const sendTicketCreatedEmail = async (ticket) => {
    try {
        const {
            correo_usuario,
            nombre_usuario,
            id_ticket,
            descripcion,
            nombre_servicio,
            edificio,
            piso_area,
            prioridad,
            fecha_creacion
        } = ticket;

        const prioridadColor = {
            'Urgente': '#ef4444',
            'Alta': '#f97316',
            'Media': '#f59e0b',
            'Baja': '#10b981'
        };

        const mailOptions = {
            from: `${senderName} <${senderEmail}>`,
            to: correo_usuario,
            subject: `🎫 Ticket Creado - #${id_ticket} - ${nombre_servicio}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
                    <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <div style="text-align: center; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 20px;">
                            <h2 style="color: #1e293b; margin: 0; font-size: 24px;">¡Ticket Registrado Exitosamente!</h2>
                        </div>
                        
                        <p style="color: #475569; font-size: 16px; margin: 0 0 10px 0;">Hola <strong>${nombre_usuario}</strong>,</p>
                        
                        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Tu ticket ha sido registrado en nuestro sistema y está siendo procesado. A continuación puedes ver los detalles:</p>
                        
                        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e2e8f0 100%); padding: 20px; border-left: 5px solid #6366f1; margin: 25px 0; border-radius: 6px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #334155; font-weight: 600; width: 35%;">ID Ticket:</td>
                                    <td style="padding: 8px 0; color: #1e293b; font-weight: bold; font-size: 16px;">#${id_ticket}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #334155; font-weight: 600;">Servicio:</td>
                                    <td style="padding: 8px 0; color: #1e293b;">${nombre_servicio}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #334155; font-weight: 600;">Ubicación:</td>
                                    <td style="padding: 8px 0; color: #1e293b;">${edificio} - ${piso_area}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #334155; font-weight: 600;">Prioridad:</td>
                                    <td style="padding: 8px 0;"><span style="background-color: ${prioridadColor[prioridad] || '#6366f1'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${prioridad}</span></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #334155; font-weight: 600;">Descripción:</td>
                                    <td style="padding: 8px 0; color: #1e293b; word-break: break-word;">${descripcion}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #334155; font-weight: 600;">Estado:</td>
                                    <td style="padding: 8px 0;"><span style="background-color: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">ABIERTO</span></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #334155; font-weight: 600;">Fecha:</td>
                                    <td style="padding: 8px 0; color: #1e293b;">${new Date(fecha_creacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                            ✅ Tu ticket ha sido asignado para su revisión. Puedes hacer seguimiento en el sistema ingresando con tu usuario.
                        </p>

                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                            <strong>Próximos pasos:</strong>
                            <br>• Un técnico revisará tu solicitud pronto
                            <br>• Recibirás notificaciones por cada actualización
                            <br>• Guarda tu ID de ticket (#${id_ticket}) para futuras referencias
                        </p>
                        
                        <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <p style="color: #0c4a6e; font-size: 13px; margin: 0; font-weight: 500;">
                                💡 <strong>Tip:</strong> Mantén tu número de ticket a mano. Lo necesitarás para dar seguimiento.
                            </p>
                        </div>
                        
                        <div style="border-top: 2px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                            <p style="color: #94a3b8; font-size: 12px; margin: 0;">Este es un correo automático, por favor no responder a este mensaje.</p>
                            <p style="color: #94a3b8; font-size: 12px; margin: 8px 0;">© 2026 FixCare - Universidad Tecnológica de Morelia</p>
                        </div>
                    </div>
                </div>
            `,
            text: `Ticket #${id_ticket} - ${nombre_servicio}\nDescripción: ${descripcion}\nUbicación: ${edificio} - ${piso_area}\nPrioridad: ${prioridad}\nEstado: ABIERTO`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email de creación de ticket enviado a ${correo_usuario}. ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Error al enviar email de creación a ${ticket.correo_usuario}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar email de asignación de ticket a técnico
 * @param {Object} asignacion - Objeto con datos de la asignación
 * @param {string} asignacion.correo_tecnico - Email del técnico
 * @param {string} asignacion.nombre_tecnico - Nombre completo del técnico
 * @param {number} asignacion.id_ticket - ID del ticket
 * @param {string} asignacion.descripcion - Descripción del ticket
 * @param {string} asignacion.nombre_servicio - Tipo de servicio
 * @param {string} asignacion.edificio - Edificio de la ubicación
 * @param {string} asignacion.piso_area - Piso o área
 * @param {string} asignacion.prioridad - Prioridad del ticket
 * @param {string} asignacion.nombre_solicitante - Nombre del usuario que solicitó
 * @param {string} asignacion.correo_solicitante - Email del solicitante
 */
const sendTicketAssignedEmail = async (asignacion) => {
    try {
        const {
            correo_tecnico,
            nombre_tecnico,
            id_ticket,
            descripcion,
            nombre_servicio,
            edificio,
            piso_area,
            prioridad,
            nombre_solicitante,
            correo_solicitante
        } = asignacion;

        const prioridadColor = {
            'Urgente': '#ef4444',
            'Alta': '#f97316',
            'Media': '#f59e0b',
            'Baja': '#10b981'
        };

        const mailOptions = {
            from: `${senderName} <${senderEmail}>`,
            to: correo_tecnico,
            subject: `⚙️ Nuevo Ticket Asignado - #${id_ticket} - ${nombre_servicio}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
                    <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <div style="text-align: center; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 20px;">
                            <h2 style="color: #1e293b; margin: 0; font-size: 24px;">Nuevo Ticket Asignado</h2>
                        </div>
                        
                        <p style="color: #475569; font-size: 16px; margin: 0 0 10px 0;">Hola <strong>${nombre_tecnico}</strong>,</p>
                        
                        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Se te ha asignado un nuevo ticket que requiere tu atención. Revisa los detalles a continuación:</p>
                        
                        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e2e8f0 100%); padding: 20px; border-left: 5px solid #6366f1; margin: 25px 0; border-radius: 6px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #334155; font-weight: 600; width: 35%;">ID Ticket:</td>
                                    <td style="padding: 8px 0; color: #1e293b; font-weight: bold; font-size: 16px;">#${id_ticket}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #334155; font-weight: 600;">Servicio:</td>
                                    <td style="padding: 8px 0; color: #1e293b;">${nombre_servicio}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #334155; font-weight: 600;">Descripción:</td>
                                    <td style="padding: 8px 0; color: #1e293b; word-break: break-word;">${descripcion}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #334155; font-weight: 600;">Ubicación:</td>
                                    <td style="padding: 8px 0; color: #1e293b;">${edificio} - ${piso_area}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #334155; font-weight: 600;">Prioridad:</td>
                                    <td style="padding: 8px 0;"><span style="background-color: ${prioridadColor[prioridad] || '#6366f1'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${prioridad}</span></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #334155; font-weight: 600;">Solicitante:</td>
                                    <td style="padding: 8px 0; color: #1e293b;">${nombre_solicitante}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #334155; font-weight: 600;">Email Solicitante:</td>
                                    <td style="padding: 8px 0; color: #0ea5e9;"><a href="mailto:${correo_solicitante}" style="color: #0ea5e9; text-decoration: none;">${correo_solicitante}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #334155; font-weight: 600;">Estado:</td>
                                    <td style="padding: 8px 0;"><span style="background-color: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">ASIGNADO</span></td>
                                </tr>
                            </table>
                        </div>

                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                            <strong>Acciones recomendadas:</strong>
                            <br>1. 👁️ Revisa todos los detalles del ticket
                            <br>2. 📞 Contacta al solicitante si necesitas más información
                            <br>3. 🔨 Comienza el trabajo de resolución
                            <br>4. ✏️ Actualiza el estado del ticket en el sistema
                        </p>

                        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <p style="color: #92400e; font-size: 13px; margin: 0; font-weight: 500;">
                                ⏰ <strong>Recuerda:</strong> Actualiza el estado del ticket periódicamente para mantener informado al solicitante.
                            </p>
                        </div>
                        
                        <div style="border-top: 2px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                            <p style="color: #94a3b8; font-size: 12px; margin: 0;">Este es un correo automático, por favor no responder a este mensaje.</p>
                            <p style="color: #94a3b8; font-size: 12px; margin: 8px 0;">© 2026 FixCare - Universidad Tecnológica de Morelia</p>
                        </div>
                    </div>
                </div>
            `,
            text: `Ticket Asignado #${id_ticket}\nServicio: ${nombre_servicio}\nDescripción: ${descripcion}\nUbicación: ${edificio} - ${piso_area}\nPrioridad: ${prioridad}\nSolicitante: ${nombre_solicitante} (${correo_solicitante})`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email de asignación enviado a ${correo_tecnico}. ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Error al enviar email de asignación a ${asignacion.correo_tecnico}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar email de actualización de estado a usuario
 * @param {Object} actualizacion - Objeto con datos de la actualización
 * @param {string} actualizacion.correo_usuario - Email del usuario
 * @param {string} actualizacion.nombre_usuario - Nombre del usuario
 * @param {number} actualizacion.id_ticket - ID del ticket
 * @param {string} actualizacion.estatus_anterior - Estatus anterior
 * @param {string} actualizacion.estatus_nuevo - Nuevo estatus
 * @param {string} actualizacion.comentarios - Comentarios del técnico
 */
const sendTicketStatusUpdateEmail = async (actualizacion) => {
    try {
        const {
            correo_usuario,
            nombre_usuario,
            id_ticket,
            estatus_anterior,
            estatus_nuevo,
            comentarios
        } = actualizacion;

        const estatusColor = {
            'Abierto': '#f59e0b',
            'En Progreso': '#3b82f6',
            'Resuelto': '#10b981',
            'Cerrado': '#6b7280'
        };

        const mailOptions = {
            from: `${senderName} <${senderEmail}>`,
            to: correo_usuario,
            subject: `📊 Actualización de Ticket - #${id_ticket}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
                    <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <div style="text-align: center; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 20px;">
                            <h2 style="color: #1e293b; margin: 0; font-size: 24px;">Actualización del Ticket</h2>
                        </div>
                        
                        <p style="color: #475569; font-size: 16px; margin: 0 0 10px 0;">Hola <strong>${nombre_usuario}</strong>,</p>
                        
                        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Tu ticket #${id_ticket} ha sido actualizado. Aquí están los cambios:</p>
                        
                        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e2e8f0 100%); padding: 20px; border-left: 5px solid #6366f1; margin: 25px 0; border-radius: 6px;">
                            <div style="margin-bottom: 15px;">
                                <p style="color: #334155; font-weight: 600; margin: 0 0 5px 0;">ID Ticket:</p>
                                <p style="color: #1e293b; margin: 0; font-size: 14px;">#${id_ticket}</p>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <p style="color: #334155; font-weight: 600; margin: 0 0 5px 0;">Cambio de Estado:</p>
                                <p style="color: #1e293b; margin: 0; font-size: 14px;">
                                    <span style="background-color: ${estatusColor[estatus_anterior] || '#6b7280'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${estatus_anterior}</span>
                                    → 
                                    <span style="background-color: ${estatusColor[estatus_nuevo] || '#6b7280'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${estatus_nuevo}</span>
                                </p>
                            </div>
                            ${comentarios ? `<div>
                                <p style="color: #334155; font-weight: 600; margin: 0 0 5px 0;">Comentarios:</p>
                                <p style="color: #1e293b; margin: 0; font-size: 14px; word-break: break-word;">${comentarios}</p>
                            </div>` : ''}
                        </div>

                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                            Continuaremos trabajando en tu solicitud. Si tienes alguna pregunta, no dudes en contactarnos.
                        </p>
                        
                        <div style="border-top: 2px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                            <p style="color: #94a3b8; font-size: 12px; margin: 0;">Este es un correo automático, por favor no responder a este mensaje.</p>
                            <p style="color: #94a3b8; font-size: 12px; margin: 8px 0;">© 2026 FixCare - Universidad Tecnológica de Morelia</p>
                        </div>
                    </div>
                </div>
            `,
            text: `Ticket #${id_ticket} actualizado\nEstado: ${estatus_anterior} → ${estatus_nuevo}\nComentarios: ${comentarios || 'N/A'}`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email de actualización enviado a ${correo_usuario}. ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Error al enviar email de actualización a ${actualizacion.correo_usuario}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar email cuando inicia la generación de un reporte
 * @param {Object} datos - Objeto con datos del reporte
 * @param {string} datos.correo_usuario - Email del usuario
 * @param {string} datos.nombre_usuario - Nombre del usuario
 * @param {string} datos.tipo_reporte - Tipo de reporte (ej: "Tickets", "Estadísticas")
 * @param {string} datos.fecha_inicio - Fecha y hora de inicio
 */
const sendReportGeneratedEmail = async (datos) => {
    try {
        const {
            correo_usuario,
            nombre_usuario,
            tipo_reporte,
            fecha_inicio
        } = datos;

        const mailOptions = {
            from: `${senderName} <${senderEmail}>`,
            to: correo_usuario,
            subject: `⏳ Generación de Reporte en Progreso - ${tipo_reporte}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
                    <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <div style="text-align: center; border-bottom: 3px solid #f59e0b; padding-bottom: 20px; margin-bottom: 20px;">
                            <h2 style="color: #1e293b; margin: 0; font-size: 24px;">⏳ Generación de Reporte</h2>
                        </div>
                        
                        <p style="color: #475569; font-size: 16px; margin: 0 0 10px 0;">Hola <strong>${nombre_usuario}</strong>,</p>
                        
                        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Tu solicitud de reporte ha sido recibida y se está procesando. El sistema está generando el documento con la información solicitada.</p>
                        
                        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%); padding: 20px; border-left: 5px solid #f59e0b; margin: 25px 0; border-radius: 6px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #92400e; font-weight: 600; width: 40%;">Tipo de Reporte:</td>
                                    <td style="padding: 8px 0; color: #78350f; font-weight: bold;">${tipo_reporte}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #92400e; font-weight: 600;">Inicio de Generación:</td>
                                    <td style="padding: 8px 0; color: #78350f;">${new Date(fecha_inicio).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #92400e; font-weight: 600;">Estado:</td>
                                    <td style="padding: 8px 0;"><span style="background-color: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">EN PROGRESO</span></td>
                                </tr>
                            </table>
                        </div>

                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                            ⏱️ <strong>Esto puede tomar algunos minutos dependiendo de la cantidad de datos.</strong>
                        </p>

                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                            Recibirás un nuevo correo tan pronto como el reporte esté listo para descargar. No cierres esta sesión mientras se está generando.
                        </p>

                        <div style="background-color: #e0f2fe; border: 1px solid #0284c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <p style="color: #0c4a6e; font-size: 13px; margin: 0; font-weight: 500;">
                                ℹ️ <strong>Nota:</strong> Si esperabas recibir el reporte de forma diferente, verifica tu bandeja de spam o correo no solicitado.
                            </p>
                        </div>
                        
                        <div style="border-top: 2px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                            <p style="color: #94a3b8; font-size: 12px; margin: 0;">Este es un correo automático, por favor no responder a este mensaje.</p>
                            <p style="color: #94a3b8; font-size: 12px; margin: 8px 0;">© 2026 FixCare - Universidad Tecnológica de Morelia</p>
                        </div>
                    </div>
                </div>
            `,
            text: `Tu reporte "${tipo_reporte}" está siendo generado. Recibirás un correo cuando esté listo.`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email de reporte en progreso enviado a ${correo_usuario}. ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Error al enviar email de reporte en progreso:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar email cuando un reporte está finalizado
 * @param {Object} datos - Objeto con datos del reporte completado
 * @param {string} datos.correo_usuario - Email del usuario
 * @param {string} datos.nombre_usuario - Nombre del usuario
 * @param {string} datos.tipo_reporte - Tipo de reporte
 * @param {number} datos.total_registros - Total de registros en el reporte
 * @param {string} datos.enlace_descarga - URL para descargar el reporte
 * @param {string} datos.fecha_finalizacion - Fecha de finalización
 */
const sendReportCompletedEmail = async (datos) => {
    try {
        const {
            correo_usuario,
            nombre_usuario,
            tipo_reporte,
            total_registros,
            enlace_descarga,
            fecha_finalizacion
        } = datos;

        const mailOptions = {
            from: `${senderName} <${senderEmail}>`,
            to: correo_usuario,
            subject: `✅ Reporte Finalizado - ${tipo_reporte}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
                    <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <div style="text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 20px;">
                            <h2 style="color: #1e293b; margin: 0; font-size: 24px;">✅ ¡Reporte Finalizado!</h2>
                        </div>
                        
                        <p style="color: #475569; font-size: 16px; margin: 0 0 10px 0;">Hola <strong>${nombre_usuario}</strong>,</p>
                        
                        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Tu reporte ha sido generado exitosamente y está listo para descargar. Aquí están los detalles:</p>
                        
                        <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 20px; border-left: 5px solid #10b981; margin: 25px 0; border-radius: 6px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #065f46; font-weight: 600; width: 40%;">Tipo de Reporte:</td>
                                    <td style="padding: 8px 0; color: #047857; font-weight: bold;">${tipo_reporte}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #065f46; font-weight: 600;">Total de Registros:</td>
                                    <td style="padding: 8px 0; color: #047857; font-weight: bold;">${total_registros}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #065f46; font-weight: 600;">Finalizado:</td>
                                    <td style="padding: 8px 0; color: #047857;">${new Date(fecha_finalizacion).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #065f46; font-weight: 600;">Estado:</td>
                                    <td style="padding: 8px 0;"><span style="background-color: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">COMPLETADO</span></td>
                                </tr>
                            </table>
                        </div>

                        <div style="text-align: center; margin: 25px 0;">
                            <a href="${enlace_descarga}" style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; transition: background-color 0.3s ease;">
                                📥 Descargar Reporte
                            </a>
                        </div>

                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                            El archivo estará disponible durante 7 días. Descárgalo antes de que expire para evitar pérdida de datos.
                        </p>

                        <div style="background-color: #f0f9ff; border: 1px solid #0284c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <p style="color: #0c4a6e; font-size: 13px; margin: 0; font-weight: 500;">
                                📋 <strong>Contenido del Reporte:</strong>
                                <br>Registros totales: ${total_registros}
                                <br>Formato: PDF
                                <br>Tamaño aproximado: Depende del contenido
                            </p>
                        </div>
                        
                        <div style="border-top: 2px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                            <p style="color: #94a3b8; font-size: 12px; margin: 0;">Este es un correo automático, por favor no responder a este mensaje.</p>
                            <p style="color: #94a3b8; font-size: 12px; margin: 8px 0;">© 2026 FixCare - Universidad Tecnológica de Morelia</p>
                        </div>
                    </div>
                </div>
            `,
            text: `Tu reporte "${tipo_reporte}" está listo. Total de registros: ${total_registros}. Descargalo usando el enlace proporcionado.`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email de reporte completado enviado a ${correo_usuario}. ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Error al enviar email de reporte completado:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar email al técnico notificándole un nuevo ticket pendiente
 * @param {Object} ticket - Objeto con datos del nuevo ticket
 * @param {string} ticket.correo_tecnico - Email del técnico
 * @param {string} ticket.nombre_tecnico - Nombre del técnico
 * @param {number} ticket.id_ticket - ID del ticket
 * @param {string} ticket.descripcion - Descripción del ticket
 * @param {string} ticket.nombre_servicio - Tipo de servicio
 * @param {string} ticket.edificio - Edificio
 * @param {string} ticket.piso_area - Piso o área
 * @param {string} ticket.prioridad - Prioridad del ticket
 * @param {string} ticket.nombre_solicitante - Nombre de quien solicitó
 * @param {number} ticket.total_pendientes - Total de tickets pendientes del técnico
 */
const sendNewTicketPendingEmail = async (ticket) => {
    try {
        const {
            correo_tecnico,
            nombre_tecnico,
            id_ticket,
            descripcion,
            nombre_servicio,
            edificio,
            piso_area,
            prioridad,
            nombre_solicitante,
            total_pendientes
        } = ticket;

        const prioridadColor = {
            'Urgente': '#ef4444',
            'Alta': '#f97316',
            'Media': '#f59e0b',
            'Baja': '#10b981'
        };

        const prioridadEmoji = {
            'Urgente': '🔴',
            'Alta': '🟠',
            'Media': '🟡',
            'Baja': '🟢'
        };

        const mailOptions = {
            from: `${senderName} <${senderEmail}>`,
            to: correo_tecnico,
            subject: `${prioridadEmoji[prioridad] || '📌'} Nuevo Ticket Pendiente - #${id_ticket}`,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
                    <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <div style="text-align: center; border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 20px;">
                            <h2 style="color: #1e293b; margin: 0; font-size: 24px;">📌 Nuevo Ticket Pendiente</h2>
                        </div>
                        
                        <p style="color: #475569; font-size: 16px; margin: 0 0 10px 0;">Hola <strong>${nombre_tecnico}</strong>,</p>
                        
                        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Hay un nuevo ticket pendiente en tu cola que requiere atención. Aquí están los detalles completos:</p>
                        
                        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e2e8f0 100%); padding: 20px; border-left: 5px solid ${prioridadColor[prioridad] || '#6366f1'}; margin: 25px 0; border-radius: 6px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; color: #334155; font-weight: 600; width: 40%;">🎫 ID Ticket:</td>
                                    <td style="padding: 10px 0; color: #1e293b; font-weight: bold; font-size: 16px;">#${id_ticket}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #334155; font-weight: 600;">🔧 Servicio:</td>
                                    <td style="padding: 10px 0; color: #1e293b;">${nombre_servicio}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #334155; font-weight: 600;">📝 Descripción:</td>
                                    <td style="padding: 10px 0; color: #1e293b; word-break: break-word;">${descripcion}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #334155; font-weight: 600;">📍 Ubicación:</td>
                                    <td style="padding: 10px 0; color: #1e293b;">${edificio} - ${piso_area}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #334155; font-weight: 600;">⚡ Prioridad:</td>
                                    <td style="padding: 10px 0;"><span style="background-color: ${prioridadColor[prioridad] || '#6366f1'}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${prioridad}</span></td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #334155; font-weight: 600;">👤 Solicitante:</td>
                                    <td style="padding: 10px 0; color: #1e293b;">${nombre_solicitante}</td>
                                </tr>
                                <tr style="border-top: 2px solid #cbd5e1;">
                                    <td style="padding: 10px 0; color: #334155; font-weight: 600;">📊 Pendientes:</td>
                                    <td style="padding: 10px 0; color: #1e293b; font-weight: bold;">${total_pendientes} ticket(s) en tu cola</td>
                                </tr>
                            </table>
                        </div>

                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                            <strong>Acciones recomendadas:</strong>
                            <br>✓ Revisa el ticket tan pronto como sea posible
                            <br>✓ Contacta al solicitante si necesitas más información
                            <br>✓ Actualiza el estado del ticket en el sistema
                        </p>

                        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <p style="color: #92400e; font-size: 13px; margin: 0; font-weight: 500;">
                                ⏰ <strong>Recordatorio:</strong> Este es un ticket de <strong>${prioridad}</strong> prioridad. Por favor atiéndelo con la urgencia que requiere.
                            </p>
                        </div>
                        
                        <div style="border-top: 2px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                            <p style="color: #94a3b8; font-size: 12px; margin: 0;">Este es un correo automático, por favor no responder a este mensaje.</p>
                            <p style="color: #94a3b8; font-size: 12px; margin: 8px 0;">© 2026 FixCare - Universidad Tecnológica de Morelia</p>
                        </div>
                    </div>
                </div>
            `,
            text: `Nuevo ticket pendiente #${id_ticket} - ${nombre_servicio}\nDescripción: ${descripcion}\nUbicación: ${edificio} - ${piso_area}\nPrioridad: ${prioridad}\nSolicitante: ${nombre_solicitante}\nTotal pendientes: ${total_pendientes}`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email de ticket pendiente enviado a ${correo_tecnico}. ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Error al enviar email de ticket pendiente a ${ticket.correo_tecnico}:`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendTicketCreatedEmail,
    sendTicketAssignedEmail,
    sendTicketStatusUpdateEmail,
    sendReportGeneratedEmail,
    sendReportCompletedEmail,
    sendNewTicketPendingEmail
};
