import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState as IRootState } from "@/store";

/**
 * Base API URL (reuse env var)
 */
const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080/v1/api";

/** Payment refund shape */
export interface IPaymentRefund {
  refundId?: string;
  amount: number;
  reason?: string;
  status?: string;
  processedAt?: string;
  refundedBy?: string;
}

/** Minimal order reference inside payment */
export interface IPaymentOrderRef {
  _id?: string;
  orderNumber?: string;
  totalAmount?: number;
  status?: string;
}

/** User reference inside payment */
export interface IPaymentUserRef {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
}

/** Gateway response - flexible */
export interface IGatewayResponse {
  id?: string | number;
  entity?: string;
  amount?: number;
  currency?: string;
  status?: string;
  order_id?: string;
  method?: string;
  captured?: boolean;
  email?: string;
  contact?: string;
  created_at?: number | string;
  [k: string]: any;
}

/** Main payment model (subset) */
export interface IPayment {
  _id?: string;
  paymentId?: string;
  orderId?: string | IPaymentOrderRef;
  userId?: string | IPaymentUserRef;
  amount: number;
  currency?: string;
  amountRefunded?: number;
  method?: string;
  status?: string; // completed | failed | pending | refunded
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  gatewayResponse?: IGatewayResponse;
  description?: string;
  notes?: Record<string, any>;
  customerEmail?: string;
  customerPhone?: string;
  refunds?: IPaymentRefund[];
  failureReason?: string;
  errorCode?: string;
  errorDescription?: string;
  initiatedAt?: string;
  completedAt?: string;
  failedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Generic API response wrapper */
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  meta?: any;
}

/** Normalize helper */
const normalizeToArray = <T>(payload: T | T[] | undefined): T[] => {
  if (!payload) return [];
  return Array.isArray(payload) ? payload : [payload];
};

/**
 * paymentsApi - RTK Query service for payments endpoints
 */
export const paymentsApi = createApi({
  reducerPath: "paymentsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as IRootState;
      const token = (state as any)?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Payments"],
  endpoints: (builder) => ({
    // Admin: Get all payments (supports paging + filters)
    getPayments: builder.query<
      IPayment[],
      {
        page?: number;
        limit?: number;
        status?: string;
        method?: string;
        orderId?: string;
        dateFrom?: string;
        dateTo?: string;
        sort?: string;
      } | void
    >({
      query: (params) => {
        if (!params) return "/payments";
        const q = new URLSearchParams();
        if (params.page) q.set("page", String(params.page));
        if (params.limit) q.set("limit", String(params.limit));
        if (params.status) q.set("status", params.status);
        if (params.method) q.set("method", params.method);
        if (params.orderId) q.set("orderId", params.orderId);
        if (params.dateFrom) q.set("dateFrom", params.dateFrom);
        if (params.dateTo) q.set("dateTo", params.dateTo);
        if (params.sort) q.set("sort", params.sort);
        return `/payments?${q.toString()}`;
      },
      transformResponse: (response: ApiResponse<IPayment | IPayment[]>) =>
        normalizeToArray(response?.data),
      providesTags: (result) =>
        result && result.length
          ? [
              { type: "Payments" as const, id: "LIST" },
              ...result.map((p) => ({
                type: "Payments" as const,
                id: p._id ?? "UNKNOWN",
              })),
            ]
          : [{ type: "Payments" as const, id: "LIST" }],
    }),

    // Get current user's payments
    getMyPayments: builder.query<
      IPayment[],
      {
        page?: number;
        limit?: number;
        status?: string;
        method?: string;
        orderId?: string;
      } | void
    >({
      query: (params) => {
        const base = "/payments/my-payments";
        if (!params) return base;
        const q = new URLSearchParams();
        if (params.page) q.set("page", String(params.page));
        if (params.limit) q.set("limit", String(params.limit));
        if (params.status) q.set("status", params.status);
        if (params.method) q.set("method", params.method);
        if (params.orderId) q.set("orderId", params.orderId);
        return `${base}?${q.toString()}`;
      },
      transformResponse: (response: ApiResponse<IPayment | IPayment[]>) =>
        normalizeToArray(response?.data),
      providesTags: (result) =>
        result && result.length
          ? [
              { type: "Payments" as const, id: "MY_LIST" },
              ...result.map((p) => ({
                type: "Payments" as const,
                id: p._id ?? "UNKNOWN",
              })),
            ]
          : [{ type: "Payments" as const, id: "MY_LIST" }],
    }),

    // Get single payment by id
    getPaymentById: builder.query<IPayment | undefined, string>({
      query: (id) => `/payments/${encodeURIComponent(id)}`,
      transformResponse: (response: ApiResponse<IPayment | IPayment[]>) => {
        const arr = normalizeToArray(response?.data);
        return arr.length ? arr[0] : undefined;
      },
      providesTags: (_result, _error, id) => [{ type: "Payments", id }],
    }),

    // Verify Razorpay payment (client -> server -> verify signature)
    verifyPayment: builder.mutation<
      {
        paymentId?: string;
        status?: string;
        razorpayPaymentId?: string;
        amount?: number;
      },
      {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }
    >({
      query: (payload) => ({
        url: "/payments/verify",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ApiResponse<any>) => response?.data,
      invalidatesTags: [{ type: "Payments", id: "LIST" }],
    }),

    // Refund payment (Admin only)
    refundPayment: builder.mutation<
      IPayment,
      {
        id: string;
        amount: number;
        reason?: string;
        notes?: Record<string, any>;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/payments/${encodeURIComponent(id)}/refund`,
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<IPayment>) =>
        response?.data as IPayment,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Payments", id },
        { type: "Payments", id: "LIST" },
      ],
    }),

    // Razorpay webhook endpoint (server forwards events here; client rarely calls)
    processWebhook: builder.mutation<{ success: boolean }, any>({
      query: (payload) => ({
        url: "/payments/webhook",
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: ApiResponse<any>) =>
        response ?? { success: true },
      // webhooks usually change payments; invalidate summary/list to refresh admin dashboards
      invalidatesTags: [
        { type: "Payments", id: "LIST" },
        { type: "Payments", id: "SUMMARY" },
      ],
    }),

    // Payment summary (Admin only)
    getPaymentSummary: builder.query<
      {
        totalPayments: number;
        totalAmount: number;
        successfulPayments: number;
        failedPayments: number;
        pendingPayments: number;
        totalRefunded: number;
        methodBreakdown?: { method: string; count: number; amount: number }[];
      },
      { dateFrom?: string; dateTo?: string; userId?: string } | void
    >({
      query: (params) => {
        if (!params) return "/payments/summary";
        const q = new URLSearchParams();
        if (params.dateFrom) q.set("dateFrom", params.dateFrom);
        if (params.dateTo) q.set("dateTo", params.dateTo);
        if (params.userId) q.set("userId", params.userId);
        return `/payments/summary?${q.toString()}`;
      },
      transformResponse: (response: ApiResponse<any>) => response?.data,
      providesTags: [{ type: "Payments", id: "SUMMARY" }],
    }),
  }),
});

/** Export hooks */
export const {
  useGetPaymentsQuery,
  useGetMyPaymentsQuery,
  useGetPaymentByIdQuery,
  useVerifyPaymentMutation,
  useRefundPaymentMutation,
  useProcessWebhookMutation,
  useGetPaymentSummaryQuery,
} = paymentsApi;

export default paymentsApi;
