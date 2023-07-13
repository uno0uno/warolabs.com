import { createClient } from '@supabase/supabase-js'

export default defineEventHandler( async (event) => {
  const query = getQuery(event)
  const supabase = createClient( process.env.NUXT_SUPABASE_URL,process.env.NUXT_SUPABASE_ANON_KEY)
  const { data, error } = await supabase
  .from('night_clubs')
  .select('*,combo_business(id_combo,name,description),opening_hours(*)')
  .eq('user_name', query.user_name)
  
  if (error){
    return error
  }
  if(data){
    return data
  }

})