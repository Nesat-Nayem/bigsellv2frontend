import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Types
 */
export interface IAttribute {
  name: string;
  type: "text" | "select" | string;
  required?: boolean;
  options?: string[];
}

export interface ICategory {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  icon?: string;
  parentId?: string | null;
  level?: number;
  path?: string;
  fullPath?: string;
  isActive?: boolean;
  displayOrder?: number;
  attributes?: IAttribute[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  image?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // for tree responses:
  children?: ICategory[];
}

interface PaginatedData {
  docs: ICategory[];
  total?: number;
  page?: number;
  limit?: number;
}

interface StandardResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T | null;
  meta?: any;
  errorSources?: Array<{ path?: string; message?: string }>;
}

/**
 * Helper: build query string from object
 */
const buildQuery = (params?: Record<string, any>) => {
  if (!params) return "";
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    // if array push multiple times
    if (Array.isArray(v)) v.forEach((val) => qp.append(k, String(val)));
    else qp.append(k, String(v));
  });
  const qs = qp.toString();
  return qs ? `?${qs}` : "";
};

export const productCategoryApi = createApi({
  reducerPath: "productCategoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080/v1/api",
  }),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    /* ---------------- Basic CRUD ---------------- */
    createCategory: builder.mutation<ICategory, Partial<ICategory>>({
      query: (newCategory) => ({
        url: `/productsCategory`,
        method: "POST",
        body: newCategory,
      }),
      transformResponse: (res: StandardResponse<ICategory>) =>
        res.data as ICategory,
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    getCategories: builder.query<
      { items: ICategory[]; total?: number; page?: number; limit?: number },
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => {
        if (!params) return `/productsCategory`;
        const { page, limit, search } = params;
        return `/productsCategory${buildQuery({ page, limit, search })}`;
      },
      transformResponse: (
        response: StandardResponse<
          PaginatedData | ICategory[] | ICategory | null
        >
      ) => {
        const data = response?.data;
        if (!data) return { items: [], total: 0 };
        // paginated
        if ((data as PaginatedData).docs) {
          const pag = data as PaginatedData;
          return {
            items: Array.isArray(pag.docs) ? pag.docs : [],
            total: pag.total,
            page: pag.page,
            limit: pag.limit,
          };
        }
        // array
        if (Array.isArray(data))
          return {
            items: data as ICategory[],
            total: (data as ICategory[]).length,
          };
        // single object
        return { items: [data as ICategory], total: 1 };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((c) => ({
                type: "Category" as const,
                id: c._id,
              })),
              { type: "Category" as const, id: "LIST" },
            ]
          : [{ type: "Category" as const, id: "LIST" }],
    }),

    getCategoryById: builder.query<ICategory, string>({
      query: (id) => `/productsCategory/${id}`,
      transformResponse: (
        res: StandardResponse<ICategory | ICategory[] | PaginatedData>
      ) => {
        const data = res.data;
        if (!data) throw new Error(res.message || "No data");
        if (Array.isArray(data)) return data[0] as ICategory;
        if ((data as PaginatedData).docs) {
          const docs = (data as PaginatedData).docs;
          return Array.isArray(docs) && docs.length > 0
            ? docs[0]
            : ({} as ICategory);
        }
        return data as ICategory;
      },
      providesTags: (_res, _err, id) => [{ type: "Category", id }],
    }),

    updateCategory: builder.mutation<
      ICategory,
      { id: string; updates: Partial<ICategory> }
    >({
      query: ({ id, updates }) => ({
        url: `/productsCategory/${id}`,
        method: "PUT",
        body: updates,
      }),
      transformResponse: (res: StandardResponse<ICategory>) =>
        res.data as ICategory,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
      ],
    }),

    deleteCategory: builder.mutation<
      { success: boolean; message?: string },
      string
    >({
      query: (id) => ({
        url: `/productsCategory/${id}`,
        method: "DELETE",
      }),
      transformResponse: (
        res: StandardResponse<{ success: boolean; message?: string }>
      ) => res.data || { success: false },
      invalidatesTags: (_res, _err, id) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
      ],
    }),

    /* ---------------- Hierarchical Operations ---------------- */

    // GET /productsCategory/tree?maxDepth=3
    getCategoryTree: builder.query<ICategory[], { maxDepth?: number } | void>({
      query: (params) => `/productsCategory/tree${buildQuery(params ?? {})}`,
      transformResponse: (res: StandardResponse<ICategory[]>) =>
        (res.data as ICategory[]) || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: "Category" as const, id: c._id })),
              { type: "Category", id: "TREE" },
            ]
          : [{ type: "Category", id: "TREE" }],
    }),

    // GET /productsCategory/root
    getRootCategories: builder.query<ICategory[], void>({
      query: () => `/productsCategory/root`,
      transformResponse: (res: StandardResponse<ICategory[]>) =>
        (res.data as ICategory[]) || [],
      providesTags: [{ type: "Category", id: "ROOTS" }],
    }),

    // GET /productsCategory/parent/:parentId
    getChildrenByParent: builder.query<ICategory[], string>({
      query: (parentId) => `/productsCategory/parent/${parentId}`,
      transformResponse: (res: StandardResponse<ICategory[]>) =>
        (res.data as ICategory[]) || [],
      providesTags: (_res, _err, parentId) => [
        { type: "Category", id: parentId },
      ],
    }),

    // GET /productsCategory/:id/breadcrumbs
    getCategoryBreadcrumbs: builder.query<ICategory[], string>({
      query: (id) => `/productsCategory/${id}/breadcrumbs`,
      transformResponse: (res: StandardResponse<ICategory[]>) =>
        (res.data as ICategory[]) || [],
      providesTags: (_res, _err, id) => [
        { type: "Category", id: `breadcrumbs-${id}` },
      ],
    }),

    // GET /productsCategory/search?query=shirt&level=2&page=1&limit=5
    searchCategories: builder.query<
      { items: ICategory[]; meta?: any },
      { query: string; level?: number; page?: number; limit?: number }
    >({
      query: (params) => `/productsCategory/search${buildQuery(params)}`,
      transformResponse: (res: StandardResponse<{ docs?: ICategory[] }>) => {
        const data = res.data;
        if (!data) return { items: [], meta: res.meta };
        if ((data as PaginatedData).docs) {
          const pag = data as PaginatedData;
          return {
            items: pag.docs,
            meta: { page: pag.page, limit: pag.limit, total: pag.total },
          };
        }
        if (Array.isArray(data))
          return { items: data as ICategory[], meta: res.meta };
        return { items: [], meta: res.meta };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((c) => ({
                type: "Category" as const,
                id: c._id,
              })),
              { type: "Category", id: "SEARCH" },
            ]
          : [{ type: "Category", id: "SEARCH" }],
    }),

    // Additional useful endpoints
    bulkDeleteCategories: builder.mutation<
      { success: boolean; message?: string; deletedCount?: number },
      string[]
    >({
      query: (ids) => ({
        url: `/productsCategory/bulk-delete`,
        method: "DELETE",
        body: { ids },
      }),
      transformResponse: (
        res: StandardResponse<{
          success: boolean;
          message?: string;
          deletedCount?: number;
        }>
      ) => res.data || { success: false },
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    reorderCategories: builder.mutation<
      ICategory[],
      Array<{ id: string; displayOrder: number }>
    >({
      query: (reorderData) => ({
        url: `/productsCategory/reorder`,
        method: "PUT",
        body: { categories: reorderData },
      }),
      transformResponse: (res: StandardResponse<ICategory[]>) =>
        res.data as ICategory[],
      invalidatesTags: [
        { type: "Category", id: "LIST" },
        { type: "Category", id: "TREE" },
      ],
    }),

    toggleCategoryStatus: builder.mutation<
      ICategory,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/productsCategory/${id}/toggle-status`,
        method: "PATCH",
        body: { isActive },
      }),
      transformResponse: (res: StandardResponse<ICategory>) =>
        res.data as ICategory,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
      ],
    }),
  }),
});

/**
 * Export hooks
 */
export const {
  // Basic CRUD
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,

  // Hierarchical Operations
  useGetCategoryTreeQuery,
  useGetRootCategoriesQuery,
  useGetChildrenByParentQuery,
  useGetCategoryBreadcrumbsQuery,
  useSearchCategoriesQuery,

  // Additional operations
  useBulkDeleteCategoriesMutation,
  useReorderCategoriesMutation,
  useToggleCategoryStatusMutation,

  // Lazy query hooks
  useLazyGetCategoryTreeQuery,
  useLazyGetCategoriesQuery,
  useLazyGetChildrenByParentQuery,
  useLazySearchCategoriesQuery,
  useLazyGetCategoryByIdQuery,
} = productCategoryApi;

export default productCategoryApi;
