import { createClient } from '@supabase/supabase-js';

async function getId(value) {
  const regex = /PUB(\d+)$/;
  const match = value.match(regex);
  return match ? match[1] : null;
}

async function getSlug(value) {
  return value.replace(/(-)?PUB\d+$/, '');
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const id_input = await getId(query.slug);
  const slug_input = await getSlug(query.slug);
  const supabase = createClient(
    process.env.NUXT_PUBLIC_SUPABASE_URL,
    process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
  );
  try {
    let { data, error } = await supabase.rpc('get_article_and_increment_view', {
      id_input, 
      slug_input
    })

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
