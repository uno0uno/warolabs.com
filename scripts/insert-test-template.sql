-- Insert a test template for debugging
-- This will help us verify the template loading functionality

-- Generate UUIDs for the test data
DO $$
DECLARE
    template_uuid UUID := gen_random_uuid();
    version_uuid UUID := gen_random_uuid();
BEGIN
    -- First, insert a template
    INSERT INTO templates (id, name, description, template_type, subject_template, sender_email, created_at)
    VALUES (
      template_uuid,
      'Template de Prueba',
      'Template de ejemplo para testing',
      'massive_email',
      'Asunto de Prueba: ¡Hola {{nombre}}!',
      'test@warolabs.com',
      NOW()
    );

    -- Then insert a template version with content
    INSERT INTO template_versions (id, template_id, version_number, content, created_at)
    VALUES (
      version_uuid,
      template_uuid,
      1,
      '<h1>¡Hola {{nombre}}!</h1>
      <p>Este es un template de prueba para <strong>{{empresa}}</strong>.</p>
      <p>Contenido HTML con formato para verificar que el editor Quill funciona correctamente.</p>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
      <p>Variables disponibles: {{nombre}}, {{email}}, {{empresa}}, {{fecha}}</p>',
      NOW()
    );

    -- Finally, set the active version
    UPDATE templates 
    SET active_version_id = version_uuid
    WHERE id = template_uuid;
    
    RAISE NOTICE 'Test template created with ID: %', template_uuid;
END $$;