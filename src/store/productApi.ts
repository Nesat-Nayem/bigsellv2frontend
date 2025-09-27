import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState as IRootState } from "@/store";

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://bigsellv2backend.vercel.app/v1/api";
/**
 * Product model returned by backend.
 */
export interface IProducts {
  _id?: string;
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  discountType?: "percentage" | "flat" | "fixed" | "other" | "";
  sku?: string;
  category?:
    | {
        _id: string;
        title: string;
      }
    | string;
  subcategory?: string;
  brand?: string;
  images?: string[];
  thumbnail?: string;
  stock?: number;
  minStock?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  features?: string[];
  specifications?: { key: string; value: string }[] | Record<string, any>;
  status?: "active" | "inactive" | "";
  isFeatured?: boolean;
  isTrending?: boolean;
  isNewArrival?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  vendor?: string;
  shippingInfo?: {
    weight?: number;
    freeShipping?: boolean;
    shippingCost?: number;
    estimatedDelivery?: string;
  };
  rating?: number;
  reviewCount?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

/** Generic API response wrapper from backend */
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
}

/** Normalize backend response to always return array */
const normalizeToArray = <T>(payload: T | T[] | undefined): T[] => {
  if (!payload) return [];
  return Array.isArray(payload) ? payload : [payload];
};

/** Tag helpers for consistent typing */
type ProductTag = { type: "Products"; id: string };
const productTag = (id: string): ProductTag => ({ type: "Products", id });
const productListTag = (): ProductTag => productTag("LIST");
const featuredTag = (): ProductTag => productTag("FEATURED");
const trendingTag = (): ProductTag => productTag("TRENDING");
const newArrivalsTag = (): ProductTag => productTag("NEW_ARRIVALS");
const filtersTag = (): ProductTag => productTag("FILTERS");
const categoryTag = (categoryId: string): ProductTag =>
  productTag(`CATEGORY_${categoryId}`);

/**
 * productsApi - RTK Query service
 */
