import { createClient } from '@supabase/supabase-js'

async function getId(value) {
  const regex = /PROM(\d+)$/;
  const match = value.match(regex);
  return match ? match[1] : null;
}
async function getSlug(value) {
  return value.replace(/(-)?PROM\d+$/, '');
}

export default defineEventHandler( async (event) => {

  const query = getQuery(event)
  const id = await getId(query.slug)
  const slug = await getSlug(query.slug)
  const supabase = createClient( process.env.NUXT_SUPABASE_URL,process.env.NUXT_SUPABASE_ANON_KEY)
  const { data, error } = await supabase
  .from('promos_business')
  .select('*,night_clubs(city,address,currencies_accepted,country,name)')
  .eq('id',id)
  .eq('slug',slug)

  
  if (error){
    return error
  }
  if(data){
    return data
  }

})