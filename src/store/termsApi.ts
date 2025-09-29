import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"; // use /react for hooks
import { RootState as IRootState } from "@/store";

export interface ITerms {
  _id: string;
  content: string;
  updatedAt: string;
}

interface TermsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ITerms;
}

export const TermsApi = createApi({
  reducerPath: "termsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://bigsellv2backend.vercel.app/v1/api",
  }),
  tagTypes: ["terms"],
  endpoints: (builder) => ({
    // get
    getTerms: builder.query<ITerms, void>({
      query: () => "/terms-conditions",
      transformResponse: (response: TermsResponse) => response.data,
      providesTags: ["terms"],
    }),
  }),
});

export const { useGetTermsQuery } = TermsApi;
