import { createClient } from '@supabase/supabase-js';

export default defineEventHandler(async (event) => {
  const supabase = createClient(
    process.env.NUXT_SUPABASE_URL,
    process.env.NUXT_SUPABASE_ANON_KEY
  );
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*,creator(*)')
      .is('is_active', true)
      .is('published', true)
      .is('draft', false);

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
