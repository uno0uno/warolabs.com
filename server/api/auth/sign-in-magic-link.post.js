import { createError } from 'h3';
import { sendEmail } from '~/server/utils/aws/sesClient';
import { getMagicLinkTemplate } from '~/server/lib/templates/magicLinkTemplate';
import { withPostgresClient } from '~/server/utils/basedataSettings/withPostgresClient';
import crypto from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email } = body;
    
    // Get redirect parameter from query or body
    const query = getQuery(event);
    const redirectParam = query.redirect || body.redirect;
    
    // Detect requesting site from headers
    const referer = getHeader(event, 'referer') || '';
    const origin = getHeader(event, 'origin') || '';
    let requestingSite = 'warolabs.com'; // Default
    
    if (referer) {
      const url = new URL(referer);
      requestingSite = url.hostname;
    } else if (origin) {
      const url = new URL(origin);
      requestingSite = url.hostname;
    }
    
    // Handle development environment using dev-site-mapping.json
    if (process.env.NODE_ENV === 'development' && (requestingSite.includes('localhost') || requestingSite.includes('127.0.0.1'))) {
      try {
        // Load dev site mapping
        const devSiteMappingPath = join(process.cwd(), 'dev-site-mapping.json');
        const devSiteMapping = JSON.parse(readFileSync(devSiteMappingPath, 'utf8'));
        
        const url = new URL(referer || origin);
        const hostWithPort = `${url.hostname}:${url.port}`;
        
        // Map the localhost port to the actual site
        if (devSiteMapping[hostWithPort]) {
          requestingSite = devSiteMapping[hostWithPort];
          console.log(`🌐 Development: Mapped ${hostWithPort} to ${requestingSite} for magic link`);
        } else {
          // Fallback to default
          requestingSite = 'warolabs.com';
          console.log(`⚠️ Development: No mapping found for ${hostWithPort}, defaulting to warolabs.com`);
        }
      } catch (error) {
        console.error('❌ Error reading dev-site-mapping.json:', error);
        requestingSite = 'warolabs.com'; // Fallback
      }
    }
    
    console.log(`🌐 Detected requesting site: ${requestingSite}`);
    
    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      });
    }
    
    console.log(`📧 Magic link handler - Email: ${email}`);
    
    const result = await withPostgresClient(async (client) => {
      // Get site configuration and admin info from database
      const siteConfigQuery = `
        SELECT 
          ts.site,
          ts.brand_name,
          ts.tenant_id,
          t.name as tenant_name,
          t.slug as tenant_slug,
          t.email as tenant_email,
          p.name as admin_name,
          t.email as admin_email,
          ts.brand_name as admin_enterprise
        FROM tenant_sites ts
        JOIN tenants t ON ts.tenant_id = t.id
        LEFT JOIN tenant_members tm ON t.id = tm.tenant_id AND tm.role = 'superuser'
        LEFT JOIN profile p ON tm.user_id = p.id
        WHERE ts.site = $1 AND ts.is_active = true
        LIMIT 1
      `;
      
      const siteConfigResult = await client.query(siteConfigQuery, [requestingSite]);
      const siteConfig = siteConfigResult.rows[0];
      
      if (!siteConfig) {
        console.warn(`⚠️ Site ${requestingSite} not found in database, using defaults`);
      }
      
      // Set defaults if no site config found or no admin assigned
      const config = {
        site: siteConfig?.site || 'warolabs.com',
        brand_name: siteConfig?.brand_name || 'Warolabs',
        tenant_name: siteConfig?.tenant_name || 'WaroLabs',
        tenant_email: siteConfig?.tenant_email || 'anderson.arevalo@warolabs.com',
        admin_name: siteConfig?.admin_name || 'Saifer 101 (Anderson Arévalo)',
        admin_email: siteConfig?.admin_email || 'anderson.arevalo@warolabs.com',
        admin_enterprise: siteConfig?.admin_enterprise || null
      };
      
      console.log(`🏷️ Site config for ${requestingSite}:`, JSON.stringify(config, null, 2));
      
      // Generate secure token and verification code
      const token = crypto.randomBytes(32).toString('hex');
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      
      // Check if user exists, if not create one
      const userQuery = 'SELECT * FROM profile WHERE email = $1 LIMIT 1';
      const userResult = await client.query(userQuery, [email]);
      
      let userId;
      
      if (userResult.rows.length === 0) {
        console.log(`👤 Creating new user for email: ${email}`);
        const insertUserQuery = `
          INSERT INTO profile (email, name, nationality_id, phone_number) 
          VALUES ($1, $2, $3, $4) 
          RETURNING id
        `;
        const newUserResult = await client.query(insertUserQuery, [
          email, 
          email.split('@')[0], 
          1, // default nationality_id 
          '+1234567890' // default phone_number
        ]);
        userId = newUserResult.rows[0].id;
        console.log(`✅ User created with ID: ${userId}`);
      } else {
        userId = userResult.rows[0].id;
        console.log(`👤 User found with ID: ${userId}`);
      }
      
      // Mark old unused magic tokens as expired for this user (analytics preserved)
      await client.query(
        'UPDATE magic_tokens SET used = true, used_at = NOW() WHERE user_id = $1 AND used = false', 
        [userId]
      );
      
      // Save new magic token to database with analytics fields and tenant_id
      const insertTokenQuery = `
        INSERT INTO magic_tokens (user_id, token, verification_code, expires_at, tenant_id, used, created_at, used_at) 
        VALUES ($1, $2, $3, $4, $5, false, NOW(), NULL)
      `;
      await client.query(insertTokenQuery, [userId, token, verificationCode, expiresAt, siteConfig?.tenant_id]);
      console.log(`🔑 Magic token saved for user: ${userId}, tenant: ${siteConfig?.tenant_id || 'null'}`);
      
      return { userId, token, verificationCode, siteConfig: config };
    }, event);
    
    // Generate magic link URL based on requesting site
    const { public: { baseUrl } } = useRuntimeConfig();
    let cleanBaseUrl = (baseUrl || "http://localhost:4000").replace(/\/$/, '');
    
    // Override baseUrl for development environment using dev-site-mapping.json
    if (process.env.NODE_ENV === 'development') {
      try {
        const devSiteMappingPath = join(process.cwd(), 'dev-site-mapping.json');
        const devSiteMapping = JSON.parse(readFileSync(devSiteMappingPath, 'utf8'));
        
        // Find the frontend port that maps to this requesting site
        const frontendMapping = Object.entries(devSiteMapping).find(([_, site]) => site === requestingSite);
        
        if (frontendMapping) {
          const frontendPort = frontendMapping[0]; // e.g., "localhost:8080"
          cleanBaseUrl = `http://${frontendPort}`;
          console.log(`🔗 Development: Magic link will redirect to ${cleanBaseUrl} (frontend for ${requestingSite})`);
        } else {
          console.log(`⚠️ Development: No frontend mapping found for ${requestingSite}, using default ${cleanBaseUrl}`);
        }
      } catch (error) {
        console.error('❌ Error reading dev-site-mapping.json for URL generation:', error);
      }
    }
    
    let magicLinkUrl = `${cleanBaseUrl}/auth/verify?token=${result.token}&email=${encodeURIComponent(email)}`;
    
    // Add redirect parameter if provided
    if (redirectParam) {
      magicLinkUrl += `&redirect=${encodeURIComponent(redirectParam)}`;
    }
    
    console.log(`🔗 Magic link URL: ${magicLinkUrl}`);
    
    // Send email with dynamic configuration
    const siteConfig = result.siteConfig;
    const html = getMagicLinkTemplate(magicLinkUrl, result.verificationCode, siteConfig);
    
    const fromName = siteConfig.admin_enterprise 
      ? `${siteConfig.admin_name} - ${siteConfig.admin_enterprise}`
      : `${siteConfig.admin_name} - ${siteConfig.brand_name}`;
    
    const subject = `🔑 Tu acceso a ${siteConfig.brand_name} está listo`;
    
    // Use tenant email (verified in AWS SES) for sending
    await sendEmail({
      fromEmailAddress: siteConfig.tenant_email, // Email from tenant table
      fromName: fromName, // Dynamic branding name
      toEmailAddresses: [email],
      subject: subject,
      bodyHtml: html
    });
    
    console.log(`✅ Magic link sent from ${fromName} (${siteConfig.admin_email}) for site: ${siteConfig.brand_name}`);
    console.log(`✅ Magic link sent successfully to: ${email}`);
    
    return {
      success: true,
      message: "Magic link sent successfully"
    };
  } catch (error) {
    console.error('❌ Magic link handler error:', error);
    throw error;
  }
});