import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"; // use /react for hooks
import { RootState as IRootState } from "@/store";

export interface IVendorPolicy {
  _id: string;
  content: string;
  updatedAt: string;
}

interface VendorPolicyResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IVendorPolicy;
}

export const vendorPolicyApi = createApi({
  reducerPath: "vendorPolicyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/v1/api",
  }),
  tagTypes: ["vendorPolicy"],
  endpoints: (builder) => ({
    // get privacy policy
    getVendorPolicy: builder.query<IVendorPolicy, void>({
      query: () => "/vendor-policy",
      transformResponse: (response: VendorPolicyResponse) => response.data,
      providesTags: ["vendorPolicy"],
    }),
  }),
});

export const { useGetVendorPolicyQuery } = vendorPolicyApi;
