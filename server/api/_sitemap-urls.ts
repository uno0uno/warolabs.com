export default defineEventHandler(async () => {
    const [
      discotecas
    ] = await Promise.all([
      $fetch('/api/business/discotecas')
    ])
    return [...discotecas].map((p) => {
      return { loc: p.user_name }
    })
  })
  