import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async () => {
  const supabase = createClient(
    process.env.NUXT_SUPABASE_URL,
    process.env.NUXT_SUPABASE_ANON_KEY
  );
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*,creator(*)')

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
