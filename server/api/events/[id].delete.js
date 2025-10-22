// server/api/events/[id].delete.js

import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { withTenantIsolation } from '../../utils/security/tenantIsolation';

export default withTenantIsolation(async (event) => {
    const tenantContext = event.context.tenant;

    if (event.method !== 'DELETE') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: 'This endpoint only accepts DELETE requests.' });
    }

    const eventId = parseInt(event.context.params.id);

    if (isNaN(eventId) || eventId <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'El ID del evento debe ser un número entero positivo.'
      }); 
    }

    console.log(`DELETE /api/events/${eventId} - ID recibido para soft delete:`, eventId);

    return await withPostgresClient(async (client) => {

        try {
            // Iniciar transacción
            await client.query('BEGIN');

            // Verificar que el evento existe y pertenece al tenant actual
            const eventCheckQuery = `
              SELECT c.cluster_id, c.profile_id, p.profile_name, c.is_active, c.shadowban
              FROM clusters c
              JOIN profile p ON c.profile_id = p.profile_id
              JOIN tenant_members tm ON p.profile_id = tm.profile_id
              WHERE c.cluster_id = $1 
                AND tm.tenant_id = $2 
                AND tm.is_active = true
            `;
            
            const eventCheckResult = await client.query(eventCheckQuery, [eventId, tenantContext.tenant_id]);
            
            if (eventCheckResult.rows.length === 0) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Not Found',
                    message: `Evento con ID ${eventId} no encontrado o no tienes permisos para eliminarlo.`
                });
            }

            const eventData = eventCheckResult.rows[0];

            // Verificar si el evento ya está inactivo
            if (!eventData.is_active) {
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Bad Request',
                    message: 'El evento ya está desactivado.'
                });
            }

            // Verificar si el evento está baneado
            if (eventData.shadowban) {
                throw createError({
                    statusCode: 403,
                    statusMessage: 'Forbidden',
                    message: 'No se puede desactivar un evento que está en shadowban.'
                });
            }

            // Realizar soft delete (marcar como inactivo)
            const softDeleteQuery = `
              UPDATE clusters 
              SET is_active = false, updated_at = NOW()
              WHERE cluster_id = $1
              RETURNING cluster_id, updated_at
            `;

            console.log('DELETE /api/events/[id] - Ejecutando soft delete:', softDeleteQuery);
            console.log('DELETE /api/events/[id] - Valores:', [eventId]);

            const deleteResult = await client.query(softDeleteQuery, [eventId]);

            if (deleteResult.rows.length === 0) {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Internal Server Error',
                    message: `No se pudo desactivar el evento con ID ${eventId}.`
                });
            }

            // También podemos opcionalmente desactivar las áreas e imágenes relacionadas
            // (aunque esto es opcional ya que el evento padre está inactivo)
            
            // Marcar áreas como inactivas si tienen ese campo
            try {
                await client.query(`
                    UPDATE cluster_areas 
                    SET updated_at = NOW() 
                    WHERE cluster_id = $1
                `, [eventId]);
            } catch (error) {
                console.log('No se pudieron actualizar las áreas (opcional):', error.message);
            }

            // Marcar imágenes como inactivas si tienen ese campo
            try {
                await client.query(`
                    UPDATE cluster_images 
                    SET updated_at = NOW() 
                    WHERE cluster_id = $1
                `, [eventId]);
            } catch (error) {
                console.log('No se pudieron actualizar las imágenes (opcional):', error.message);
            }

            // Confirmar transacción
            await client.query('COMMIT');

            setResponseStatus(event, 200);
            return {
                success: true,
                message: 'Evento desactivado exitosamente.',
                eventId: deleteResult.rows[0].cluster_id,
                updatedAt: deleteResult.rows[0].updated_at
            }; 

        } catch (error) {
            // Rollback en caso de error
            await client.query('ROLLBACK');
            console.error('Error eliminando evento:', error);
            
            if (error.statusCode) {
                throw error; // Re-throw HTTP errors
            }
            
            throw createError({
                statusCode: 500,
                statusMessage: 'Internal Server Error',
                message: 'Error interno al eliminar el evento. Por favor intenta nuevamente.'
            });
        }

    }, event); 
});