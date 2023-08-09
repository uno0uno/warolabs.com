import { createClient } from '@supabase/supabase-js';

async function getId(value) {
  const regex = /PUB(\d+)$/;
  const match = value.match(regex);
  return match ? match[1] : null;
}

export default defineEventHandler(async (event) => {

  const body = await readBody(event)
  const id = await getId(body.id)

  const supabase = createClient(
    process.env.NUXT_PUBLIC_SUPABASE_URL,
    process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    const { data, error } = await supabase
    .from('article_comments')
    .insert([
      { 
        comment: body.comment,
        emotion_emoji: body.emotionEmoji,
        article_id: id, 
        is_active: false,
        shadowban: false,
      },
    ]).select()
    if (data) {
      return data
    }
  } catch (error) {
    return error
  }
  
});
