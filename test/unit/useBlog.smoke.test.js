// test/unit/useBlog.smoke.test.js
// Smoke + integration smoke test: valida que el blog expone los archivos esperados,
// la separacion client/server, las 5 PG functions con search_path, y los endpoints.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

describe('Blog implementation smoke test', () => {
  test('server/api/blog endpoints exist (3 GET + 1 POST)', () => {
    const paths = [
      'server/api/blog/index.get.ts',
      'server/api/blog/[slug].get.ts',
      'server/api/blog/categories.get.ts',
      'server/api/blog/[slug]/view.post.ts',
    ];
    for (const p of paths) {
      expect(fs.existsSync(path.join(ROOT, p))).toBe(true);
    }
  });

  test('client/server utils separated (no server-only import from composables)', () => {
    // BLOG_PILLARS debe estar en utils/ (client-safe, auto-imported)
    expect(fs.existsSync(path.join(ROOT, 'utils/blog/pillars.ts'))).toBe(true);
    // WAROLABS_TENANT_ID solo en server/utils/blog/tenant.ts
    expect(fs.existsSync(path.join(ROOT, 'server/utils/blog/tenant.ts'))).toBe(true);
    // Composable NO debe importar de server/utils/blog/tenant (server-only)
    const composable = fs.readFileSync(path.join(ROOT, 'composables/useBlog.ts'), 'utf8');
    expect(composable).not.toMatch(/from\s+['"]~?\/server\/utils\/blog\/tenant/);
    // Composable SI debe importar BLOG_PILLARS de utils/blog/pillars
    expect(composable).toMatch(/from\s+['"]~?\/utils\/blog\/pillars/);
  });

  test('PG migration file exists with 5 functions', () => {
    const dir = path.join(ROOT, 'db/migrations');
    expect(fs.existsSync(dir)).toBe(true);
    const files = fs.readdirSync(dir).filter((f) => f.startsWith('2026') && f.includes('blog_helpers'));
    expect(files.length).toBeGreaterThanOrEqual(1);
    const src = fs.readFileSync(path.join(dir, files[0]), 'utf8');
    expect(src).toContain('CREATE OR REPLACE FUNCTION public.list_articles');
    expect(src).toContain('CREATE OR REPLACE FUNCTION public.get_article_by_slug');
    expect(src).toContain('CREATE OR REPLACE FUNCTION public.count_articles_by_pillar');
    expect(src).toContain('CREATE OR REPLACE FUNCTION public.get_related_articles');
    expect(src).toContain('CREATE OR REPLACE FUNCTION public.increment_article_views');
  });

  test('All 5 PG functions have SET search_path (SECURITY DEFINER hardening)', () => {
    const dir = path.join(ROOT, 'db/migrations');
    const files = fs.readdirSync(dir).filter((f) => f.startsWith('2026') && f.includes('blog_helpers'));
    const src = fs.readFileSync(path.join(dir, files[0]), 'utf8');
    const matches = src.match(/SET search_path = public, pg_temp/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(5);
  });

  test('PG functions are multi-tenant (p_tenant_id param)', () => {
    const dir = path.join(ROOT, 'db/migrations');
    const files = fs.readdirSync(dir).filter((f) => f.startsWith('2026') && f.includes('blog_helpers'));
    const src = fs.readFileSync(path.join(dir, files[0]), 'utf8');
    const matches = src.match(/p_tenant_id\s+uuid/g) || [];
    // 5 functions x 1 p_tenant_id each = 5 occurrences
    expect(matches.length).toBeGreaterThanOrEqual(5);
  });

  test('list_articles supports search and tag filters', () => {
    const dir = path.join(ROOT, 'db/migrations');
    const files = fs.readdirSync(dir).filter((f) => f.startsWith('2026') && f.includes('blog_helpers'));
    const src = fs.readFileSync(path.join(dir, files[0]), 'utf8');
    expect(src).toMatch(/list_articles\([^)]*p_search/);
    expect(src).toMatch(/list_articles\([^)]*p_tag/);
  });

  test('list_articles returns total + items jsonb (no per-row duplication)', () => {
    const dir = path.join(ROOT, 'db/migrations');
    const files = fs.readdirSync(dir).filter((f) => f.startsWith('2026') && f.includes('blog_helpers'));
    const src = fs.readFileSync(path.join(dir, files[0]), 'utf8');
    expect(src).toMatch(/RETURNS TABLE\s*\(\s*total\s+bigint,\s*items\s+jsonb\s*\)/);
  });

  test('get_article_by_slug is READ-ONLY (no UPDATE in function body)', () => {
    const dir = path.join(ROOT, 'db/migrations');
    const files = fs.readdirSync(dir).filter((f) => f.startsWith('2026') && f.includes('blog_helpers'));
    const src = fs.readFileSync(path.join(dir, files[0]), 'utf8');
    // Extraer el cuerpo de get_article_by_slug y verificar que no tiene UPDATE
    const fnStart = src.indexOf('CREATE OR REPLACE FUNCTION public.get_article_by_slug');
    const fnEnd = src.indexOf('$function$', src.indexOf('$function$', fnStart) + 1);
    const fnBody = src.slice(fnStart, fnEnd);
    expect(fnBody).not.toMatch(/UPDATE\s+public\.articles/i);
  });

  test('increment_article_views uses advisory lock (race-free)', () => {
    const dir = path.join(ROOT, 'db/migrations');
    const files = fs.readdirSync(dir).filter((f) => f.startsWith('2026') && f.includes('blog_helpers'));
    const src = fs.readFileSync(path.join(dir, files[0]), 'utf8');
    expect(src).toMatch(/pg_advisory_xact_lock/);
  });

  test('Migration wrapped in BEGIN/COMMIT', () => {
    const dir = path.join(ROOT, 'db/migrations');
    const files = fs.readdirSync(dir).filter((f) => f.startsWith('2026') && f.includes('blog_helpers'));
    const src = fs.readFileSync(path.join(dir, files[0]), 'utf8');
    // BEGIN antes de la primera CREATE; COMMIT al final
    const firstCreate = src.indexOf('CREATE OR REPLACE FUNCTION');
    const beginBefore = src.lastIndexOf('BEGIN;', firstCreate);
    expect(beginBefore).toBeGreaterThan(-1);
    expect(src.trim().endsWith('COMMIT;')).toBe(true);
  });

  test('composables/useBlog.ts exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'composables/useBlog.ts'))).toBe(true);
  });

  test('useBlogIndex accepts Refs (reactive)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'composables/useBlog.ts'), 'utf8');
    expect(src).toMatch(/useBlogIndex/);
    // Debe usar watch para refetch cuando cambian los refs
    expect(src).toMatch(/watch:\s*\[/);
  });

  test('pages exist with definePageMeta', () => {
    const indexSrc = fs.readFileSync(path.join(ROOT, 'pages/blog/index.vue'), 'utf8');
    const slugSrc = fs.readFileSync(path.join(ROOT, 'pages/blog/[slug].vue'), 'utf8');
    expect(indexSrc).toMatch(/definePageMeta/);
    expect(slugSrc).toMatch(/definePageMeta/);
  });

  test('14 blog components exist', () => {
    const expected = [
      'BlogHero',
      'BlogMasthead',
      'BlogCategorySection',
      'BlogFeaturedArticleCard',
      'BlogCard',
      'BlogFilters',
      'BlogSearchBar',
      'BlogPagination',
      'BlogBreadcrumb',
      'BlogArticleHero',
      'BlogArticleImage',
      'BlogArticleContent',
      'BlogAuthorCard',
      'BlogArticleCTA',
    ];
    for (const name of expected) {
      const file = path.join(ROOT, `components/blog/${name}.vue`);
      expect(fs.existsSync(file)).toBe(true);
    }
  });

  test('Commons helpers exist (scope drift acknowledged)', () => {
    expect(fs.existsSync(path.join(ROOT, 'components/Commons/CommonsTheLoading.vue'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'components/Commons/MarkdownRenderer.vue'))).toBe(true);
  });

  test('BlogArticleImage uses literal aspect classes (no replace no-op)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'components/blog/BlogArticleImage.vue'), 'utf8');
    expect(src).not.toMatch(/replace\(['"]\/['"],\s*['"]\/['"]\)/);
    expect(src).toMatch(/aspect-video|aspect-square/);
  });

  test('Slug validation regex in API routes', () => {
    const slugApi = fs.readFileSync(path.join(ROOT, 'server/api/blog/[slug].get.ts'), 'utf8');
    const viewApi = fs.readFileSync(path.join(ROOT, 'server/api/blog/[slug]/view.post.ts'), 'utf8');
    expect(slugApi).toMatch(/\[a-z0-9-\]/);
    expect(viewApi).toMatch(/\[a-z0-9-\]/);
  });

  test('API errors logged with .message only (no raw error leak)', () => {
    const indexApi = fs.readFileSync(path.join(ROOT, 'server/api/blog/index.get.ts'), 'utf8');
    const slugApi = fs.readFileSync(path.join(ROOT, 'server/api/blog/[slug].get.ts'), 'utf8');
    const viewApi = fs.readFileSync(path.join(ROOT, 'server/api/blog/[slug]/view.post.ts'), 'utf8');
    for (const src of [indexApi, slugApi, viewApi]) {
      expect(src).toMatch(/error\.message|error\s+instanceof\s+Error/);
    }
  });

  test('ADR doc exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'docs/blog-data-model-decision.md'))).toBe(true);
  });

  test('WAROLABS_TENANT_ID is the warolabs UUID (in server-only file)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'server/utils/blog/tenant.ts'), 'utf8');
    expect(src).toContain('b2fd8797-ec09-4ba5-aee4-f2d81ef66412');
  });

  test('BLOG_PILLARS uses the 3 real warolabs pillars (in client-safe file)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'utils/blog/pillars.ts'), 'utf8');
    expect(src).toContain('pillar--software-a-medida');
    expect(src).toContain('pillar--automatizacion-con-ia');
    expect(src).toContain('pillar--ia-para-empresas');
  });

  test('View endpoint (POST) exists for increment', () => {
    const src = fs.readFileSync(path.join(ROOT, 'server/api/blog/[slug]/view.post.ts'), 'utf8');
    expect(src).toContain('increment_article_views');
  });
});
