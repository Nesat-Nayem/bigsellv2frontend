import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"; // Use /react for hooks
import { RootState as IRootState } from "@/store";

export interface ISiteSecurity {
  _id: string;
  content: string;
  updatedAt: string;
}

interface SiteSecurityResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ISiteSecurity;
}

export const SiteSecurityApi = createApi({
  reducerPath: "SiteSecurity",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://bigsellv2backend.vercel.app/v1/api",
  }),
  tagTypes: ["SiteSecurity"],
  endpoints: (builder) => ({
    // get
    getSiteSecurity: builder.query<ISiteSecurity, void>({
      query: () => "/site-security",
      transformResponse: (response: SiteSecurityResponse) => response.data,
      providesTags: ["SiteSecurity"],
    }),
  }),
});

export const { useGetSiteSecurityQuery } = SiteSecurityApi;
