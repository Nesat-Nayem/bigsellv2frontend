import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface IBlogs {
  _id: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  image: string; // only string URL
  category: string;
  createdAt: string;
  updatedAt: string;
}

interface BlogsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IBlogs[]; // array of blogs
}

interface SingleBlogResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IBlogs; // single blog
}

export const blogsApi = createApi({
  reducerPath: "blogsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/v1/api",
    // prepareHeaders: (headers, { getState }) => {...} // optional auth
  }),
  tagTypes: ["blogs"],
  endpoints: (builder) => ({
    getBlogs: builder.query<IBlogs[], void>({
      query: () => "/blogs",
      transformResponse: (response: BlogsResponse) => response.data,
      providesTags: ["blogs"],
    }),
    getBlogById: builder.query<IBlogs, string>({
      query: (id) => `/blogs/${id}`,
      transformResponse: (response: SingleBlogResponse) => response.data,
      providesTags: ["blogs"],
    }),
  }),
});

export const { useGetBlogsQuery, useGetBlogByIdQuery } = blogsApi;
