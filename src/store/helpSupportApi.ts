import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState as IRootState } from "@/store";

export interface IHelpSupport {
  _id: string;
  content: string;
  updatedAt: string;
}

interface HelpSupport {
  success: boolean;
  statusCode: number;
  message: string;
  data: IHelpSupport;
}

export const helpSupportApi = createApi({
  reducerPath: "helpSupportApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://bigsellv2backend.vercel.app/v1/api",
  }),
  tagTypes: ["helpSupportApi"],
  endpoints: (builder) => ({
    // get
    getHelpSupport: builder.query<IHelpSupport, void>({
      query: () => "/help-support",
      transformResponse: (response: HelpSupport) => response.data,
      providesTags: ["helpSupportApi"],
    }),
  }),
});

export const { useGetHelpSupportQuery } = helpSupportApi;
