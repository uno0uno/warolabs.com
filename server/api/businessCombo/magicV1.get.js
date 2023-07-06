export default defineEventHandler( async (event) => {
  const query = getQuery(event)
  const combo = await $fetch(`https://back-waro-colombia-v1-update.onrender.com/user_bussines/businesssinglecombo/${encodeURIComponent(query.idCombo)}`);
  return combo
})