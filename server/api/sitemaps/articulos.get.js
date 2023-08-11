import { createClient } from '@supabase/supabase-js';

function getArticlesWithKey(articles) {
  const articlesWithKey = articles.map((article) => ({
    slugId: `/blog/${article.slug}-PUB${article.id}`
  }));

  return articlesWithKey;
}
export default defineEventHandler(async (event) => {
  const supabase = createClient(
    process.env.NUXT_PUBLIC_SUPABASE_URL,
    process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
  );
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('slug,id')
      .is('published', true)
      .is('is_active', true);
    if (error) {
      return error;
    }
    if (data) {
      const articlesWithKey = getArticlesWithKey(data);
      return articlesWithKey;
    }
  } catch (error) {
    return error;
  }
});