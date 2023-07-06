
export default defineEventHandler( async (event) => {
  const query = getQuery(event)
  const combo = await $fetch(`${process.env.NUXT_BASE_URL_API_MAGIC_V2}/user_bussines/businesssinglecombo/${encodeURIComponent(query.idCombo)}`);
  return combo
})