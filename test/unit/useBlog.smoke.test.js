// test/unit/useBlog.smoke.test.js
// Smoke test: valida que el blog expone los archivos esperados y los exports clave.
// Evita dependencias de TypeScript en Jest (no hay ts-jest configurado en este repo).

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

describe('Blog implementation smoke test', () => {
  test('server/api/blog endpoints exist', () => {
    const paths = [
      'server/api/blog/index.get.ts',
      'server/api/blog/[slug].get.ts',
      'server/api/blog/categories.get.ts',
    ];
    for (const p of paths) {
      expect(fs.existsSync(path.join(ROOT, p))).toBe(true);
    }
  });

  test('server/utils/blog/tenant.ts exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'server/utils/blog/tenant.ts'))).toBe(true);
  });

  test('PG migration file exists with 4 functions', () => {
    const dir = path.join(ROOT, 'db/migrations');
    expect(fs.existsSync(dir)).toBe(true);
    const files = fs.readdirSync(dir).filter((f) => f.startsWith('2026') && f.includes('blog_helpers'));
    expect(files.length).toBeGreaterThanOrEqual(1);
    const src = fs.readFileSync(path.join(dir, files[0]), 'utf8');
    expect(src).toContain('CREATE OR REPLACE FUNCTION public.list_articles');
    expect(src).toContain('CREATE OR REPLACE FUNCTION public.get_article_by_slug');
    expect(src).toContain('CREATE OR REPLACE FUNCTION public.count_articles_by_pillar');
    expect(src).toContain('CREATE OR REPLACE FUNCTION public.get_related_articles');
  });

  test('PG functions are multi-tenant (p_tenant_id param)', () => {
    const dir = path.join(ROOT, 'db/migrations');
    const files = fs.readdirSync(dir).filter((f) => f.startsWith('2026') && f.includes('blog_helpers'));
    const src = fs.readFileSync(path.join(dir, files[0]), 'utf8');
    // 4 functions x 1 p_tenant_id param = 4 occurrences minimum
    const matches = src.match(/p_tenant_id\s+uuid/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(4);
  });

  test('list_articles supports search and tag filters', () => {
    const dir = path.join(ROOT, 'db/migrations');
    const files = fs.readdirSync(dir).filter((f) => f.startsWith('2026') && f.includes('blog_helpers'));
    const src = fs.readFileSync(path.join(dir, files[0]), 'utf8');
    expect(src).toMatch(/list_articles\([^)]*p_search/);
    expect(src).toMatch(/list_articles\([^)]*p_tag/);
  });

  test('composables/useBlog.ts exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'composables/useBlog.ts'))).toBe(true);
  });

  test('pages exist', () => {
    expect(fs.existsSync(path.join(ROOT, 'pages/blog/index.vue'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'pages/blog/[slug].vue'))).toBe(true);
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

  test('ADR doc exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'docs/blog-data-model-decision.md'))).toBe(true);
  });

  test('WAROLABS_TENANT_ID is the warolabs UUID', () => {
    const src = fs.readFileSync(path.join(ROOT, 'server/utils/blog/tenant.ts'), 'utf8');
    expect(src).toContain('b2fd8797-ec09-4ba5-aee4-f2d81ef66412');
  });

  test('BLOG_PILLARS uses the 3 real warolabs pillars', () => {
    const src = fs.readFileSync(path.join(ROOT, 'server/utils/blog/tenant.ts'), 'utf8');
    expect(src).toContain('pillar--software-a-medida');
    expect(src).toContain('pillar--automatizacion-con-ia');
    expect(src).toContain('pillar--ia-para-empresas');
  });
});
