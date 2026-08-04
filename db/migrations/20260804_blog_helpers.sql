-- warolabs.com#3 - Blog helpers: 4 PG functions SECURITY DEFINER para blog dinamico multi-tenant.
-- Multi-tenant: p_tenant_id es obligatorio en todas. Reusable por cualquier tenant (warolabs, warocolombia, etc).
-- Patrón referencia: public.get_clusters_list(p_limit, p_offset, p_filters).
-- Lógica portada de api_warocol.com/app/services/articles_service.py (raw SQL → PG function).

-- ============================================================================
-- 1. list_articles: paginación + filtros por pillar, search (ILIKE), tag (ILIKE)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.list_articles(
    p_tenant_id uuid,
    p_pillar text DEFAULT NULL,
    p_search text DEFAULT NULL,
    p_tag text DEFAULT NULL,
    p_page integer DEFAULT 1,
    p_page_size integer DEFAULT 12
)
RETURNS TABLE (
    id bigint,
    slug text,
    title text,
    description text,
    cover text,
    thumbnail text,
    tags text,
    pillar text,
    published_at timestamptz,
    views numeric,
    author_id uuid,
    author_name text,
    author_email text,
    author_avatar text,
    total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_offset integer;
    v_where text := 'WHERE a.tenant_id = $1 AND a.published = true AND a.is_active = true AND a.draft = false';
    v_total bigint;
BEGIN
    v_offset := GREATEST(0, (p_page - 1) * p_page_size);

    IF p_pillar IS NOT NULL AND p_pillar <> '' THEN
        v_where := v_where || ' AND a.pillar = $2';
    END IF;

    IF p_search IS NOT NULL AND p_search <> '' THEN
        v_where := v_where || ' AND (a.title ILIKE $3 OR a.description ILIKE $3)';
    END IF;

    IF p_tag IS NOT NULL AND p_tag <> '' THEN
        v_where := v_where || ' AND a.tags ILIKE $4';
    END IF;

    -- Total count
    EXECUTE 'SELECT COUNT(*) FROM public.articles a ' || v_where
    INTO v_total
    USING p_tenant_id, p_pillar, '%' || p_search || '%', '%' || p_tag || '%';

    -- Items
    RETURN QUERY EXECUTE '
        SELECT
            a.id,
            a.slug,
            a.title,
            a.description,
            a.cover,
            a.thumbnail,
            a.tags,
            a.pillar,
            a.created_at AS published_at,
            a.views,
            p.id AS author_id,
            p.name::text AS author_name,
            p.email::text AS author_email,
            p.logo_avatar::text AS author_avatar,
            ' || v_total || '::bigint AS total_count
        FROM public.articles a
        JOIN public.profile p ON p.id = a.id_profile
        ' || v_where || '
        ORDER BY a.created_at DESC, a.id DESC
        LIMIT $5 OFFSET $6
    '
    USING p_tenant_id, p_pillar, '%' || p_search || '%', '%' || p_tag || '%', p_page_size, v_offset;
END;
$function$;


-- ============================================================================
-- 2. get_article_by_slug: detalle + autor via JOIN por id_profile + tenant_name
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_article_by_slug(
    p_tenant_id uuid,
    p_slug text,
    p_increment_views boolean DEFAULT true
)
RETURNS TABLE (
    id bigint,
    slug text,
    title text,
    description text,
    content text,
    cover text,
    thumbnail text,
    tags text,
    pillar text,
    meta_title text,
    meta_descripcion text,
    views numeric,
    published_at timestamptz,
    updated_at timestamptz,
    author_id uuid,
    author_name text,
    author_email text,
    author_avatar text,
    author_user_name text,
    tenant_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    IF p_increment_views THEN
        UPDATE public.articles AS a
        SET views = COALESCE(a.views, 0) + 1
        WHERE a.tenant_id = p_tenant_id
          AND a.slug = p_slug
          AND a.published = true
          AND a.is_active = true
          AND a.draft = false;
    END IF;

    RETURN QUERY
    SELECT
        a.id,
        a.slug,
        a.title,
        a.description,
        a.content,
        a.cover,
        a.thumbnail,
        a.tags,
        a.pillar,
        a.meta_title,
        a.meta_descripcion,
        a.views,
        a.created_at AS published_at,
        a.updated_at,
        p.id AS author_id,
        p.name::text AS author_name,
        p.email::text AS author_email,
        p.logo_avatar::text AS author_avatar,
        p.user_name::text AS author_user_name,
        t.name::text AS tenant_name
    FROM public.articles a
    JOIN public.profile p ON p.id = a.id_profile
    JOIN public.tenants t ON t.id = a.tenant_id
    WHERE a.tenant_id = p_tenant_id
      AND a.slug = p_slug
      AND a.published = true
      AND a.is_active = true
      AND a.draft = false
    LIMIT 1;
END;
$function$;


-- ============================================================================
-- 3. count_articles_by_pillar: para /api/blog/categories (pills + counts)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.count_articles_by_pillar(
    p_tenant_id uuid
)
RETURNS TABLE (
    pillar text,
    article_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(a.pillar, 'sin-pillar') AS pillar,
        COUNT(*)::bigint AS article_count
    FROM public.articles a
    WHERE a.tenant_id = p_tenant_id
      AND a.published = true
      AND a.is_active = true
      AND a.draft = false
    GROUP BY a.pillar
    ORDER BY article_count DESC, a.pillar ASC;
END;
$function$;


-- ============================================================================
-- 4. get_related_articles: artículos relacionados por tag overlap, excluye current
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_related_articles(
    p_tenant_id uuid,
    p_current_article_id bigint,
    p_tags text,
    p_limit integer DEFAULT 3
)
RETURNS TABLE (
    id bigint,
    slug text,
    title text,
    description text,
    cover text,
    thumbnail text,
    tags text,
    pillar text,
    published_at timestamptz,
    views numeric,
    author_id uuid,
    author_name text,
    author_avatar text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_tag text;
    v_tag_list text[];
    v_tag_conditions text := '';
    v_sql text;
    v_i integer;
BEGIN
    -- Split tags CSV into array
    v_tag_list := string_to_array(p_tags, ',');
    v_tag_list := array(select trim(t) from unnest(v_tag_list) as t where length(trim(t)) > 0);

    IF array_length(v_tag_list, 1) IS NULL OR array_length(v_tag_list, 1) = 0 THEN
        RETURN;
    END IF;

    -- Build OR conditions: a.tags ILIKE '%tag%'
    v_i := 0;
    WHILE v_i < array_length(v_tag_list, 1) LOOP
        v_tag := v_tag_list[v_i + 1];
        IF v_i > 0 THEN
            v_tag_conditions := v_tag_conditions || ' OR ';
        END IF;
        v_tag_conditions := v_tag_conditions || format('a.tags ILIKE %L', '%' || v_tag || '%');
        v_i := v_i + 1;
    END LOOP;

    v_sql := format('
        SELECT
            a.id,
            a.slug,
            a.title,
            a.description,
            a.cover,
            a.thumbnail,
            a.tags,
            a.pillar,
            a.created_at AS published_at,
            a.views,
            p.id AS author_id,
            p.name::text AS author_name,
            p.logo_avatar::text AS author_avatar
        FROM public.articles a
        JOIN public.profile p ON p.id = a.id_profile
        WHERE a.tenant_id = $1
          AND a.id != $2
          AND a.published = true
          AND a.is_active = true
          AND a.draft = false
          AND (%s)
        ORDER BY a.created_at DESC
        LIMIT $3
    ', v_tag_conditions);

    RETURN QUERY EXECUTE v_sql USING p_tenant_id, p_current_article_id, p_limit;
END;
$function$;
