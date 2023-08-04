import { createClient } from '@supabase/supabase-js';

function getPromosWithKey(promos) {
  const promosWithKey = promos.map((promo) => ({
    slugId: `/promociones/${promo.slug}-PROM${promo.id}`
  }));

  return promosWithKey;
}

export default defineEventHandler(async (event) => {
  const supabase = createClient(
    process.env.NUXT_PUBLIC_SUPABASE_URL,
    process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
  );
  try {
    const { data, error } = await supabase
      .from('promos_business')
      .select('slug,id')
      .is('active', true);

    if (error) {
      return error;
    }
    if (data) {
      const promosWithKey = getPromosWithKey(data);
      return promosWithKey;
    }
  } catch (error) {
    return error;
  }
});