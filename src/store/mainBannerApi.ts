import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface IMainBanner {
  _id: string;
  title: string;
  image: string;
}

interface MainBannerResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IMainBanner | IMainBanner[] | null; // allow null just in case
}

export const mainBannerApi = createApi({
  reducerPath: "mainBannerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/v1/api",
  }),
  tagTypes: ["mainBanner"],
  endpoints: (builder) => ({
    getMainBanner: builder.query<IMainBanner[], void>({
      query: () => "/banners",
      transformResponse: (response: MainBannerResponse): IMainBanner[] => {
        if (!response?.data) return [];
        return Array.isArray(response.data) ? response.data : [response.data];
      },
      providesTags: ["mainBanner"],
    }),
  }),
});

export const { useGetMainBannerQuery } = mainBannerApi;
