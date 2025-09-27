import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ICategory {
  _id: string;
  title: string;
  image: string;
}

interface CategoryResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ICategory | ICategory[];
}

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://bigsellv2backend.vercel.app/v1/api", //ProdApis:- https://bigsellv2backend.vercel.app/
  }),
  tagTypes: ["category"],
  endpoints: (builder) => ({
    // Create new category
    createCategory: builder.mutation<ICategory, Partial<ICategory>>({
      query: (newCategory) => ({
        url: "/categories",
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: ["category"],
    }),

    // Get all categories
    getCategories: builder.query<ICategory[], void>({
      query: () => "/categories",
      transformResponse: (response: CategoryResponse) => {
        if (!response?.data) return [];
        return Array.isArray(response.data) ? response.data : [response.data];
      },
      providesTags: ["category"],
    }),

    // Get category by ID
    getCategoryById: builder.query<ICategory, string>({
      query: (id) => `/categories/${id}`,
      transformResponse: (response: CategoryResponse) => {
        if (!response?.data) return {} as ICategory;
        return Array.isArray(response.data) ? response.data[0] : response.data;
      },
      providesTags: (_result, _error, id) => [{ type: "category", id }],
    }),

    // Update category
    updateCategory: builder.mutation<
      ICategory,
      { id: string; updates: Partial<ICategory> }
    >({
      query: ({ id, updates }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["category"],
    }),

    // Delete category
    deleteCategory: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["category"],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
