import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"; // use /react for hooks
import { RootState as IRootState } from "@/store";

export interface IPaymentPolicy {
  _id: string;
  content: string;
  updatedAt: string;
}

interface PaymentPolicyResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IPaymentPolicy;
}

export const PaymentPolicyApi = createApi({
  reducerPath: "PaymentPolicyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8080/v1/api",
  }),
  tagTypes: ["PaymentPolicy"],
  endpoints: (builder) => ({
    // get
    getPaymentPolicy: builder.query<IPaymentPolicy, void>({
      query: () => "/payment-policy",
      transformResponse: (response: PaymentPolicyResponse) => response.data,
      providesTags: ["PaymentPolicy"],
    }),
  }),
});

export const { useGetPaymentPolicyQuery } = PaymentPolicyApi;
