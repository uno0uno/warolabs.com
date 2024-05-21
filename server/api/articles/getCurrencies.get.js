export default defineEventHandler(async (event) => {

    const varUrl = 'https://open.er-api.com/v6/latest/USD';

    const response = await $fetch(varUrl, {
        method: 'POST',
        headers: {
            'Authorization': `token ${tokenAdmin}`
        },
        body: bodyse

    }).catch((error) => {
        return error.data;
    });
    if (response) {
        return {
            data: response
        }
    };
});
