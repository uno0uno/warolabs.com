import { createClient } from '@supabase/supabase-js';

async function getId(value) {
  const regex = /PUB(\d+)$/;
  const match = value.match(regex);
  return match ? match[1] : null;
}

export default defineEventHandler(async (event) => {

  const query = getQuery(event)
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
        email: query.email ,
        comment: body.comment,
        emotion_emoji: body.emotionEmoji,
        article_id: id, 
        is_active: false,
        shadowban: false,
      },
    ])
    .select()
    if(error){
      console.log(error);
    }
    if (data) {
      console.log(1, data);
    }
  } catch (error) {
    console.log(error)
  }
  
});
