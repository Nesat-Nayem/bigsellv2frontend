// src/services/cartApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState as IRootState } from "@/store";
import type { ApiResponse } from "./productApi"; // reuse ApiResponse if exported, else redefine

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080/v1/api";

/** Cart item with optional populated product */
export interface ICartProduct {
  _id?: string;
  name?: string;
  price?: number;
  images?: string[];
  thumbnail?: string;
  stock?: number;
  colors?: string[];
  sizes?: string[];
  // other product fields as needed
}

export interface ICartItem {
  product: string | ICartProduct;
  quantity: number;
  price?: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ICart {
  _id?: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  items?: ICartItem[];
  totalItems?: number;
  totalPrice?: number;
  itemCount?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Request bodies */
export interface AddToCartReq {
  productId: string;
  quantity?: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface UpdateCartItemReq {
  quantity?: number;
  selectedColor?: string;
  selectedSize?: string;
}

/** Response wrapper (reuse existing ApiResponse from productsApi if available) */
// export interface ApiResponse<T = any> {
//   success: boolean;
//   statusCode: number;
//   message?: string;
//   data?: T;
// }

type CartTag = { type: "Cart"; id: string };
const cartTag = (id = "LIST"): CartTag => ({ type: "Cart", id });

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as IRootState;
      const token = (state as any)?.auth?.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    // GET /cart?populate=true|false
    getCart: builder.query<ICart | undefined, { populate?: string } | void>({
      query: (arg) => {
        const populate = arg?.populate;
        const q = populate ? `?populate=${encodeURIComponent(populate)}` : "";
        return {
          url: `/cart${q}`,
          method: "GET",
        };
      },
      transformResponse: (response: ApiResponse<ICart>) => response?.data,
      providesTags: (result) =>
        result ? [cartTag(result._id ?? "LIST")] : [cartTag()],
    }),

    // POST /cart/add
    addToCart: builder.mutation<ICart | undefined, AddToCartReq>({
      query: (body) => ({
        url: "/cart/add",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiResponse<ICart>) => response?.data,
      invalidatesTags: (_result, _error, _arg) => [cartTag()],
    }),

    // PUT /cart/item/{productId}
    updateCartItem: builder.mutation<
      ICart | undefined,
      { productId: string; updates: UpdateCartItemReq }
    >({
      query: ({ productId, updates }) => ({
        url: `/cart/item/${encodeURIComponent(productId)}`,
        method: "PUT",
        body: updates,
      }),
      transformResponse: (response: ApiResponse<ICart>) => response?.data,
      invalidatesTags: (_result, _error, { productId }) => [
        cartTag(),
        cartTag(productId),
      ],
    }),

    // DELETE /cart/item/{productId}?selectedColor=...&selectedSize=...
    removeCartItem: builder.mutation<
      ICart | undefined,
      { productId: string; selectedColor?: string; selectedSize?: string }
    >({
      query: ({ productId, selectedColor, selectedSize }) => {
        const params = new URLSearchParams();
        if (selectedColor) params.set("selectedColor", selectedColor);
        if (selectedSize) params.set("selectedSize", selectedSize);
        const qs = params.toString() ? `?${params.toString()}` : "";
        return {
          url: `/cart/item/${encodeURIComponent(productId)}${qs}`,
          method: "DELETE",
        };
      },
      transformResponse: (response: ApiResponse<ICart>) => response?.data,
      invalidatesTags: (_result, _error, { productId }) => [
        cartTag(),
        cartTag(productId),
      ],
    }),

    // DELETE /cart/clear
    clearCart: builder.mutation<{ success?: boolean } | undefined, void>({
      query: () => ({
        url: "/cart/clear",
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<any>) => response?.data,
      invalidatesTags: () => [cartTag()],
    }),

    // GET /cart/summary
    getCartSummary: builder.query<
      | { totalItems?: number; totalPrice?: number; itemCount?: number }
      | undefined,
      void
    >({
      query: () => ({
        url: "/cart/summary",
        method: "GET",
      }),
      transformResponse: (response: ApiResponse<any>) => response?.data,
      providesTags: () => [cartTag("SUMMARY")],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useGetCartSummaryQuery,
} = cartApi;

export default cartApi;
