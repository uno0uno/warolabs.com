export default defineNuxtRouteMiddleware(async (to, from) => {
  const token = useCookie('auth_token');

    try {
      const response = await $fetch('/api/auth/get-token', {
        method: 'POST'
      });
      
      if (response.token) {
        token.value = response.token;
      } else {
        console.error('Failed to get auth token from server.');
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized',
          message: 'Failed to retrieve authentication token.'
        });
      }
    } catch (error) {
      console.error('Error fetching token:', error);
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Could not connect to authentication service.'
      });
    }
});