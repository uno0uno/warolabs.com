import { defineEventHandler, readBody } from 'h3';
import { withPostgresClient } from '../../utils/basedataSettings/withPostgresClient';
import { verifyAuthToken } from '../../utils/security/jwtVerifier';

export default defineEventHandler(async (event) => {
  return await withPostgresClient(async (client) => {
    try {
      // Authentication - uncomment when needed
      // await verifyAuthToken(event);

      const body = await readBody(event);
      const { name, description } = body;

      if (!name || !name.trim()) {
        throw createError({
          statusCode: 400,
          statusMessage: 'El nombre de la campaña es obligatorio'
        });
      }

      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      // Default profile ID - in production, get this from authenticated user
      const profileId = '550e8400-e29b-41d4-a716-446655440000';

      // Prepare template content
      const emailContent = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <header style="background-color: #1a1a1a; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">{{campaign_name}}</h1>
          </header>
          <main style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #333; margin-bottom: 20px;">¡Hola {{user_name}}!</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Este es el contenido de tu email. Puedes personalizarlo desde el editor de templates.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{landing_url}}" 
                 style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver más información
              </a>
            </div>
          </main>
          <footer style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>{{company_name}} | {{company_address}}</p>
            <p><a href="{{unsubscribe_url}}" style="color: #666;">Cancelar suscripción</a></p>
          </footer>
        </div>
      `;

      const landingContent = `
        <div class="landing-container" style="min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <header class="header" style="padding: 20px 0; text-align: center;">
            <h1 style="color: white; font-size: 2.5rem; margin: 0;">{{campaign_name}}</h1>
            <p style="color: rgba(255,255,255,0.8); font-size: 1.1rem;">{{campaign_description}}</p>
          </header>
          
          <main class="main-content" style="max-width: 800px; margin: 0 auto; padding: 40px 20px;">
            <div class="hero-section" style="text-align: center; background: white; border-radius: 15px; padding: 40px; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
              <h2 style="color: #333; font-size: 2rem; margin-bottom: 20px;">Bienvenido a nuestra campaña</h2>
              <p style="color: #666; font-size: 1.1rem; line-height: 1.6; margin-bottom: 30px;">
                Descubre todo lo que tenemos preparado para ti. Esta landing page es completamente personalizable.
              </p>
              
              <form class="lead-form" style="max-width: 400px; margin: 0 auto;">
                <div style="margin-bottom: 20px;">
                  <input type="text" name="name" placeholder="Tu nombre" 
                         style="width: 100%; padding: 12px; border: 2px solid #e1e1e1; border-radius: 8px; font-size: 16px;" required>
                </div>
                <div style="margin-bottom: 20px;">
                  <input type="email" name="email" placeholder="Tu email" 
                         style="width: 100%; padding: 12px; border: 2px solid #e1e1e1; border-radius: 8px; font-size: 16px;" required>
                </div>
                <div style="margin-bottom: 20px;">
                  <input type="tel" name="phone" placeholder="Tu teléfono" 
                         style="width: 100%; padding: 12px; border: 2px solid #e1e1e1; border-radius: 8px; font-size: 16px;">
                </div>
                <button type="submit" 
                        style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border: none; border-radius: 8px; font-size: 18px; cursor: pointer;">
                  ¡Quiero participar!
                </button>
              </form>
            </div>
          </main>
          
          <footer style="text-align: center; padding: 40px 20px; color: rgba(255,255,255,0.7);">
            <p>&copy; 2024 {{company_name}}. Todos los derechos reservados.</p>
          </footer>
        </div>
      `;

      // Call the existing database function
      const result = await client.query(`
        SELECT * FROM create_campaign_with_templates(
          $1::uuid, 
          $2::varchar, 
          $3::varchar, 
          $4::text, 
          $5::text, 
          $6::text, 
          $7::varchar, 
          $8::text, 
          $9::text
        )
      `, [
        profileId,                          // p_profile_id
        name,                               // p_campaign_name
        slug,                               // p_campaign_slug
        `Template Email - ${name}`,         // p_email_template_name
        `Template Landing - ${name}`,       // p_landing_template_name
        `Asunto: ${name}`,                  // p_subject_template
        'noreply@warolabs.com',             // p_sender_email
        emailContent,                       // p_email_content
        landingContent                      // p_landing_content
      ]);

      if (result.rows.length === 0) {
        throw createError({
          statusCode: 500,
          statusMessage: 'No se pudo crear la campaña'
        });
      }

      const { campaign_id, status_message } = result.rows[0];

      // Get campaign details to return to frontend
      const campaignDetails = await client.query(`
        SELECT 
          c.*,
          array_agg(
            DISTINCT jsonb_build_object(
              'id', t.id,
              'name', t.template_name,
              'type', t.template_type,
              'version_id', tv.id
            )
          ) as templates
        FROM campaign c
        LEFT JOIN campaign_template_versions ctv ON c.id = ctv.campaign_id
        LEFT JOIN template_versions tv ON ctv.template_version_id = tv.id
        LEFT JOIN templates t ON tv.template_id = t.id
        WHERE c.id = $1
        GROUP BY c.id
      `, [campaign_id]);

      const campaignData = campaignDetails.rows[0];

      return {
        success: true,
        message: status_message,
        data: {
          campaign: campaignData,
          emailTemplate: campaignData.templates?.find(t => t.type === 'email') || null,
          landingTemplate: campaignData.templates?.find(t => t.type === 'landing') || null,
          requiredTemplates: {
            email: true,
            landing: true
          }
        }
      };

    } catch (error) {
      console.error('Error creating campaign with templates:', error);
      throw createError({
        statusCode: 500,
        statusMessage: error.message || 'Error interno del servidor al crear la campaña'
      });
    }
  }, event);
});