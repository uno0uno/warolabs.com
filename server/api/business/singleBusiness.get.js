export default defineEventHandler( async (event) => {
  const query = getQuery(event)
  const BusinessInfo = await $fetch(`${process.env.NUXT_BASE_URL_API_MAGIC_V2}/user_bussines/businessinfo/${encodeURIComponent(query.userBusiness)}`);
  const BusinessCombos =  await $fetch(`${process.env.NUXT_BASE_URL_API_MAGIC_V2}/user_bussines/businesscombo/${encodeURIComponent(BusinessInfo._id.$oid)}`);
  return {info: BusinessInfo, combos: BusinessCombos}
})