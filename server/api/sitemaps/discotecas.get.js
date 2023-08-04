import { createClient } from '@supabase/supabase-js';

function getClubsWithKey(clubs) {
  const clubsWithKey = clubs.map((club) => ({
    slugId: `/discotecas/${club.user_name}`
  }));

  return clubsWithKey;
}

export default defineEventHandler(async (event) => {
  const supabase = createClient(
    process.env.NUXT_PUBLIC_SUPABASE_URL,
    process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
  );
  try {
    const { data, error } = await supabase
      .from('discotecas')
      .select('user_name')
      .is('is_active', true);
    if (error) {
      return error;
    }
    if (data) {
      const clubsWithKey = getClubsWithKey(data);
      return clubsWithKey;
    }
  } catch (error) {
    return error;
  }
});