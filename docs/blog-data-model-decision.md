# ADR-001: Blog dinámico de WARO Labs — Data Model

**Status:** Aprobado (owner, 2026-08-04)
**Issue:** uno0uno/warolabs.com#3
**Contexto:** Migración warocol → warolabs (epic #1)

## Decisión

Implementar el blog dinámico de warolabs.com con **Path A: API + PostgreSQL** (H3 + withPostgresClient + 3 PG functions SECURITY DEFINER multi-tenant). Descartado Path B (`@nuxt/content`).

## Contexto

El blog público de warolabs.com debe reemplazar el contenido estático actual (`pages/blog/{index,configuracion,instalacion}.vue`) con un sistema dinámico que cargue artículos desde la tabla `public.articles` ya existente en la DB. La tabla soporta multi-tenancy vía `tenant_id` con FK a `tenants(id)`, multilingual, SEO metadata, y estado de publicación (`published`, `draft`, `is_active`).

WaroLabs opera como tenant propio (slug=`warolabs`, id=`b2fd8797-ec09-4ba5-aee4-f2d81ef66412`). El contenido del tenant warocolombia (id=`93b3e582-34fa-44a6-8d0f-bf82a3608727`) NO se migra: 65 artículos permanecen asignados a warocolombia. Warolabs arranca con blog vacío; el seed de artículos será un batch posterior.

## Opciones evaluadas

### Path A — API + PostgreSQL ✅ (recomendado y aprobado)

- 3 PG functions `SECURITY DEFINER` con multi-tenant scope: `list_articles(p_tenant_id, p_pillar, p_page, p_page_size)`, `get_article_by_slug(p_tenant_id, p_slug)`, `count_articles_by_pillar(p_tenant_id)`.
- H3 event handlers en `server/api/blog/{index,[slug],categories}.get.ts` con `withPostgresClient`.
- Composable `composables/useBlog.ts` con tipos `Article`, `ArticleSummary`, `ArticleAuthor`, `CategoryCount`, `BLOG_PILLARS` y wrappers `useFetch`.
- Reutiliza la tabla `articles` existente (multilingual, SEO, multi-tenant).
- Compatible con integración futura de comments, leads y CRM (la tabla `comments` y `lead_interactions` ya existen).
- Cumple política ACID + multi-tenant scope del repo (CLAUDE.md:170-185).

### Path B — @nuxt/content ❌ (descartado)

- Colección markdown local servida vía módulo `@nuxt/content`.
- No requiere DB hit; diverge del modelo actual; pierde integración multi-tenant.
- Comentarios y captura de leads requerirían modelo paralelo.
- Requiere instalación nueva (`npm i @nuxt/content`) y entry en `nuxt.config.ts:114-118` modules.

## Pillars

`BLOG_PILLARS` usa los 3 slugs REALES de warolabs (NO warocolombia):

| Slug | Label | Descripción |
|---|---|---|
| `pillar--software-a-medida` | Software a Medida | Captura comercial principal |
| `pillar--automatizacion-con-ia` | Automatización con IA | Puente entre dolor operativo e IA |
| `pillar--ia-para-empresas` | IA para Empresas | Autoridad en IA aplicada |

Source: `content/_graph.md` y `content/pillar--*/meta.md`.

## Tenant

WAROLABS_TENANT_ID = `b2fd8797-ec09-4ba5-aee4-f2d81ef66412` (slug=`warolabs`). Centralizado en `server/utils/blog/tenant.ts`.

## Schema `articles` (live DB confirmado)

```sql
CREATE TABLE public.articles (
    id bigint PK IDENTITY,
    created_at timestamptz,
    content text,         -- markdown con HTML block comments
    slug text UNIQUE,
    published boolean,
    draft boolean,
    is_active boolean,
    tags text,            -- CSV
    meta_descripcion text UNIQUE,
    cover text,
    views numeric,
    id_profile uuid FK -> profile(id),
    meta_title text,
    title text,
    description text,
    updated_at timestamptz,
    tenant_id uuid FK -> tenants(id),
    pillar text           -- añadido 20260722
);
```

Nota: `author` (uuid) **no tiene FK declarada**; el JOIN para autor debe ser por `id_profile` que sí tiene FK.

## Consecuencias

- ✅ Blog dinámico consumiendo DB existente. Cero modelo paralelo.
- ✅ Multi-tenant nativo vía `tenant_id` en cada query.
- ✅ PG functions `SECURITY DEFINER` cumplen la política del repo.
- ✅ Compatible con SEO, comments, leads, i18n futuro.
- ⚠️ Requiere migración nueva (`db/migrations/20260804_blog_helpers.sql`) — debe correr antes del deploy.
- ⚠️ `wr-review` obligatorio tras PR (cambio sensible: schema DB).

## Out of scope

- Borrar blog viejo (`instalacion.vue`, `configuracion.vue`, `guias/`, `BlogSidebar.vue`, `BlogTOC.vue`, `layouts/blog.vue`) → #4.
- Seed de artículos en warolabs → batch posterior.
- Modificar artículos de warocolombia (NO TOCAR).
- Comments / leads / segments sobre artículos (futuro).
- i18n real (ES-only en lanzamiento).
