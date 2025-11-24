export const useSeo = () => {
    const { public: config } = useRuntimeConfig()

    const siteUrl = config.siteUrl
    const canonical = config.canonicalUrl
    const title = config.seoTitle
    const description = config.seoDescription
    const ogTitle = config.ogTitle || title
    const ogDescription = config.ogDescription || description
    const ogUrl = config.ogUrl || siteUrl
    const twitterTitle = config.twitterTitle || title
    const twitterDescription = config.twitterDescription || description

    // Construimos el JSON‑LD usando los valores anteriores
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url: canonical,
        inLanguage: 'es',
        isPartOf: {
            '@type': 'WebSite',
            name: title,
            url: siteUrl
        }
    }

    return {
        siteUrl,
        canonical,
        title,
        description,
        ogTitle,
        ogDescription,
        ogUrl,
        twitterTitle,
        twitterDescription,
        jsonLd,
        heroTitle: config.heroTitle,
        heroTitleHighlight: config.heroTitleHighlight,
        heroDescription: config.heroDescription
    }
}
