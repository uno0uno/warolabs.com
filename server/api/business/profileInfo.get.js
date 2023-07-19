import { createClient } from '@supabase/supabase-js'

export default defineEventHandler( async (event) => {
  const query = getQuery(event)
  const supabase = createClient( process.env.NUXT_SUPABASE_URL,process.env.NUXT_SUPABASE_ANON_KEY)
  const { data, error } = await supabase
  .from('night_clubs')
  .select('*,promos_business(id,name,description,slug),opening_hours(*)')
  .eq('user_name', query.user_name)
  .is('is_active', true)
  .is('promos_business.active', true)

  if (error){
    return error
  }
  if(data){
    return data
  }

})