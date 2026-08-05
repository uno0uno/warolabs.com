// composables/useBlog.ts
// Tipos y wrappers useFetch REACTIVOS para el blog de WARO Labs.
// Tenant UUID vive solo en server/utils/blog/tenant.ts (nunca al bundle del cliente).
// BLOG_PILLARS viene de utils/blog/pillars.ts (client-safe, auto-imported por Nuxt).

import {
  BLOG_PILLARS,
  isBlogPillar,
  getBlogPillarLabel,
  type BlogPillarValue,
} from '~/utils/blog/pillars';

export interface ArticleAuthor {
  id: string;
  name: string;
  avatar: string | null;
  email?: string;
  userName?: string;
  description?: string;
}

export interface ArticleSummary {
  id: number;
  slug: string;
  title: string;
  description: string;
  cover: string;
  thumbnail: string;
  tags: string[];
  pillar: string | null;
  publishedAt: string;
  views: number;
  author: ArticleAuthor;
}

export interface Article extends Omit<ArticleSummary, 'author'> {
  content: string;
  metaTitle: string;
  metaDescription: string;
  updatedAt: string | null;
}

export interface ArticleDetail {
  article: Article;
  author: ArticleAuthor;
  tenant: { name: string };
  related: ArticleSummary[];
}

export interface CategoryCount {
  pillar: string;
  count: number;
}

export interface BlogListResponse {
  items: ArticleSummary[];
  total: number;
  page: number;
  pageSize: number;
  pillar: string | null;
  search: string | null;
  tag: string | null;
}

export interface BlogCategoriesResponse {
  categories: CategoryCount[];
}

export { BLOG_PILLARS, isBlogPillar, getBlogPillarLabel };
export type { BlogPillarValue };

export interface UseBlogIndexOptions {
  pillar?: Ref<string | null> | string | null;
  search?: Ref<string | null> | string | null;
  tag?: Ref<string | null> | string | null;
  page?: Ref<number> | number;
  pageSize?: Ref<number> | number;
}

function unwrap<T>(value: Ref<T> | T | undefined, fallback: T): T {
  if (value === undefined || value === null) return fallback;
  return isRef(value) ? value.value : value;
}

export function useBlogIndex(options: UseBlogIndexOptions = {}) {
  const pillar = computed(() => {
    const v = unwrap(options.pillar, null);
    return v && isBlogPillar(v) ? v : null;
  });
  const search = computed(() => {
    const v = unwrap(options.search, null);
    return v && typeof v === 'string' && v.trim().length > 0 ? v.trim() : null;
  });
  const tag = computed(() => {
    const v = unwrap(options.tag, null);
    return v && typeof v === 'string' && v.trim().length > 0 ? v.trim() : null;
  });
  const page = computed(() => Math.max(1, Number(unwrap(options.page, 1)) || 1));
  const pageSize = computed(() => Math.min(60, Math.max(1, Number(unwrap(options.pageSize, 12)) || 12)));

  return useFetch<BlogListResponse>('/api/blog', {
    query: { pillar, search, tag, page, pageSize },
    watch: [pillar, search, tag, page, pageSize],
    key: 'blog-index',
  });
}

export function useBlogArticle(slug: string | Ref<string>) {
  const slugRef = isRef(slug) ? slug : ref(slug);
  return useFetch<ArticleDetail>(() => `/api/blog/${slugRef.value}`, {
    key: () => `blog-article-${slugRef.value}`,
    watch: [slugRef],
  });
}

export function useBlogView(slug: string | Ref<string>) {
  const slugRef = isRef(slug) ? slug : ref(slug);
  return useFetch<{ ok: boolean; views: number }>(() => `/api/blog/${slugRef.value}/view`, {
    method: 'POST',
    body: computed(() => ({ slug: slugRef.value })),
    server: false,
    immediate: false,
    key: () => `blog-view-${slugRef.value}`,
  });
}

export function useBlogCategories() {
  return useFetch<BlogCategoriesResponse>('/api/blog/categories', {
    key: 'blog-categories',
  });
}
