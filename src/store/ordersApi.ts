import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState as IRootState } from "@/store";

/**
 * Use local API proxy routes to avoid CORS issues
 */
const baseUrl = "/api";

/** Minimal address shape used in orders */
export interface IAddress {
  fullName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

/** Order item shape */
export interface IOrderItem {
  productId?: string; // request uses productId, response uses product or product id
  product?: string;
  name?: string;
  price?: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  thumbnail?: string;
  subtotal?: number;
}

/** Order model (subset of fields returned by backend) */
export interface IOrder {
  _id?: string;
  orderNumber?: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  items: IOrderItem[];
  subtotal?: number;
  shippingCost?: number;
  tax?: number;
  discount?: number;
  totalAmount?: number;
  status?: string;
  paymentStatus?: string;
  shippingAddress?: IAddress;
  billingAddress?: IAddress;
  paymentInfo?: Record<string, any>;
  shippingMethod?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  orderDate?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  cancelReason?: string;
  returnReason?: string;
}

/** Response wrapper */
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: T;
  meta?: any;
}

/** Helper to normalize */
const normalizeToArray = <T>(payload: T | T[] | undefined): T[] => {
  if (!payload) return [];
  return Array.isArray(payload) ? payload : [payload];
};

/**
 * ordersApi - RTK Query service for orders endpoints
 */
export const ordersApi = createApi({
  reducerPath: "ordersApi",
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
  tagTypes: ["Orders"],
  endpoints: (builder) => ({
    // Create a new order (public/user)
    createOrder: builder.mutation<
      IOrder,
      Partial<IOrder> & { items: IOrderItem[] }
    >({
      query: (order) => ({
        url: "/orders",
        method: "POST",
        body: order,
      }),
      transformResponse: (response: ApiResponse<IOrder>) =>
        response?.data as IOrder,
      invalidatesTags: [{ type: "Orders", id: "LIST" }],
    }),

    // Admin: get all orders with filters
    getOrders: builder.query<
      IOrder[],
      {
        page?: number;
        limit?: number;
        status?: string;
        paymentStatus?: string;
        dateFrom?: string;
        dateTo?: string;
        sort?: string;
      } | void
    >({
      query: (params) => {
        if (!params) return "/orders";
        const search = new URLSearchParams();
        if (params.page) search.set("page", String(params.page));
        if (params.limit) search.set("limit", String(params.limit));
        if (params.status) search.set("status", params.status);
        if (params.paymentStatus)
          search.set("paymentStatus", params.paymentStatus);
        if (params.dateFrom) search.set("dateFrom", params.dateFrom);
        if (params.dateTo) search.set("dateTo", params.dateTo);
        if (params.sort) search.set("sort", params.sort);
        return `/orders?${search.toString()}`;
      },
      transformResponse: (response: ApiResponse<IOrder | IOrder[]>) =>
        normalizeToArray(response?.data),
      providesTags: (result) =>
        result && result.length
          ? [
              { type: "Orders" as const, id: "LIST" },
              ...result.map((r) => ({
                type: "Orders" as const,
                id: r._id ?? "UNKNOWN",
              })),
            ]
          : [{ type: "Orders" as const, id: "LIST" }],
    }),

    // Get current user's orders
    getMyOrders: builder.query<
      IOrder[],
      {
        page?: number;
        limit?: number;
        status?: string;
        paymentStatus?: string;
      } | void
    >({
      query: (params) => {
        const base = "/orders/my-orders";
        if (!params) return base;
        const q = new URLSearchParams();
        if (params.page) q.set("page", String(params.page));
        if (params.limit) q.set("limit", String(params.limit));
        if (params.status) q.set("status", params.status);
        if (params.paymentStatus) q.set("paymentStatus", params.paymentStatus);
        return `${base}?${q.toString()}`;
      },
      transformResponse: (response: ApiResponse<IOrder | IOrder[]>) =>
        normalizeToArray(response?.data),
      providesTags: (result) =>
        result && result.length
          ? [
              { type: "Orders" as const, id: "MY_LIST" },
              ...result.map((r) => ({
                type: "Orders" as const,
                id: r._id ?? "UNKNOWN",
              })),
            ]
          : [{ type: "Orders" as const, id: "MY_LIST" }],
    }),

    // Get single order by ID
    getOrderById: builder.query<IOrder | undefined, string>({
      query: (id) => `/orders/${encodeURIComponent(id)}`,
      transformResponse: (response: ApiResponse<IOrder | IOrder[]>) => {
        const arr = normalizeToArray(response?.data);
        return arr.length ? arr[0] : undefined;
      },
      providesTags: (_result, _error, id) => [{ type: "Orders", id }],
    }),

    // Admin: update order status (confirm, shipped, delivered, etc.)
    updateOrderStatus: builder.mutation<
      IOrder,
      {
        id: string;
        status: string;
        note?: string;
        trackingNumber?: string;
        estimatedDelivery?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/orders/${encodeURIComponent(id)}/status`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<IOrder>) =>
        response?.data as IOrder,
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Orders", id },
        { type: "Orders", id: "LIST" },
      ],
    }),

    // Cancel order (user or admin depending on server)
    cancelOrder: builder.mutation<IOrder, { id: string; reason: string }>({
      query: ({ id, ...body }) => ({
        url: `/orders/${encodeURIComponent(id)}/cancel`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<IOrder>) =>
        response?.data as IOrder,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Orders", id },
        { type: "Orders", id: "LIST" },
      ],
    }),

    // Return order
    returnOrder: builder.mutation<IOrder, { id: string; reason: string }>({
      query: ({ id, ...body }) => ({
        url: `/orders/${encodeURIComponent(id)}/return`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<IOrder>) =>
        response?.data as IOrder,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Orders", id },
        { type: "Orders", id: "LIST" },
      ],
    }),

    // Admin: update payment status
    updatePayment: builder.mutation<
      IOrder,
      {
        id: string;
        paymentStatus: string;
        transactionId?: string;
        paymentDate?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/orders/${encodeURIComponent(id)}/payment`,
        method: "PUT",
        body,
      }),
      transformResponse: (response: ApiResponse<IOrder>) =>
        response?.data as IOrder,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Orders", id },
        { type: "Orders", id: "LIST" },
      ],
    }),

    // Admin: get order summary/statistics
    getOrderSummary: builder.query<
      {
        totalOrders: number;
        pendingOrders: number;
        completedOrders: number;
        totalRevenue: number;
      },
      void
    >({
      query: () => "/orders/summary",
      transformResponse: (response: ApiResponse<any>) => response?.data,
      providesTags: [{ type: "Orders", id: "SUMMARY" }],
    }),
  }),
});

/** Export hooks */
export const {
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
  useReturnOrderMutation,
  useUpdatePaymentMutation,
  useGetOrderSummaryQuery,
} = ordersApi;

export default ordersApi;
