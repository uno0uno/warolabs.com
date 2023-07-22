import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const supabase = createClient(
    process.env.NUXT_SUPABASE_URL,
    process.env.NUXT_SUPABASE_ANON_KEY
  );
  try {
    const { data, error } = await supabase
      .from('promos_business')
      .select('*,discotecas(city,address,currencies_accepted,country,name)')
      .is('active', true);

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
