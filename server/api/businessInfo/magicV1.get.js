export default defineEventHandler( async (event) => {
  const MY_KV: KVNamespace = context.cloudflare.env.MY_KV;
  const query = getQuery(event)
  const BusinessInfo = await $fetch(`https://back-waro-colombia-v1-update.onrender.com/user_bussines/businessinfo/${encodeURIComponent(query.userBusiness)}`);
  const BusinessCombos =  await $fetch(`https://back-waro-colombia-v1-update.onrender.com/user_bussines/businesscombo/${encodeURIComponent(BusinessInfo._id.$oid)}`);
  return {info: BusinessInfo, combos: BusinessCombos}
})