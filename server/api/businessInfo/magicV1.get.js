const runtimeConfig = useRuntimeConfig()

export default defineEventHandler( async (event) => {
  const query = getQuery(event)
  const BusinessInfo = await $fetch(`${runtimeConfig.private.apiBase}/user_bussines/businessinfo/${encodeURIComponent(query.userBusiness)}`);
  const BusinessCombos =  await $fetch(`${runtimeConfig.private.apiBase}/user_bussines/businesscombo/${encodeURIComponent(BusinessInfo._id.$oid)}`);
  return {info: BusinessInfo, combos: BusinessCombos}
})