export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}`, //ProdApis: https://bigsellv2backend.vercel.app/
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as IRootState;
      const token = (state as any)?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    // Create a new product
    createProduct: builder.mutation<IProducts, Partial<IProducts>>({
      query: (newProduct) => ({
        url: "/products",
        method: "POST",
        body: newProduct,
      }),
      invalidatesTags: (result) =>
        result && result._id
          ? [productListTag(), productTag(result._id)]
          : [productListTag()],
    }),

    // Get all products
    getProducts: builder.query<IProducts[], void>({
      query: () => "/products",
      transformResponse: (response: ApiResponse<IProducts | IProducts[]>) =>
        normalizeToArray(response?.data),
      providesTags: (result) =>
        result && result.length
          ? [
              productListTag(),
              ...result.map((p) => productTag(p._id ?? "UNKNOWN")),
            ]
          : [productListTag()],
    }),

    // Get product by ID
    getProductById: builder.query<IProducts | undefined, string>({
      query: (id) => `/products/${encodeURIComponent(id)}`,
      transformResponse: (response: ApiResponse<IProducts | IProducts[]>) => {
        const arr = normalizeToArray(response?.data);
        return arr.length ? arr[0] : undefined;
      },
      providesTags: (_result, _error, id) => [productTag(id)],
    }),

    // Search products
    searchProducts: builder.query<IProducts[], string>({
      query: (searchTerm) =>
        `/products/search?q=${encodeURIComponent(searchTerm)}`,
      transformResponse: (response: ApiResponse<IProducts | IProducts[]>) =>
        normalizeToArray(response?.data),
      providesTags: (result) =>
        result && result.length
          ? [
              productListTag(),
              ...result.map((p) => productTag(p._id ?? "UNKNOWN")),
            ]
          : [productListTag()],
    }),

    // Featured products
    getFeaturedProducts: builder.query<IProducts[], void>({
      query: () => "/products/featured",
      transformResponse: (response: ApiResponse<IProducts | IProducts[]>) =>
        normalizeToArray(response?.data),
      providesTags: (result) =>
        result && result.length
          ? [
              featuredTag(),
              ...result.map((p) => productTag(p._id ?? "UNKNOWN")),
            ]
          : [featuredTag()],
    }),

    // Trending products
    getTrendingProducts: builder.query<IProducts[], number | void>({
      query: (limit) => {
        const params = limit ? `?limit=${limit}` : "";
        return `/products/trending${params}`;
      },
      transformResponse: (response: ApiResponse<IProducts | IProducts[]>) =>
        normalizeToArray(response?.data),
      providesTags: (result) =>
        result && result.length
          ? [
              trendingTag(),
              ...result.map((p) => productTag(p._id ?? "UNKNOWN")),
            ]
          : [trendingTag()],
    }),

    // New arrivals
    getNewArrivals: builder.query<IProducts[], void>({
      query: () => "/products/new-arrivals",
      transformResponse: (response: ApiResponse<IProducts | IProducts[]>) =>
        normalizeToArray(response?.data),
      providesTags: (result) =>
        result && result.length
          ? [
              newArrivalsTag(),
              ...result.map((p) => productTag(p._id ?? "UNKNOWN")),
            ]
          : [newArrivalsTag()],
    }),

    // Weekly best selling products
    getWeeklyBestSellingProducts: builder.query<IProducts[], number | void>({
      query: (limit) => {
        const params = limit ? `?limit=${limit}` : "";
        return `/products/weekly-best-selling${params}`;
      },
      transformResponse: (response: ApiResponse<IProducts | IProducts[]>) =>
        normalizeToArray(response?.data),
      providesTags: (result) =>
        result && result.length
          ? [
              productTag("WEEKLY_BESTSELLING"),
              ...result.map((p) => productTag(p._id ?? "UNKNOWN")),
            ]
          : [productTag("WEEKLY_BESTSELLING")],
    }),

    // Discount products
    getDiscountProducts: builder.query<IProducts[], number | void>({
      query: (limit) => {
        const params = limit ? `?limit=${limit}` : "";
        return `/products/discount${params}`;
      },
      transformResponse: (response: ApiResponse<IProducts | IProducts[]>) =>
        normalizeToArray(response?.data),
      providesTags: (result) =>
        result && result.length
          ? [
              productTag("DISCOUNT"),
              ...result.map((p) => productTag(p._id ?? "UNKNOWN")),
            ]
          : [productTag("DISCOUNT")],
    }),

    // Weekly discount products
    getWeeklyDiscountProducts: builder.query<IProducts[], number | void>({
      query: (limit) => {
        const params = limit ? `?limit=${limit}` : "";
        return `/products/weekly-discount${params}`;
      },
      transformResponse: (response: ApiResponse<IProducts | IProducts[]>) =>
        normalizeToArray(response?.data),
      providesTags: (result) =>
        result && result.length
          ? [
              productTag("WEEKLY_DISCOUNT"),
              ...result.map((p) => productTag(p._id ?? "UNKNOWN")),
            ]
          : [productTag("WEEKLY_DISCOUNT")],
    }),

    // Product filters
    getProductFilters: builder.query<any, void>({
      query: () => "/products/filters",
      providesTags: [filtersTag()],
    }),

    // Products by category
    getProductsByCategory: builder.query<IProducts[], string>({
      query: (categoryId) =>
        `/products/category/${encodeURIComponent(categoryId)}`,
      transformResponse: (response: ApiResponse<IProducts | IProducts[]>) =>
        normalizeToArray(response?.data),
      providesTags: (result, _error, categoryId) =>
        result && result.length
          ? [
              categoryTag(categoryId),
              ...result.map((p) =>
                productTag(p._id ?? `CATEGORY_${categoryId}`)
              ),
            ]
          : [categoryTag(categoryId)],
    }),

    // Update product
    updateProduct: builder.mutation<
      IProducts,
      { id: string; updates: Partial<IProducts> }
    >({
      query: ({ id, updates }) => ({
        url: `/products/${encodeURIComponent(id)}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        productTag(id),
        productListTag(),
      ],
    }),

    // Delete product
    deleteProduct: builder.mutation<{ success: boolean; id?: string }, string>({
      query: (id) => ({
        url: `/products/${encodeURIComponent(id)}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        productTag(id),
        productListTag(),
      ],
    }),
  }),
});

export const {
  useCreateProductMutation,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useSearchProductsQuery,
  useGetFeaturedProductsQuery,
  useGetTrendingProductsQuery,
  useGetNewArrivalsQuery,
  useGetWeeklyBestSellingProductsQuery,
  useGetDiscountProductsQuery,
  useGetWeeklyDiscountProductsQuery,
  useGetProductFiltersQuery,
  useGetProductsByCategoryQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;

export default productsApi;
