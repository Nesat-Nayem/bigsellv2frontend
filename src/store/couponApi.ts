import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState as IRootState } from "@/store";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/v1/api";

export interface ApplyCouponItem {
  productId: string;
  quantity: number;
}

export interface ApplyCouponResponse {
  valid: boolean;
  discountAmount: number;
  code?: string;
  discountType?: "percentage" | "flat";
  eligibleSubtotal?: number;
  subtotal?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
}

export const couponApi = createApi({
  reducerPath: "couponApi",
  baseQuery: fetchBaseQuery({
    credentials: "include",
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as IRootState;
      const token = (state as any)?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    apply: builder.mutation<ApplyCouponResponse, { code: string; items: ApplyCouponItem[] }>(
      {
        query: (body) => ({
          url: "/coupons/apply",
          method: "POST",
          body,
        }),
        transformResponse: (response: ApiResponse<ApplyCouponResponse>) =>
          (response?.data as ApplyCouponResponse) || { valid: false, discountAmount: 0 },
      }
    ),
  }),
});

export const { useApplyMutation } = couponApi;
export default couponApi;
