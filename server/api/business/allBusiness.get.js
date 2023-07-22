import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const supabase = createClient(
    process.env.NUXT_SUPABASE_URL,
    process.env.NUXT_SUPABASE_ANON_KEY
  );
  try {
    const { data, error } = await supabase
      .from(query.category)
      .select('name,address,city,country,user_name,logo_business')
      .is('is_active', true);
    if (error) {
      return error;
    }
    if (data) {
      return data;
    }
  } catch (error) {
    return error;
  }
});
