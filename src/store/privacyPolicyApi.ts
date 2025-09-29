import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"; // use /react for hooks
import { RootState as IRootState } from "@/store";

export interface IPrivacyPolicy {
  _id: string;
  content: string;
  updatedAt: string;
}

interface PrivacyPolicyResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IPrivacyPolicy;
}

export const privacyPolicyApi = createApi({
  reducerPath: "privacyPolicyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://bigsellv2backend.vercel.app/v1/api",
  }),
  tagTypes: ["privacyPolicy"],
  endpoints: (builder) => ({
    // get privacy policy
    getPrivacyPolicy: builder.query<IPrivacyPolicy, void>({
      query: () => "/privacy-policy",
      transformResponse: (response: PrivacyPolicyResponse) => response.data,
      providesTags: ["privacyPolicy"],
    }),
  }),
});

export const { useGetPrivacyPolicyQuery } = privacyPolicyApi;
