import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"; // Use /react for hooks
import { RootState as IRootState } from "@/store";

export interface IShippingPolicy {
  _id: string;
  content: string;
  updatedAt: string;
}

interface ShippingPolicyResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IShippingPolicy;
}

export const ShippingPolicyApi = createApi({
  reducerPath: "ShippingPolicyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/v1/api",
  }),
  tagTypes: ["ShippingPolicy"],
  endpoints: (builder) => ({
    // get
    getShippingPolicy: builder.query<IShippingPolicy, void>({
      query: () => "/shipping-policy",
      transformResponse: (response: ShippingPolicyResponse) => response.data,
      providesTags: ["ShippingPolicy"],
    }),
  }),
});

export const { useGetShippingPolicyQuery } = ShippingPolicyApi;
