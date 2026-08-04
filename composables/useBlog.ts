// composables/useBlog.ts
// Tipos y wrappers useFetch para el blog de WARO Labs.
// Multi-tenant scope centralizado en server/utils/blog/tenant.ts.

import { BLOG_PILLARS, isBlogPillar, getBlogPillarLabel, type BlogPillarValue } from '~/server/utils/blog/tenant';

export interface ArticleAuthor {
  id: string;
  name: string;
  avatar: string | null;
  email?: string;
  userName?: string;
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

export function useBlogIndex(options: { pillar?: string | null; search?: string | null; tag?: string | null; page?: number; pageSize?: number } = {}) {
  const pillar = options.pillar && isBlogPillar(options.pillar) ? options.pillar : null;
  const search = options.search?.trim() ? options.search.trim() : null;
  const tag = options.tag?.trim() ? options.tag.trim() : null;
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 12;
  return useFetch<BlogListResponse>('/api/blog/index', {
    query: { pillar, search, tag, page, pageSize },
    key: `blog-index-${pillar ?? 'all'}-${search ?? ''}-${tag ?? ''}-${page}-${pageSize}`,
  });
}

export function useBlogArticle(slug: string | Ref<string>) {
  const slugRef = isRef(slug) ? slug : ref(slug);
  return useFetch<ArticleDetail>(() => `/api/blog/${slugRef.value}`, {
    key: () => `blog-article-${slugRef.value}`,
  });
}

export function useBlogCategories() {
  return useFetch<BlogCategoriesResponse>('/api/blog/categories', {
    key: 'blog-categories',
  });
}
