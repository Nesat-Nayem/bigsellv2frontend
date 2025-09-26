import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface IHeaderBanner {
  _id: string;
  title: string;
  image: string;
}

interface HeaderBannerResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IHeaderBanner | IHeaderBanner[]; // allow both
}

export const headerBannerApi = createApi({
  reducerPath: "headerBanner",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://bigsellv2backend.vercel.app/v1/api",
  }),
  tagTypes: ["headerBanner"],
  endpoints: (builder) => ({
    getHeaderBanner: builder.query<IHeaderBanner[], void>({
      query: () => "/header-banners",
      transformResponse: (response: HeaderBannerResponse) => {
        if (!response?.data) return [];
        return Array.isArray(response.data) ? response.data : [response.data]; // normalize always to array
      },
      providesTags: ["headerBanner"],
    }),
  }),
});

export const { useGetHeaderBannerQuery } = headerBannerApi;
