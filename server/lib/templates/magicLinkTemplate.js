/**
 * Generates the magic link email template
 * @param {string} url - The magic link URL
 * @param {string} verificationCode - 6-digit verification code
 * @returns {string} - HTML template
 */
export function getMagicLinkTemplate(url, verificationCode) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Link Mágico - Warolabs</title>
</head>
<body style="font-family: Arial, sans-serif; color: black; margin: 0; padding: 0; text-align: left;">
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <p>¡Hola!</p>
        
        <p>Has solicitado acceso a tu cuenta en Warolabs. Haz clic en el siguiente enlace para ingresar de forma segura:</p>
        
        <p><a href="${url}" style="color: black; background-color: #f0f0f0; padding: 10px; border-radius: 4px; text-decoration: none; display: inline-block;">🔑 Acceder a mi cuenta</a></p>
        
        <p><strong>O usa este código de verificación:</strong></p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #333; background-color: #f8f8f8; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">${verificationCode}</p>
        
        <p>Este enlace y código son válidos por 15 minutos y solo pueden ser usados una vez.</p>
        
        <p>Si no solicitaste este enlace, puedes ignorar este correo de forma segura.</p>
        
        <p>Saludos desde la nave de WaroLabs.</p>
        
        <br><br>
        ----<br>
        Saifer 101 (Anderson Arévalo)<br>
        Fundador WaroLabs<br>
        Direccion: <a href="https://maps.app.goo.gl/CjipiqrV2iYUx2fa8"> Calle 39F # 68F - 66 Sur</a><br>
        Bogotá, D.C, Colombia<br>
        Tel: 3142047013<br>
        Correo: <a href="mailto:anderson.arevalo@warolabs.com">anderson.arevalo@warolabs.com</a><br>
        No olvides mirar al futuro.
    </div>
</body>
</html>
  `.trim();
}