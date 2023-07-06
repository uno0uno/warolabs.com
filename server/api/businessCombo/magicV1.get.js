const runtimeConfig = useRuntimeConfig()
export default defineEventHandler( async (event) => {
  const query = getQuery(event)
  const combo = await $fetch(`${runtimeConfig.private.apiBase}/user_bussines/businesssinglecombo/${encodeURIComponent(query.idCombo)}`);
  return combo
})