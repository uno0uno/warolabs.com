-- warolabs.com#3 - Blog helpers: 5 PG functions SECURITY DEFINER para blog dinamico multi-tenant.
-- Multi-tenant: p_tenant_id es obligatorio en todas. Reusable por cualquier tenant.
-- SET search_path defensivo contra hijacking de schema en funciones SECURITY DEFINER.
-- BEGIN/COMMIT: aplicacion atomica del set de funciones.
-- Lógica portada de api_warocol.com/app/services/articles_service.py (raw SQL → PG function).
-- Race condition en views++ resuelta: increment movido a funcion separada (POST /api/blog/[slug]/view).

BEGIN;

-- DROP de signatures anteriores (idempotente: solo si existen con la firma vieja).
-- Necesario porque CREATE OR REPLACE no puede cambiar RETURNS TYPE.
DROP FUNCTION IF EXISTS public.list_articles(uuid, text, text, text, integer, integer);
DROP FUNCTION IF EXISTS public.get_article_by_slug(uuid, text, boolean);
DROP FUNCTION IF EXISTS public.get_article_by_slug(uuid, text);
DROP FUNCTION IF EXISTS public.count_articles_by_pillar(uuid);
DROP FUNCTION IF EXISTS public.get_related_articles(uuid, bigint, text, integer);
DROP FUNCTION IF EXISTS public.increment_article_views(uuid, text);

-- ============================================================================
-- 1. list_articles: paginacion + filtros + total en una sola fila
--    Retorna TABLE(total bigint, items jsonb) para evitar duplicacion de total_count
--    y el bug de "total perdido" cuando items = [].
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
    total bigint,
    items jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
    v_offset integer;
    v_where text := 'WHERE a.tenant_id = $1 AND a.published = true AND a.is_active = true AND a.draft = false';
    v_total bigint;
    v_items jsonb;
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

    -- Items as JSONB (single aggregate, no per-row duplication)
    EXECUTE '
        SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb)
        FROM (
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
                jsonb_build_object(
                    ''id'', p.id,
                    ''name'', p.name,
                    ''avatar'', p.logo_avatar
                ) AS author
            FROM public.articles a
            JOIN public.profile p ON p.id = a.id_profile
            ' || v_where || '
            ORDER BY a.created_at DESC, a.id DESC
            LIMIT $5 OFFSET $6
        ) t
    '
    INTO v_items
    USING p_tenant_id, p_pillar, '%' || p_search || '%', '%' || p_tag || '%', p_page_size, v_offset;

    total := v_total;
    items := v_items;
    RETURN NEXT;
END;
$function$;


-- ============================================================================
-- 2. get_article_by_slug: detalle + autor + tenant (READ-ONLY).
--    El increment de views se hace en una funcion separada (increment_article_views)
--    llamada por POST /api/blog/[slug]/view para evitar race conditions y
--    respetar semantica REST (GET no debe mutar estado).
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_article_by_slug(
    p_tenant_id uuid,
    p_slug text
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
SET search_path = public, pg_temp
AS $function$
BEGIN
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
-- 3. count_articles_by_pillar: para /api/blog/categories (pillars + counts)
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
SET search_path = public, pg_temp
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
-- 4. get_related_articles: articulos relacionados por tag overlap
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
SET search_path = public, pg_temp
AS $function$
DECLARE
    v_tag text;
    v_tag_list text[];
    v_tag_conditions text := '';
    v_sql text;
    v_i integer;
BEGIN
    v_tag_list := string_to_array(p_tags, ',');
    v_tag_list := array(select trim(t) from unnest(v_tag_list) as t where length(trim(t)) > 0);

    IF array_length(v_tag_list, 1) IS NULL OR array_length(v_tag_list, 1) = 0 THEN
        RETURN;
    END IF;

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


-- ============================================================================
-- 5. increment_article_views: UPDATE atomico con serializacion por advisory lock.
--    Llamado por POST /api/blog/[slug]/view (no desde el GET).
--    Retorna el nuevo views o NULL si el articulo no existe.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.increment_article_views(
    p_tenant_id uuid,
    p_slug text
)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
    v_new_views numeric;
BEGIN
    -- Advisory lock per-article (hashtext evita colisiones en namespace lock)
    PERFORM pg_advisory_xact_lock(hashtext('article-view:' || p_slug));

    UPDATE public.articles AS a
    SET views = COALESCE(a.views, 0) + 1
    WHERE a.tenant_id = p_tenant_id
      AND a.slug = p_slug
      AND a.published = true
      AND a.is_active = true
      AND a.draft = false
    RETURNING a.views INTO v_new_views;

    RETURN v_new_views;
END;
$function$;

COMMIT;
