export default defineEventHandler(async (event) => {
  // Lista de orígenes permitidos
  const allowedOrigins = [
    'http://localhost:3000', // warocol.com local
    'http://localhost:4000', // warolabs.com local
    'https://warocol.com',   // warocol.com production
    'https://warolabs.com',  // warolabs.com production
  ];

  const origin = getHeader(event, 'origin');
  
  // Si el origen está permitido, configurar headers CORS
  if (origin && allowedOrigins.includes(origin)) {
    setHeader(event, 'Access-Control-Allow-Origin', origin);
    setHeader(event, 'Access-Control-Allow-Credentials', 'true');
    setHeader(event, 'Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept');
  }

  // Manejar peticiones OPTIONS (preflight)
  if (getMethod(event) === 'OPTIONS') {
    setResponseStatus(event, 200);
    return;
  }
});